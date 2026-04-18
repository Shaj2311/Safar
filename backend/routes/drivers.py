from fastapi import APIRouter

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/requestSearch")
async def checkIncomingRequests(sessionKey: str, ):
    return {"pendingRequests": [{"rideId": 100, "distance": "1km"}]}
