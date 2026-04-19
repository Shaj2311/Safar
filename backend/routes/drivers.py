from fastapi import APIRouter

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/incomingRequests")
async def checkIncomingRequests(sessionKey: str):
    return {"pendingRequests": [{"rideId": 100, "distance": "1km"}]}


@router.get("/incomingRequests/{id}")
async def getRideRequestDetails(sessionKey: str, id: int):
    return {"rideId": id, "distance": "1km"}
