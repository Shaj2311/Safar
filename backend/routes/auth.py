from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from state import sessions, create_session
from schemas import (
        User, PassengerSignup, DriverSignup, 
        StaffSignup, AdminSignup, SuperAdminSignup
        )
import uuid
import time

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_signup_passenger, sp_signup_driver, sp_signup_staff
# Views: v_staff_passenger_list (passenger login), v_driver_public_profile (driver login)
# Triggers: trg_updated_at_* (removed all manual updated_at)
# Transactions: All signups are now atomic via procedures (ghost-user fix)
# ───────────────────────────────────────────────────────────────────

# Helpers
async def verify_credentials(conn, details: User):
    """Checks AppUser table and returns user_id if valid.
    NOTE: Credential verification intentionally kept as direct query
    for security — passwords must never be exposed through a View."""
    query = "select user_id, password from appuser where name = $1"
    row = await conn.fetchrow(query, details.name)
    if not row or row["password"] != details.password:
        raise HTTPException(status_code=401, detail="invalid credentials")
    return row["user_id"]


# Passenger
@router.post("/signup/passenger")
async def signUpPassenger(details: PassengerSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_signup_passenger($1, $2, $3, $4, NULL)",
            details.name, details.password, details.phoneNo, details.cnic
        )
        return {"Status": "Passenger sign up complete", "userId": row[0]}

@router.post("/login/passenger")
async def loginPassenger(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        is_passenger = await conn.fetchval(
            "SELECT 1 FROM v_staff_passenger_list WHERE passenger_id = $1", userId
        )
        if not is_passenger:
            raise HTTPException(status_code=403, detail="user is not a passenger")
        s_key = create_session(userId)
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId}


# Driver
@router.post("/signup/driver")
async def signUpDriver(details: DriverSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_signup_driver($1, $2, $3, $4, NULL)",
            details.name, details.password, details.phoneNo, details.cnic
        )
        return {"Status": "Driver sign up complete", "userId": row[0]}

@router.post("/login/driver")
async def loginDriver(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        is_driver = await conn.fetchval(
            "SELECT 1 FROM v_driver_public_profile WHERE driver_id = $1", userId
        )
        if not is_driver:
            raise HTTPException(status_code=403, detail="user is not a driver")
        s_key = create_session(userId)
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId}


# Staff, admin, superadmin
@router.post("/signup/staff")
async def signUpStaff(details: StaffSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_signup_staff($1, $2, $3, $4, $5, NULL)",
            details.name, details.password, details.phoneNo, details.cnic, 'support'
        )
        return {"Status": "Staff sign up complete", "userId": row[0]}

@router.post("/signup/admin")
async def signUpAdmin(details: AdminSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_signup_staff($1, $2, $3, $4, $5, NULL)",
            details.name, details.password, details.phoneNo, details.cnic, 'admin'
        )
        return {"Status": "Admin sign up complete", "userId": row[0]}

@router.post("/signup/superadmin")
async def signUpSuperAdmin(details: SuperAdminSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_signup_staff($1, $2, $3, $4, $5, NULL)",
            details.name, details.password, details.phoneNo, details.cnic, 'super'
        )
        return {"Status": "SuperAdmin sign up complete", "userId": row[0]}

@router.post("/login/staff")
async def loginStaff(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        staff_row = await conn.fetchrow(
            "SELECT role FROM staff WHERE staff_id = $1 AND is_deleted = false", userId
        )
        if not staff_row:
            raise HTTPException(status_code=403, detail="user is not a staff member")
        role = staff_row["role"]
        s_key = create_session(userId)
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId, "role": role}
