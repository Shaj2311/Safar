from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from state import sessions

router = APIRouter(prefix="/drivers", tags=["Drivers"])

# ── Migration Summary ──────────────────────────────────────────────
# Views: v_driver_public_profile, v_incoming_ride_requests
# Procedures: None (all endpoints are read-only)
# Triggers: N/A (no writes in this file)
# ───────────────────────────────────────────────────────────────────

@router.get("/me")
async def getDriverProfile(sessionKey: str, id: int, db = Depends(get_db)):
    sessionUserId = validate_session(sessionKey)
    if sessionUserId != id:
        raise HTTPException(status_code=403, detail="forbidden")

    async with db.acquire() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM v_driver_public_profile WHERE driver_id = $1", id)
        if not profile:
            raise HTTPException(status_code=404, detail="driver not found")
        return {
                "driverId": profile["driver_id"],
                "name": profile["name"],
                "cnic": profile["cnic"],
                "phoneNo": profile["phone_no"]
                }


@router.get("/incomingRequests")
async def checkIncomingRequests(sessionKey: str, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM v_incoming_ride_requests")
        requests = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]
            requests.append({
                "tripId": row["trip_id"],
                "passengerId": row["passenger_id"],
                "passengerName": row["passenger_name"],
                "passengerPhoneNo": row["phone_no"],
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "dist": float(row["estimated_dist"]) if row["estimated_dist"] else 0.0
                })
        return requests


@router.get("/incomingRequests/{id}")
async def getRideRequestDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_incoming_ride_requests WHERE trip_id = $1", id)
        if not row:
            raise HTTPException(status_code=404, detail="request not found")
        p_loc = row["pickup_loc"]
        d_loc = row["dropoff_loc"]
        return {
                "tripId": row["trip_id"],
                "passengerId": row["passenger_id"],
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "estimatedDist": float(row["estimated_dist"]) if row["estimated_dist"] else 0.0
                }
