from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import RideRequest, GPSData, RatingData

router = APIRouter(prefix="/rides", tags=["Rides"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_request_ride, sp_cancel_ride, sp_accept_ride, sp_start_ride,
#             sp_end_ride, sp_confirm_payment, sp_submit_rating, sp_update_gps
# Views: v_active_ride_status, v_ride_payment_status, v_trip_driver_info,
#        v_ride_summary, v_public_ride_tracking, v_staff_passenger_list
# UDFs: fn_calculate_fare (inside sp_end_ride), fn_get_ride_status (inside v_active_ride_status)
# Triggers: trg_updated_at_trip (removed all manual updated_at = now())
# Transactions: sp_end_ride (atomic trip end + payment), sp_accept_ride (atomic accept + chat)
# ───────────────────────────────────────────────────────────────────

@router.post("/")
async def requestRide(sessionKey: str, rideDetails: RideRequest, db = Depends(get_db)):
    """Called by passenger to request a ride"""
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        is_passenger = await conn.fetchval(
                "SELECT 1 FROM v_staff_passenger_list WHERE passenger_id = $1", userId)
        if not is_passenger:
            raise HTTPException(status_code=403, detail="only passengers can request rides")

        row = await conn.fetchrow(
                "CALL sp_request_ride($1, $2, $3, $4, $5, $6, NULL)",
                userId, rideDetails.pickup_x, rideDetails.pickup_y,
                rideDetails.dropoff_x, rideDetails.dropoff_y, rideDetails.dist)
        return {"status": "Ride requested", "tripId": row[0]}


@router.patch("/{id}/cancel")
async def cancelRide(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_cancel_ride($1)", id)
        return {"rideId": id, "status": "Cancelled"}


@router.get("/{id}")
async def getRideStatus(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled by passenger during ride — uses View with fn_get_ride_status built in"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
                "SELECT status FROM v_active_ride_status WHERE trip_id = $1", id)
    if not row:
        raise HTTPException(status_code=404, detail="ride not found")
    return {"Status": row["status"]}


@router.get("/{tripId}/paymentStatus")
async def getRidePaymentStatus(sessionKey: str, tripId: int, db = Depends(get_db)):
    """Check if the payment for a specific ride has been settled. Validates ownership."""
    passengerId = validate_session(sessionKey)
    async with db.acquire() as conn:
        payment_info = await conn.fetchrow(
                "SELECT * FROM v_ride_payment_status WHERE trip_id = $1 AND passenger_id = $2",
                tripId, passengerId)
        if not payment_info:
            raise HTTPException(status_code=404, detail="Payment information not found or access unauthorized")
        return {
            "tripId": tripId,
            "isPaid": payment_info["is_paid"],
            "fare": float(payment_info["fare"]),
            "processedAt": str(payment_info["processed_at"])
        }


@router.patch("/{id}/accept")
async def acceptRideRequest(sessionKey: str, id: int, db = Depends(get_db)):
    """Called by driver to accept ride request — uses FOR UPDATE lock inside procedure"""
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        try:
            await conn.execute("CALL sp_accept_ride($1, $2)", id, userId)
        except Exception:
            raise HTTPException(status_code=410, detail="ride already accepted")
        return {"rideId": id, "status": "Accepted"}


@router.get("/{tripId}/location")
async def getRideLocation(sessionKey: str, tripId: int, db = Depends(get_db)):
    """Polled by passenger to get the latest trip coordinates for map updates"""
    passengerId = validate_session(sessionKey)
    async with db.acquire() as conn:
        loc_record = await conn.fetchrow(
                "SELECT * FROM v_public_ride_tracking WHERE trip_id = $1", tripId)
        if not loc_record or not loc_record["latest_location"]:
            raise HTTPException(status_code=404, detail="Location data unavailable")
        location = loc_record["latest_location"]
        return {
            "tripId": tripId,
            "coords": {"lat": location.x, "lng": location.y},
            "lastUpdated": str(loc_record["end_time"]) if loc_record["end_time"] else None
        }


@router.post("/{id}/location")
async def updateLocation(sessionKey: str, id: int, gpsData: GPSData, db = Depends(get_db)):
    """Called continuously by driver during ride"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_update_gps($1, $2, $3)", id, gpsData.x, gpsData.y)
        return {"rideId": id, "location": {"x": gpsData.x, "y": gpsData.y}}


@router.patch("/{id}/start")
async def startRide(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_start_ride($1)", id)
        return {"rideId": id, "status": "In progress"}


@router.patch("/{id}/end")
async def endRide(sessionKey: str, id: int, db = Depends(get_db)):
    """Atomic: ends trip + calculates fare via fn_calculate_fare + creates payment record"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        try:
            result = await conn.fetchrow("CALL sp_end_ride($1, NULL)", id)
            fare = float(result[0]) if result[0] else 0.0
            return {"rideId": id, "status": "Completed", "fare": fare}
        except Exception:
            raise HTTPException(status_code=404, detail="trip not found or already ended")


@router.post("/{id}/confirm-payment")
async def confirmPayment(sessionKey: str, id: int, db = Depends(get_db)):
    """Called by driver at end of ride to confirm that they've been paid"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_confirm_payment($1)", id)
        return {"id": id, "paymentStatus": "Paid"}


@router.get("/{tripId}/driver")
async def getCurrentDriver(sessionKey: str, tripId: int, db = Depends(get_db)):
    """Called by passenger during an active/accepted ride to get driver and vehicle info"""
    passengerId = validate_session(sessionKey)
    async with db.acquire() as conn:
        driver_info = await conn.fetchrow(
                "SELECT * FROM v_trip_driver_info WHERE trip_id = $1 AND passenger_id = $2",
                tripId, passengerId)
        if not driver_info:
            raise HTTPException(status_code=404, detail="Invalid ride or access unauthorized")
        return dict(driver_info)


@router.get("/{id}/summary")
async def getCompletedRideSummary(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        summary = await conn.fetchrow(
                "SELECT * FROM v_ride_summary WHERE trip_id = $1", id)
        if not summary:
            raise HTTPException(status_code=404, detail="ride not found")
        res = dict(summary)
        res["pickup_loc"] = {"x": summary["pickup_loc"].x, "y": summary["pickup_loc"].y}
        res["dropoff_loc"] = {"x": summary["dropoff_loc"].x, "y": summary["dropoff_loc"].y}
        res["start_time"] = str(summary["start_time"])
        res["end_time"] = str(summary["end_time"]) if summary["end_time"] else None
        res["distance"] = float(summary["distance"]) if summary["distance"] else 0.0
        res["base_amount"] = float(summary["base_amount"]) if summary["base_amount"] else 0.0
        res["trip_amount"] = float(summary["trip_amount"]) if summary["trip_amount"] else 0.0
        res["total_fare"] = float(summary["total_fare"]) if summary["total_fare"] else 0.0
        return res


@router.post("/{id}/rate")
async def rateDriver(sessionKey: str, id: int, ratingData: RatingData, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_submit_rating($1, $2, $3)", id, ratingData.score, ratingData.feedback)
        return {"rideId": id, "status": "Rating submitted"}
