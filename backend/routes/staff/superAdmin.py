from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import StaffCreate, StaffView
from typing import List, Optional, Literal

router = APIRouter(prefix="/super", tags=["Super Admin"])


@router.get("/staff", response_model=List[StaffView])
async def superViewStaff(sessionKey: str, searchStr: Optional[str] = None, role: Optional[Literal['admin', 'support']] = None ,db = Depends(get_db)):
    """Retrieve all active Admin and Support staff, called by super admin"""
    validate_session(sessionKey)

    async with db.acquire() as conn:
        # Base query joining Staff and AppUser
        query = """
            select s.staff_id, u.name, s.cnic, s.phone_no, s.role
            from staff s
            join appuser u on s.staff_id = u.user_id
            where s.is_deleted = false
            and s.role in ('admin', 'support')
        """
        params = []
        counter = 1

        # Search
        if searchStr:
            query += f" and (u.name ilike ${counter} or s.cnic ilike ${counter} or s.phone_no ilike ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        # Role filter
        if role:
            query += f" and s.role = ${counter}"
            params.append(role)
            counter += 1

        # Order by insertion date
        query += " order by s.inserted_at desc"

        rows = await conn.fetch(query, *params)

        # Format results
        return [
                {
                    "staff_id": r["staff_id"],
                    "name": r["name"],
                    "cnic": r["cnic"],
                    "phone_no": r["phone_no"],
                    "role": r["role"]
                    } for r in rows
                ]


@router.post("/staff")
async def superCreateStaff(sessionKey: str, details: StaffCreate, db = Depends(get_db)):
    """Super Admins create new Admin or Support staff accounts."""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        async with conn.transaction():
            new_id = await conn.fetchval(
                    "insert into appuser (name, password) values ($1, $2) returning user_id",
                    details.name, details.password
                    )
            await conn.execute(
                    "insert into staff (staff_id, cnic, phone_no, role) values ($1, $2, $3, $4)",
                    new_id, details.cnic, details.phone_no, details.role
                    )
    return {"status": "Staff created", "role": details.role, "details": details}

@router.delete("/passengers/{id}")
async def superDeletePassenger(sessionKey: str, id: int, db = Depends(get_db)):
    """Wipe a passenger and their core user account from the DB."""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        result = await conn.execute(
                "update passenger set is_deleted = true, updated_at = now() where passenger_id = $1",
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="passenger not found")
    return {"status": "Passenger wiped from DB", "id": id}

@router.delete("/drivers/{id}")
async def superDeleteDriver(sessionKey: str, id: int, db = Depends(get_db)):
    """Wipe a driver, their vehicle records, and core user account from the DB."""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        async with conn.transaction():
            # Soft delete driver
            result = await conn.execute(
                    "update driver set is_deleted = true, updated_at = now() where driver_id = $1",
                    id
                    )
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="driver not found")
            # Soft delete associated vehicle
            await conn.execute(
                    "update vehicle set is_deleted = true, updated_at = now() where driver_id = $1",
                    id
                    )
    return {"status": "Driver wiped from DB", "id": id}

@router.delete("/staff/{id}")
async def superDeleteStaff(sessionKey: str, id: int, db = Depends(get_db)):
    """Wipe a staff member (Admin/Support) from the DB."""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        result = await conn.execute(
                "update staff set is_deleted = true, updated_at = now() where staff_id = $1",
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="staff member not found")
    return {"status": "Staff member wiped from DB", "id": id}

@router.get("/stats")
async def getSystemStats(sessionKey: str, db = Depends(get_db)):
    """High-level overview of total trips, active drivers, and open tickets."""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        stats = await conn.fetchrow("""
            select
                (select count(*) from trip where is_deleted = false) as total_trips,
                (select count(*) from driver where is_deleted = false) as active_drivers,
                (select count(*) from ticket where status = 'open' and is_deleted = false) as open_tickets
        """)
    return {
            "total_trips": stats["total_trips"],
            "active_drivers": stats["active_drivers"],
            "open_tickets": stats["open_tickets"]
            }
