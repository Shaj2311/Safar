from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import StaffCreate, StaffView
from typing import List, Optional, Literal

router = APIRouter(prefix="/super", tags=["Super Admin"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_super_create_staff, sp_super_delete_passenger, sp_super_delete_driver, sp_super_delete_staff
# Views: v_super_staff_list, v_system_stats
# Triggers: trg_updated_at_* (removed all manual updated_at)
# Transactions: sp_super_create_staff (atomic), sp_super_delete_driver (cascading driver+vehicle)
# ───────────────────────────────────────────────────────────────────

@router.get("/staff", response_model=List[StaffView])
async def superViewStaff(sessionKey: str, searchStr: Optional[str] = None, role: Optional[Literal['admin', 'support']] = None, db = Depends(get_db)):
    """Retrieve all active Admin and Support staff via v_super_staff_list"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = "SELECT * FROM v_super_staff_list WHERE 1=1"
        params = []
        counter = 1

        if searchStr:
            query += f" AND (name ILIKE ${counter} OR cnic ILIKE ${counter} OR phone_no ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        if role:
            query += f" AND role = ${counter}"
            params.append(role)
            counter += 1

        query += " ORDER BY inserted_at DESC"
        rows = await conn.fetch(query, *params)
        return [{
            "staff_id": r["staff_id"], "name": r["name"],
            "cnic": r["cnic"], "phone_no": r["phone_no"], "role": r["role"]
        } for r in rows]


@router.post("/staff")
async def superCreateStaff(sessionKey: str, details: StaffCreate, db = Depends(get_db)):
    """Super Admins create new staff — atomic via sp_super_create_staff"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_super_create_staff($1, $2, $3, $4, $5, NULL)",
            details.name, details.password, details.cnic, details.phone_no, details.role)
    return {"status": "Staff created", "role": details.role, "details": details}

@router.delete("/passengers/{id}")
async def superDeletePassenger(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_super_delete_passenger($1)", id)
    return {"status": "Passenger wiped from DB", "id": id}

@router.delete("/drivers/{id}")
async def superDeleteDriver(sessionKey: str, id: int, db = Depends(get_db)):
    """Cascading delete: driver + vehicle — atomic via sp_super_delete_driver"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_super_delete_driver($1)", id)
    return {"status": "Driver wiped from DB", "id": id}

@router.delete("/staff/{id}")
async def superDeleteStaff(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_super_delete_staff($1)", id)
    return {"status": "Staff member wiped from DB", "id": id}

@router.get("/stats")
async def getSystemStats(sessionKey: str, db = Depends(get_db)):
    """High-level overview via v_system_stats — zero raw SQL"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        stats = await conn.fetchrow("SELECT * FROM v_system_stats")
    return {
            "total_trips": stats["total_trips"],
            "active_drivers": stats["active_drivers"],
            "open_tickets": stats["open_tickets"]
            }
