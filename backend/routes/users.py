from fastapi import APIRouter, Request

router = APIRouter(prefix="/users", tags=["User Profiles"])


@router.patch("/me")
async def updateProfile(sessionKey: str, updates: dict):
    return {"message": "Profile updated", "appliedUpdates": updates}

@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: dict):
    return {"message": "Vehicle details updated", "vehicle": vehicleData}

@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int):
    """Called by passenger to view driver"""
    return {"driverId": userId}

@router.get("/{userId}/ratings")
async def viewDriverRatings(sessionKey: str, userId: int):
    """Called by passenger to view driver ratings"""
    return {"driverId": userId}
