from schemas import Message
from fastapi import APIRouter

router = APIRouter(tags=["Communications & Tracking"])

@router.post("/chats/{id}/messages")
async def sendMessage(sessionKey: str, message: Message):
    return message

@router.get("/chats/{id}/messages")
async def receiveMessages(sessionKey: str, id: int):
    """Polled to receive any new incoming messages"""
    return {"chatId": id, "messages": []}

@router.post("/call")
async def call(sessionKey: str, callDetails: dict):
    return {"status": "Call initiated", "details": callDetails}

@router.get("/public/track/{encryptedRideId}")
async def getPublicRideDetails(sessionKey: str, encryptedRideId: str):
    return {"trackingHash": encryptedRideId, "status": "Live", "driverLoc": "Nowhere :O"}
