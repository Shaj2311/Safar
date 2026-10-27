from schemas import Message
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from typing import Any

router = APIRouter(tags=["Communications & Tracking"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_send_message
# Views: v_chat_messages, v_public_ride_tracking
# Triggers: trg_updated_at_message (removed manual updated_at)
# ───────────────────────────────────────────────────────────────────

@router.post("/chats/{id}/messages")
async def sendMessage(sessionKey: str, id: int, message: Message, db = Depends(get_db)):
    userId = validate_session(sessionKey) 
    async with db.acquire() as conn:
        check = await conn.fetchval(
            "SELECT chat_id FROM v_chat_messages WHERE chat_id = $1 LIMIT 1", id)
        # If no messages yet, verify chat exists directly
        if check is None:
            chat_exists = await conn.fetchval(
                "SELECT chat_id FROM chat WHERE chat_id = $1 AND is_deleted = false", id)
            if not chat_exists:
                raise HTTPException(status_code=404, detail="chat not found")

        result = await conn.fetchrow(
            "CALL sp_send_message($1, $2, $3, $4, NULL, NULL)",
            id, userId, message.receiverId, message.content)
        return {
            "status": "Message sent",
            "messageId": result[0],
            "sentAt": str(result[1])
        }

@router.get("/chats/{id}/messages")
async def receiveMessages(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled to receive any new incoming messages"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM v_chat_messages WHERE chat_id = $1 ORDER BY sent_at ASC", id)
        messages_list = [{
            "senderId": row['sender_id'],
            "receiverId": row['receiver_id'],
            "content": row['content'],
            "timestamp": str(row['sent_at'])
        } for row in rows]
        return {"chatId": id, "messages": messages_list}


@router.get("/call")
async def call(sessionKey: str, id: int):
    validate_session(sessionKey)
    return {"status": "Call initiated", "targetId": id}


@router.get("/public/track/{encryptedRideId}")
async def getPublicRideDetails(encryptedRideId: str, db = Depends(get_db)):
    """Publicly accessible ride details — uses v_public_ride_tracking view"""
    try:
        trip_id = int(encryptedRideId) 
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid tracking id")

    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM v_public_ride_tracking WHERE trip_id = $1", trip_id)
        if not row:
            raise HTTPException(status_code=404, detail="ride not found")

        status = "live"
        if row['end_time'] is not None:
            status = "completed"
        if row['is_deleted']:
            status = "cancelled"

        loc = row['latest_location']
        loc_data = {"x": loc.x, "y": loc.y} if loc else None
        return {
            "trackingHash": encryptedRideId,
            "status": status,
            "driverLoc": loc_data
        }
