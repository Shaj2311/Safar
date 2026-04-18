from fastapi import APIRouter

router = APIRouter(prefix="/rides", tags=["Rides"])

@router.post("/")
async def requestRide(rideDetails: dict):
    """Called by passenger to request a ride"""
    return {"status": "Ride requested"}


@router.patch("/{id}/cancel")
async def cancelRide(id: int):
    return {"rideId": id, "status": "Cancelled"}


@router.get("/{id}")
async def getRideStatus(id: int):
    """Polled by passenger during ride"""
    return {"rideId": id}


@router.patch("/{id}/accept")
async def acceptRideRequest(id: int):
    """Called by driver to accept ride request"""
    return {"rideId": id}


@router.post("/{id}/location")
async def updateLocation(id: int, gpsData: dict):
    """Called continuously by driver during ride"""
    return {"rideId": id, "location": gpsData}


@router.patch("/{id}/start")
async def startTrip(id: int):
    return {"rideId": id, "status": "In progress"}


@router.patch("/{id}/end")
async def endTrip(id: int):
    return {"rideId": id, "status": "Completed"}


@router.post("/{id}/rate")
async def rateDriver(id: int, ratingData: dict):
    return {"rideId": id, "feedback": ratingData}
