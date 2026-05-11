from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import PassengerUpdate, DriverUpdate, VehicleUpdate

router = APIRouter(prefix="/users", tags=["User Profiles"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_update_passenger_profile, sp_update_driver_profile, sp_upsert_vehicle
# Views: v_passenger_profile, v_driver_public_profile, v_driver_ratings
# UDFs: fn_average_driver_rating (inside v_driver_public_profile)
# Triggers: trg_updated_at_* (removed all manual updated_at)
# Transactions: sp_update_passenger_profile, sp_update_driver_profile (atomic multi-table)
# ───────────────────────────────────────────────────────────────────

# Passenger
@router.get("/me/passenger/profile")
async def viewPassengerProfile(sessionKey: str, userId: int, db = Depends(get_db)):
    """Passenger views their own profile details and ride history stats"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM v_passenger_profile WHERE user_id = $1", userId)
        if not profile:
            raise HTTPException(status_code=404, detail="Passenger profile not found")
        result = dict(profile)
        result["member_since"] = str(result["member_since"])
        result["avg_rating"] = float(result["avg_rating"]) if result["avg_rating"] else 0.0
        return result


@router.patch("/me/passenger")
async def updatePassengerProfile(sessionKey: str, updates: PassengerUpdate, db = Depends(get_db)):
    """Update passenger profile data — atomic via sp_update_passenger_profile"""
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        is_passenger = await conn.fetchval(
            "SELECT 1 FROM v_staff_passenger_list WHERE passenger_id = $1", userId)
        if not is_passenger:
            raise HTTPException(status_code=403, detail="user is not a registered passenger")
        await conn.execute(
            "CALL sp_update_passenger_profile($1, $2, $3, $4)",
            userId, updates.name, updates.cnic, updates.phone)
        return {"status": "Passenger profile updated"}


# Driver
@router.patch("/me/driver")
async def updateDriverProfile(sessionKey: str, updates: DriverUpdate, db = Depends(get_db)):
    """Update driver-specific profile — atomic via sp_update_driver_profile"""
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        is_driver = await conn.fetchval(
            "SELECT 1 FROM v_driver_public_profile WHERE driver_id = $1", userId)
        if not is_driver:
            raise HTTPException(status_code=403, detail="user is not a registered driver")
        await conn.execute(
            "CALL sp_update_driver_profile($1, $2, $3)",
            userId, updates.name, updates.phone_no)
        return {"status": "Driver profile updated"}


@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: VehicleUpdate, db = Depends(get_db)):
    """Upsert vehicle — ON CONFLICT handled natively in sp_upsert_vehicle"""
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        is_driver = await conn.fetchval(
            "SELECT 1 FROM v_driver_public_profile WHERE driver_id = $1", userId)
        if not is_driver:
            raise HTTPException(status_code=403, detail="not a driver")
        await conn.execute(
            "CALL sp_upsert_vehicle($1, $2, $3, $4, $5, $6, $7, $8)",
            userId, vehicleData.make, vehicleData.model, vehicleData.engine_no,
            vehicleData.chassis_no, vehicleData.plate_no, vehicleData.owner_name,
            vehicleData.owner_cnic)
        return {"status": "Vehicle updated"}


@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int, db = Depends(get_db)):
    """View public driver profile, car info, and trip count"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM v_driver_public_profile WHERE driver_id = $1", userId)
        if not profile:
            raise HTTPException(status_code=404, detail="driver not found")
        return dict(profile)


@router.get("/{userId}/ratings")
async def viewDriverRatings(sessionKey: str, userId: int, db = Depends(get_db)):
    """Called by passenger to view driver ratings — uses View + UDF"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM v_driver_ratings WHERE driver_id = $1", userId)
        if not rows:
            return {"average_rating": 0.0, "total_reviews": 0, "reviews": []}
        avg = await conn.fetchval(
            "SELECT fn_average_driver_rating($1)", userId)
        reviews_list = [{
            "score": row['score'],
            "feedback": row['feedback'],
            "date": str(row['rated_at'])
        } for row in rows]
        return {
            "average_rating": float(avg) if avg else 0.0,
            "total_reviews": len(rows),
            "reviews": reviews_list
        }
