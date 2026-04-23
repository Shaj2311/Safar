from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session

router = APIRouter(prefix="/rides", tags=["Rides"])

@router.post("/")
async def requestRide(sessionKey: str, rideDetails: dict):
    """Called by passenger to request a ride"""
    validate_session(sessionKey)
    return {"status": "Ride requested"}


@router.patch("/{id}/cancel")
async def cancelRide(sessionKey: str, id: int):
    validate_session(sessionKey)
    return {"rideId": id, "status": "Cancelled"}


@router.get("/{id}")
async def getRideStatus(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled by passenger during ride"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = """
            select t.start_time, t.end_time
            from trip t
            where t.trip_id = $1
        """
        times = await conn.fetchrow(query, id)
    
    if not times:
        raise HTTPException(status_code=404, detail="ride not found")
        
    times = dict(times)
    if not times['start_time'] and not times['end_time']:
        return {"Status": "Not started or Cancelled"}
    if times['start_time'] and not times['end_time']:
        return {"Status": "In progress"}
    if times['start_time'] and times['end_time']:
        return {"Status": "Completed"}


@router.patch("/{id}/accept")
async def acceptRideRequest(sessionKey: str, id: int):
    """Called by driver to accept ride request"""
    validate_session(sessionKey)
    return {"rideId": id}


@router.post("/{id}/location")
async def updateLocation(sessionKey: str, id: int, gpsData: dict):
    """Called continuously by driver during ride"""
    validate_session(sessionKey)
    return {"rideId": id, "location": gpsData}


@router.patch("/{id}/start")
async def startRide(sessionKey: str, id: int):
    validate_session(sessionKey)
    return {"rideId": id, "status": "In progress"}


@router.patch("/{id}/end")
async def endRide(sessionKey: str, id: int):
    validate_session(sessionKey)
    # Create entry in Payment table?
    return {"rideId": id, "status": "Completed"}


@router.post("/{id}/confirm-payment")
async def confirmPayment(sessionKey: str, id: int):
    """Called by driver at end of ride to confirm that they've been paid"""
    validate_session(sessionKey)
    return {"id": id, "paymentStatus": "Paid"}


@router.get("/{id}/summary")
async def getCompletedRideSummary(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        # TODO: remove left join from Payment join
        query = """
            select t.passenger_id, p.name as passenger_name, t.driver_id, d.name as driver_name,
            t.start_time, t.end_time,
            t.pickup_loc, t.dropoff_loc,
            t.actual_dist distance,
            pay.base_amount, pay.trip_amount, pay.actual_fare total_fare
            from trip t
            join appuser p on t.passenger_id = p.user_id
            join appuser d on t.driver_id = d.user_id
            left join payment pay on t.trip_id = pay.trip_id
            where t.trip_id = $1
        """
        summary = await conn.fetchrow(query, id)
        if not summary:
            raise HTTPException(status_code=404, detail="ride not found")
        
        # Point conversion and type formatting
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
async def rateDriver(sessionKey: str, id: int, ratingData: dict):
    validate_session(sessionKey)
    return {"rideId": id, "feedback": ratingData}
