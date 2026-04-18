from fastapi import APIRouter

router = APIRouter(prefix="/history", tags=["Trip History"])

@router.get("/summary")
async def viewEarnings():
    return {"totalEarnings": 0, "tripsCompleted": 0}

@router.get("/{id}")
async def getPastTripDetails(id: int):
    return {"tripId": id, "date": "1970-01-01", "fare": 0}
