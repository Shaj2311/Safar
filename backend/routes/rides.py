from fastapi import APIRouter, Depends
from dependencies import get_db

router = APIRouter(prefix="/rides", tags=["Rides"])

@router.post("/")
async def requestRide(sessionKey: str, rideDetails: dict):
    """Called by passenger to request a ride"""
    return {"status": "Ride requested"}


@router.patch("/{id}/cancel")
async def cancelRide(sessionKey: str, id: int):
    return {"rideId": id, "status": "Cancelled"}


@router.get("/{id}")
async def getRideStatus(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled by passenger during ride"""
    async with db.acquire() as conn:
        query = """
            select t.start_time, t.end_time
            from Trip t
            where t.trip_id = $1
        """
        times = await conn.fetchrow(query, id)
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
    return {"rideId": id}


@router.post("/{id}/location")
async def updateLocation(sessionKey: str, id: int, gpsData: dict):
    """Called continuously by driver during ride"""
    return {"rideId": id, "location": gpsData}


@router.patch("/{id}/start")
async def startRide(sessionKey: str, id: int):
    return {"rideId": id, "status": "In progress"}


@router.patch("/{id}/end")
async def endRide(sessionKey: str, id: int):
    # Create entry in Payment table?
    return {"rideId": id, "status": "Completed"}


@router.post("/rides/{id}/confirm-payment")
async def confirmPayment(sessionKey: str, id: int):
    """Called by driver at end of ride to confirm that they've been paid"""
    return {"id": id, "paymentStatus": "Paid"}


@router.get("/{id}/summary")
async def getCompletedRideSummary(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        # TODO: remove left join from Payment join
        query = """
            select t.passenger_id, p.name, t.driver_id, d.name,
            t.start_time, t.end_time,
            t.pickup_loc, t.dropoff_loc,
            t.actual_dist distance,
            pay.base_amount, pay.trip_amount, pay.actual_fare total_fare
            from Trip t
            join AppUser p on t.passenger_id = p.user_id
            join AppUser d on t.driver_id = d.user_id
            left join Payment pay on t.trip_id = pay.trip_id
            where t.trip_id = $1
        """
        summary = await conn.fetchrow(query, id)
        if not summary:
            return {"Error": "Ride does not exist or not completed yet"}
        return summary


@router.post("/{id}/rate")
async def rateDriver(sessionKey: str, id: int, ratingData: dict):
    return {"rideId": id, "feedback": ratingData}
