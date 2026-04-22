from fastapi import APIRouter, Depends
from dependencies import get_db

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/me")
async def getDriverProfile(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select d.driver_id DriverId, u.name, d.cnic, d.phone_no
            from Driver d
            join AppUser u on d.driver_id = u.user_id
            where d.driver_id = $1
        """
        profile = await conn.fetchrow(query, id)
        if not profile:
            return {"Error": "Driver does not exist"}
        return profile



@router.get("/incomingRequests")
async def checkIncomingRequests(sessionKey: str, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select trip_id, passenger_id, driver_id, start_time, end_time, pickup_loc, dropoff_loc, estimated_dist, actual_dist
            from Trip
            where start_time is NULL
        """
        rideRequests = await conn.fetch(query)
        if not rideRequests:
            return {"Error": "No incoming requests"}
        return rideRequests


@router.get("/incomingRequests/{id}")
async def getRideRequestDetails(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select passenger_id, driver_id, start_time, end_time, pickup_loc, dropoff_loc, estimated_dist, actual_dist
            from Trip
            where trip_id = $1
            and start_time is NULL
        """
        rideRequest = await conn.fetchrow(query, id)
        if not rideRequest:
            return {"Error": "Request does not exist"}
        return rideRequest
