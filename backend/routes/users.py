from fastapi import APIRouter
#from backend.schemas import User

router = APIRouter(prefix="/users", tags=["User Profiles"])

@router.get("/me")
async def getProfile():
    return {"id": 1, "username": "foo"}

@router.patch("/me")
async def updateProfile(updates: dict):
    return {"message": "Profile updated", "appliedUpdates": updates}

@router.patch("/me/vehicle")
async def updateVehicle(vehicleData: dict):
    return {"message": "Vehicle details updated", "vehicle": vehicleData}

@router.get("/{userId}/profile")
async def viewDriverProfile(userId: int):
    return {"driverId": userId}

@router.get("/{userId}/ratings")
async def viewDriverRatings(userId: int):
    return {"driverId": userId}
