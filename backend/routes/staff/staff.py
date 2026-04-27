from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from typing import Optional
from schemas import TicketUpdate

router = APIRouter(prefix="/staff", tags=["Staff"])

# Rides

@router.get("/rides")
async def staffViewRides(sessionKey: str, searchStr: Optional[str] = None, status: Optional[str] = None, minFare: Optional[float] = None, maxFare: Optional[float] = None,db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select t.trip_id, t.pickup_loc, t.dropoff_loc, t.start_time, t.end_time, t.is_deleted,
                    p.actual_fare, u_p.name as passenger_name, u_d.name as driver_name
            from trip t
            left join payment p on t.trip_id = p.trip_id
            left join appuser u_p on t.passenger_id = u_p.user_id
            left join appuser u_d on t.driver_id = u_d.user_id
        """
        params = []
        counter = 1

        # search
        if searchStr:
            query += f" and (t.trip_id::text ilike ${counter} or u_p.name ilike ${counter} or u_d.name ilike ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        # filters
        if status == "completed":
            query += " and t.end_time is not null"
        elif status == "pending":
            query += " and t.end_time is null"

        if minFare is not None:
            query += f" and p.actual_fare >= ${counter}"
            params.append(minFare)
            counter += 1

        if maxFare is not None:
            query += f" and p.actual_fare <= ${counter}"
            params.append(maxFare)
            counter += 1

        # ordering
        query += " order by t.inserted_at desc"
        rows = await conn.fetch(query, *params)

        # Point conversion
        results = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]

            # format data
            ride_status = "pending"
            if row["start_time"]: ride_status = "in progress"
            if row["end_time"]: ride_status = "completed"
            if row["is_deleted"]: ride_status = "cancelled"

            results.append({
                "tripId": row["trip_id"],
                "passenger": row["passenger_name"],
                "driver": row["driver_name"],
                "status": ride_status,
                "pickup": {"x": p_loc.x, "y": p_loc.y} if p_loc else None,
                "dropoff": {"x": d_loc.x, "y": d_loc.y} if d_loc else None,
                "fare": float(row["actual_fare"]) if row["actual_fare"] else 0.0
                })
        return results


@router.get("/rides/{id}")
async def staffViewRideDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select
                t.trip_id,
                t.passenger_id, p.name passenger_name,
                t.driver_id, d.name driver_name,
                t.start_time, t.end_time,
                t.pickup_loc, t.dropoff_loc,
                t.estimated_dist, t.actual_dist
            from trip t
            join appuser p on t.passenger_id = p.user_id
            left join appuser d on t.driver_id = d.user_id
            where t.trip_id = $1 and t.is_deleted = false
        """
        row = await conn.fetchrow(query, id)
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
                    "estimated": float(row["estimated_dist"]) if row["estimated_dist"] else 0.0, 
                    "actual": float(row["actual_dist"]) if row["actual_dist"] else None
                    }
                }


# Tickets
@router.get("/tickets")
async def viewAllTickets( sessionKey: str,  searchStr: Optional[str] = None,  status: Optional[str] = None,  db = Depends(get_db) ):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = "select * from ticket where is_deleted = false"
        params = []
        counter = 1

        if searchStr:
            query += f" and (content ilike ${counter} or ticket_id::text ilike ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        if status:
            query += f" and status = ${counter}"
            params.append(status)
            counter += 1

        query += " order by inserted_at desc"
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
        query = """
            select 
            ticket_id, trip_id, staff_id, content, inserted_at, status, is_deleted
            from ticket where ticket_id = $1 and is_deleted = false
        """
        row = await conn.fetchrow(query, id)
        if not row:
            raise HTTPException(status_code=404, detail="ticket not found")

        ticket = dict(row)
        ticket["inserted_at"] = str(ticket["inserted_at"])
        return ticket

@router.patch("/tickets/{id}/resolve")
async def resolveTicket(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        result = await conn.execute(
                "update ticket set status = 'resolved', updated_at = now() where ticket_id = $1 and is_deleted = false", 
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="ticket not found")
        return {"ticketId": id, "status": "Resolved"}


@router.delete("/tickets/{id}")
async def deleteTicket(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        result = await conn.execute(
                "update ticket set is_deleted = true, updated_at = now() where ticket_id = $1", 
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="ticket not found")
        return {"id": id, "status": "deleted"}


@router.patch("/tickets/{id}")
async def editTicketDetails(sessionKey: str, id: int, updates: TicketUpdate, db = Depends(get_db)):
    """Modified to use TicketUpdate schema for validation"""
    validate_session(sessionKey)

    async with db.acquire() as conn:
        # Use coalesce for partial updates
        query = """
            update ticket 
            set content = coalesce($1, content),
                status = coalesce($2, status),
                updated_at = now()
            where ticket_id = $3 and is_deleted = false
        """
        result = await conn.execute(
                query, 
                updates.content, 
                updates.status, 
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="ticket not found")
        return {"ticketId": id, "updates": updates.dict(exclude_unset=True)}


# Call
@router.get("/passengers/call")
async def staffCallPassenger(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select p.phone_no
            from passenger p
            where p.passenger_id = $1 and p.is_deleted = false
        """
        val = await conn.fetchval(query, id)
        if not val:
            raise HTTPException(status_code=404, detail="passenger not found")
        return {"phoneNo": val}

@router.get("/drivers/call")
async def staffCallDriver(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select d.phone_no
            from driver d
            where d.driver_id = $1 and d.is_deleted = false
        """
        val = await conn.fetchval(query, id)
        if not val:
            raise HTTPException(status_code=404, detail="driver not found")
        return {"phoneNo": val}


# Passengers
@router.get("/passengers")
async def viewAllPassengers(sessionKey: str, searchStr: Optional[str] = None, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select p.passenger_id, u.name, p.cnic, p.phone_no, p.inserted_at
            from passenger p
            join appuser u on p.passenger_id = u.user_id
            where p.is_deleted = false
        """
        params = []
        if searchStr:
            query += " and (u.name ilike $1 or p.cnic ilike $1 or p.phone_no ilike $1)"
            params.append(f"%{searchStr}%")

        query += " order by p.inserted_at desc"
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
        query = """
            select p.passenger_id, u.name, p.cnic, p.phone_no
            from passenger p
            join appuser u on p.passenger_id = u.user_id
            where p.passenger_id = $1 and p.is_deleted = false
        """
        row = await conn.fetchrow(query, id)
        if not row:
            raise HTTPException(status_code=404, detail="passenger not found")
        return dict(row)


# Drivers
@router.get("/drivers")
async def viewAllDrivers(sessionKey: str, searchStr: Optional[str] = None, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select d.driver_id, u.name, d.cnic, d.phone_no, d.inserted_at
            from driver d
            join appuser u on d.driver_id = u.user_id
            where d.is_deleted = false
        """
        params = []
        if searchStr:
            query += " and (u.name ilike $1 or d.cnic ilike $1 or d.phone_no ilike $1)"
            params.append(f"%{searchStr}%")

        query += " order by d.inserted_at desc"
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
        query = """
            select d.driver_id, u.name, d.cnic, d.phone_no,
                    v.make, v.model, v.plate_no, v.engine_no, v.chassis_no
            from driver d
            join appuser u on d.driver_id = u.user_id
            left join vehicle v on d.driver_id = v.driver_id
            where d.driver_id = $1 and d.is_deleted = false
        """
        row = await conn.fetchrow(query, id)
        if not row:
            raise HTTPException(status_code=404, detail="driver not found")
        return dict(row)
