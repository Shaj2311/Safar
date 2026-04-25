from schemas import Message
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from typing import Any

router = APIRouter(tags=["Communications & Tracking"])

@router.post("/chats/{id}/messages")
async def sendMessage(sessionKey: str, id: int, message: Message, db = Depends(get_db)):
    # Centralized gatekeeping applied: returns userId if valid
    userId = validate_session(sessionKey) 

    async with db.acquire() as conn:
        # verify chat exists and belongs to the trip (basic query)
        check_chat = "select chat_id from chat where chat_id = $1 and is_deleted = false"
        chat_exists = await conn.fetchval(check_chat, id)
        
        if not chat_exists:
            raise HTTPException(status_code=404, detail="chat not found")

        # strictly lowercase sql keywords per coding standards
        query = """
            insert into message (chat_id, sender_id, receiver_id, content)
            values ($1, $2, $3, $4)
            returning message_id, sent_at
        """
        new_row = await conn.fetchrow(
            query, 
            id, 
            userId, 
            message.receiverId, 
            message.content
        )

        return {
            "status": "Message sent",
            "messageId": new_row["message_id"],
            "sentAt": str(new_row["sent_at"]) # DateTime to string conversion
        }

@router.get("/chats/{id}/messages")
async def receiveMessages(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled to receive any new incoming messages"""
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select sender_id, receiver_id, content, sent_at
            from message
            where chat_id = $1 and is_deleted = false
            order by sent_at asc
        """
        rows = await conn.fetch(query, id)
        
        messages_list = []
        for row in rows:
            messages_list.append({
                "senderId": row['sender_id'],
                "receiverId": row['receiver_id'],
                "content": row['content'],
                "timestamp": str(row['sent_at'])
            })
            
        return {"chatId": id, "messages": messages_list}


@router.get("/call")
async def call(sessionKey: str, id: int):
    validate_session(sessionKey)
    return {"status": "Call initiated", "targetId": id}


@router.get("/public/track/{encryptedRideId}")
async def getPublicRideDetails(encryptedRideId: str, db = Depends(get_db)):
    """Publicly accessible ride details"""
    # logic assumes encryptedRideId is essentially the trip_id for this simple version
    try:
        trip_id = int(encryptedRideId) 
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid tracking id")

    async with db.acquire() as conn:
        query = """
            select t.is_deleted, lh.location, t.end_time
            from trip t
            left join locationhistory lh on t.trip_id = lh.trip_id
            where t.trip_id = $1
            order by lh.timestamp desc
            limit 1
        """
        row = await conn.fetchrow(query, trip_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="ride not found")

        # determine ride status
        status = "live"
        if row['end_time'] is not None:
            status = "completed"
        if row['is_deleted']:
            status = "cancelled"

        # convert location
        loc = row['location']
        loc_data = {"x": loc.x, "y": loc.y} if loc else None

        return {
            "trackingHash": encryptedRideId,
            "status": status,
            "driverLoc": loc_data
        }
