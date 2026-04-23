from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from state import sessions
from schemas import (
        User, PassengerSignup, DriverSignup, 
        StaffSignup, AdminSignup, SuperAdminSignup
        )
import uuid
import time

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Helpers
async def verify_credentials(conn, details: User):
    """Checks AppUser table and returns user_id if valid, otherwise returns a 401 exception"""
    query = "select user_id, password from appuser where name = $1"
    row = await conn.fetchrow(query, details.name)
    if not row or row["password"] != details.password:
        raise HTTPException(status_code=401, detail="invalid credentials")
    return row["user_id"]

def create_session(user_id: int, role: str):
    """Generates and stores a user session"""
    sessionKey = str(uuid.uuid4())
    sessions[sessionKey] = {
            "userId": user_id,
            "role": role,
            "expiry": time.time() + 3600
            }
    print("Session created: ", sessions[sessionKey])
    return sessionKey


# Passenger
@router.post("/signup/passenger")
async def signUpPassenger(details: PassengerSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        query_user = "insert into appuser (name, password) values ($1, $2) returning user_id"
        userId = await conn.fetchval(query_user, details.name, details.password)
        query_pass = "insert into passenger (passenger_id, cnic, phone_no) values ($1, $2, $3)"
        await conn.execute(query_pass, userId, details.cnic, details.phoneNo)
        return {"Status": "Passenger sign up complete", "userId": userId}

@router.post("/login/passenger")
async def loginPassenger(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        # Verify if user exists in the passenger table
        is_passenger = await conn.fetchval("select 1 from passenger where passenger_id = $1", userId)
        if not is_passenger:
            raise HTTPException(status_code=403, detail="user is not a passenger")

        s_key = create_session(userId, "passenger")
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId}


# Driver
@router.post("/signup/driver")
async def signUpDriver(details: DriverSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        query_user = "insert into appuser (name, password) values ($1, $2) returning user_id"
        userId = await conn.fetchval(query_user, details.name, details.password)
        query_driver = "insert into driver (driver_id, cnic, phone_no) values ($1, $2, $3)"
        await conn.execute(query_driver, userId, details.cnic, details.phoneNo)
        return {"Status": "Driver sign up complete", "userId": userId}

@router.post("/login/driver")
async def loginDriver(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        # Verify role exists in the driver table
        is_driver = await conn.fetchval("select 1 from driver where driver_id = $1", userId)
        if not is_driver:
            raise HTTPException(status_code=403, detail="user is not a driver")

        s_key = create_session(userId, "driver")
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId}


# Staff, admin, superadmin
@router.post("/signup/staff")
async def signUpStaff(details: StaffSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        query_user = "insert into appuser (name, password) values ($1, $2) returning user_id"
        userId = await conn.fetchval(query_user, details.name, details.password)
        query_staff = "insert into staff (staff_id, cnic, phone_no, role) values ($1, $2, $3, 'support')"
        await conn.execute(query_staff, userId, details.cnic, details.phoneNo)
        return {"Status": "Staff sign up complete", "userId": userId}

@router.post("/signup/admin")
async def signUpAdmin(details: AdminSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        query_user = "insert into appuser (name, password) values ($1, $2) returning user_id"
        userId = await conn.fetchval(query_user, details.name, details.password)
        query_staff = "insert into staff (staff_id, cnic, phone_no, role) values ($1, $2, $3, 'admin')"
        await conn.execute(query_staff, userId, details.cnic, details.phoneNo)
        return {"Status": "Admin sign up complete", "userId": userId}

@router.post("/signup/superadmin")
async def signUpSuperAdmin(details: SuperAdminSignup, db = Depends(get_db)):
    async with db.acquire() as conn:
        query_user = "insert into appuser (name, password) values ($1, $2) returning user_id"
        userId = await conn.fetchval(query_user, details.name, details.password)
        # Superadmin typically shares the 'admin' role in the staff table
        query_staff = "insert into staff (staff_id, cnic, phone_no, role) values ($1, $2, $3, 'admin')"
        await conn.execute(query_staff, userId, details.cnic, details.phoneNo)
        return {"Status": "SuperAdmin sign up complete", "userId": userId}

@router.post("/login/staff")
async def loginStaff(details: User, db = Depends(get_db)):
    async with db.acquire() as conn:
        userId = await verify_credentials(conn, details)
        # Get specific role from staff table
        staff_row = await conn.fetchrow("select role from staff where staff_id = $1", userId)
        if not staff_row:
            raise HTTPException(status_code=403, detail="user is not a staff member")

        role = staff_row["role"]
        s_key = create_session(userId, role)
        return {"Status": "Login complete", "sessionKey": s_key, "userId": userId, "role": role}
