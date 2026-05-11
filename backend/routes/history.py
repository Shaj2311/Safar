from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session

router = APIRouter(prefix="/history", tags=["Trip History"])

# ── Migration Summary ──────────────────────────────────────────────
# Views: v_driver_earnings, v_trip_history_detail
# UDFs: fn_driver_total_earnings (replaces Python accumulator loop)
# Procedures: None (all endpoints are read-only)
# ───────────────────────────────────────────────────────────────────

@router.get("/summary")
async def viewEarnings(sessionKey: str, driverId: int, db = Depends(get_db)):
    sessionUserId = validate_session(sessionKey)
    if sessionUserId != driverId:
        raise HTTPException(status_code=403, detail="forbidden")

    async with db.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM v_driver_earnings WHERE driver_id = $1 AND is_paid = true",
            driverId)
        if not rows:
            return []

        # Use UDF for total instead of Python loop
        total = await conn.fetchval("SELECT fn_driver_total_earnings($1)", driverId)

        earnings_list = [{
            "tripId": row["trip_id"],
            "rideFare": float(row["actual_fare"]) if row["actual_fare"] else 0.0
        } for row in rows]

        return {
                "totalEarnings": float(total) if total else 0.0,
                "count": len(earnings_list),
                "items": earnings_list
                }


@router.get("/rides")
async def getPastTrips(sessionKey: str, driverId: int, db = Depends(get_db)):
    sessionUserId = validate_session(sessionKey)
    if sessionUserId != driverId:
        raise HTTPException(status_code=403, detail="forbidden")

    async with db.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM v_driver_earnings WHERE driver_id = $1 ORDER BY start_time DESC",
            driverId)
        trips = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]
            trips.append({
                "tripId": row["trip_id"],
                "startTime": str(row["start_time"]),
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "fare": float(row["actual_fare"]) if row["actual_fare"] else 0.0
                })
        return trips


@router.get("/rides/{id}")
async def getPastTripDetails(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_trip_history_detail WHERE trip_id = $1", id)
        if not row:
            raise HTTPException(status_code=404, detail="trip not found")
        p_loc = row["pickup_loc"]
        d_loc = row["dropoff_loc"]
        return {
                "tripId": row["trip_id"],
                "startTime": str(row["start_time"]),
                "endTime": str(row["end_time"]) if row["end_time"] else None,
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "distance": float(row["actual_dist"]) if row["actual_dist"] else 0.0,
                "passengerName": row["passenger_name"],
                "payment": {
                    "base": float(row["base_amount"]) if row["base_amount"] else 0.0,
                    "trip": float(row["trip_amount"]) if row["trip_amount"] else 0.0,
                    "total": float(row["actual_fare"]) if row["actual_fare"] else 0.0,
                    "isPaid": row["is_paid"]
                    }
                }
