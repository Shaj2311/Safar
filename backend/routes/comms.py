from backend.schemas import Message
from fastapi import APIRouter

router = APIRouter(tags=["Communications & Tracking"])

@router.post("/chats/{id}/messages")
async def sendMessage(message: Message):
    return message

@router.get("/chats/{id}/messages")
async def receiveMessages(id: int):
    """Polled to receive any new incoming messages"""
    return {"chatId": id, "messages": []}

@router.post("/call")
async def call(callDetails: dict):
    return {"status": "Call initiated", "details": callDetails}

@router.get("/public/track/{encryptedRideId}")
async def getPublicRideDetails(encryptedRideId: str):
    return {"trackingHash": encryptedRideId, "status": "Live", "driverLoc": "Nowhere :O"}
