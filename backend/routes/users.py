from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["User Profiles"])

@router.get("/me")
async def getProfile(sessionKey: str, ):
    return {"id": 1, "username": "foo"}

@router.patch("/me")
async def updateProfile(sessionKey: str, updates: dict):
    return {"message": "Profile updated", "appliedUpdates": updates}

@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: dict):
    return {"message": "Vehicle details updated", "vehicle": vehicleData}

@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int):
    return {"driverId": userId}

@router.get("/{userId}/ratings")
async def viewDriverRatings(sessionKey: str, userId: int):
    return {"driverId": userId}
