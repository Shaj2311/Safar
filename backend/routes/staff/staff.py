from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from typing import Optional
from schemas import TicketUpdate

router = APIRouter(prefix="/staff", tags=["Staff"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_resolve_ticket, sp_soft_delete_ticket, sp_edit_ticket
# Views: v_staff_ride_list, v_staff_passenger_list, v_staff_driver_detail
# UDFs: fn_get_ride_status (embedded in v_staff_ride_list — status column pre-computed)
# Triggers: trg_updated_at_ticket (removed all manual updated_at from ticket ops)
# ───────────────────────────────────────────────────────────────────

# Rides

@router.get("/rides")
async def staffViewRides(sessionKey: str, searchStr: Optional[str] = None, status: Optional[str] = None, minFare: Optional[float] = None, maxFare: Optional[float] = None, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = "SELECT * FROM v_staff_ride_list WHERE 1=1"
        params = []
        counter = 1

        if searchStr:
            query += f" AND (trip_id::text ILIKE ${counter} OR passenger_name ILIKE ${counter} OR driver_name ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        if status == "completed":
            query += " AND status = 'Completed'"
        elif status == "pending":
            query += " AND status = 'Pending'"

        if minFare is not None:
            query += f" AND actual_fare >= ${counter}"
            params.append(minFare)
            counter += 1

        if maxFare is not None:
            query += f" AND actual_fare <= ${counter}"
            params.append(maxFare)
            counter += 1

        query += " ORDER BY inserted_at DESC"
        rows = await conn.fetch(query, *params)

        results = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]
            results.append({
                "tripId": row["trip_id"],
                "passenger": row["passenger_name"],
                "driver": row["driver_name"],
                "status": row["status"],
                "pickup": {"x": p_loc.x, "y": p_loc.y} if p_loc else None,
                "dropoff": {"x": d_loc.x, "y": d_loc.y} if d_loc else None,
                "fare": float(row["actual_fare"]) if row["actual_fare"] else 0.0
                })
        return results


@router.get("/rides/{id}")
async def staffViewRideDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_ride_summary WHERE trip_id = $1", id)
        if not row:
            raise HTTPException(status_code=404, detail="ride not found")
        p_loc = row["pickup_loc"]
        d_loc = row["dropoff_loc"]
        return {
                "tripId": row["trip_id"],
                "passenger": {"id": row["passenger_id"], "name": row["passenger_name"]},
                "driver": {"id": row["driver_id"], "name": row["driver_name"]} if row["driver_id"] else None,
                "times": {"start": str(row["start_time"]), "end": str(row["end_time"]) if row["end_time"] else None},
                "location": {
                    "pickup": {"x": p_loc.x, "y": p_loc.y} if p_loc else None,
                    "dropoff": {"x": d_loc.x, "y": d_loc.y} if d_loc else None
                    },
                "distance": {
                    "estimated": float(row["distance"]) if row["distance"] else 0.0,
                    "actual": None
                    }
                }


# Tickets
@router.get("/tickets")
async def viewAllTickets(sessionKey: str, searchStr: Optional[str] = None, status: Optional[str] = None, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = "SELECT * FROM ticket WHERE is_deleted = false"
        params = []
        counter = 1

        if searchStr:
            query += f" AND (content ILIKE ${counter} OR ticket_id::text ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        if status:
            query += f" AND status = ${counter}"
            params.append(status)
            counter += 1

        query += " ORDER BY inserted_at DESC"
        rows = await conn.fetch(query, *params)
        return [{
            "ticketId": r["ticket_id"],
            "tripId": r["trip_id"],
            "staffId": r["staff_id"],
            "desc": r["content"],
            "status": r["status"],
            "date": str(r["inserted_at"])
            } for r in rows]


@router.get("/tickets/{id}")
async def viewTicketDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM ticket WHERE ticket_id = $1 AND is_deleted = false", id)
        if not row:
            raise HTTPException(status_code=404, detail="ticket not found")
        ticket = dict(row)
        ticket["inserted_at"] = str(ticket["inserted_at"])
        return ticket

@router.patch("/tickets/{id}/resolve")
async def resolveTicket(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_resolve_ticket($1)", id)
        return {"ticketId": id, "status": "Resolved"}


@router.delete("/tickets/{id}")
async def deleteTicket(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_soft_delete_ticket($1)", id)
        return {"id": id, "status": "deleted"}


@router.patch("/tickets/{id}")
async def editTicketDetails(sessionKey: str, id: int, updates: TicketUpdate, db = Depends(get_db)):
    """Modified to use sp_edit_ticket procedure for partial updates"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute(
            "CALL sp_edit_ticket($1, $2, $3)", id, updates.content, updates.status)
        return {"ticketId": id, "updates": updates.dict(exclude_unset=True)}


# Call
@router.get("/passengers/call")
async def staffCallPassenger(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        val = await conn.fetchval(
            "SELECT phone_no FROM v_staff_passenger_list WHERE passenger_id = $1", id)
        if not val:
            raise HTTPException(status_code=404, detail="passenger not found")
        return {"phoneNo": val}

@router.get("/drivers/call")
async def staffCallDriver(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        val = await conn.fetchval(
            "SELECT phone_no FROM v_staff_driver_detail WHERE driver_id = $1", id)
        if not val:
            raise HTTPException(status_code=404, detail="driver not found")
        return {"phoneNo": val}


# Passengers
@router.get("/passengers")
async def viewAllPassengers(sessionKey: str, searchStr: Optional[str] = None, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = "SELECT * FROM v_staff_passenger_list WHERE 1=1"
        params = []
        if searchStr:
            query += " AND (name ILIKE $1 OR cnic ILIKE $1 OR phone_no ILIKE $1)"
            params.append(f"%{searchStr}%")
        query += " ORDER BY inserted_at DESC"
        rows = await conn.fetch(query, *params)
        return [{
            "passengerId": r["passenger_id"],
            "name": r["name"],
            "cnic": r["cnic"],
            "phone": r["phone_no"],
            "joined": str(r["inserted_at"])
            } for r in rows]


@router.get("/passengers/{id}")
async def viewPassengerDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_staff_passenger_list WHERE passenger_id = $1", id)
        if not row:
            raise HTTPException(status_code=404, detail="passenger not found")
        return dict(row)


# Drivers
@router.get("/drivers")
async def viewAllDrivers(sessionKey: str, searchStr: Optional[str] = None, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = "SELECT driver_id, name, cnic, phone_no, inserted_at FROM v_staff_driver_detail WHERE 1=1"
        params = []
        if searchStr:
            query += " AND (name ILIKE $1 OR cnic ILIKE $1 OR phone_no ILIKE $1)"
            params.append(f"%{searchStr}%")
        query += " ORDER BY inserted_at DESC"
        rows = await conn.fetch(query, *params)
        return [{
            "driverId": r["driver_id"],
            "name": r["name"],
            "phone": r["phone_no"],
            "joined": str(r["inserted_at"])
            } for r in rows]


@router.get("/drivers/{id}")
async def viewDriverDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_staff_driver_detail WHERE driver_id = $1", id)
        if not row:
            raise HTTPException(status_code=404, detail="driver not found")
        return dict(row)
