from fastapi import APIRouter, Depends
from backend.dependencies import get_db

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/me")
async def getDriverProfile(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        # 1. Query only the 'public' schema (where your tables live)
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
async def checkIncomingRequests(sessionKey: str):
    return {"pendingRequests": [{"rideId": 100, "distance": "1km"}]}


@router.get("/incomingRequests/{id}")
async def getRideRequestDetails(sessionKey: str, id: int):
    return {"rideId": id, "distance": "1km"}
