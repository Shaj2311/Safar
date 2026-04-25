from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import TicketCreate

router = APIRouter(prefix="/support", tags=["Support Staff"])

@router.post("/tickets")
async def createTicket(sessionKey: str, ticket: TicketCreate, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        # Verify trip and staff exist and aren't soft-deleted
        trip_exists = await conn.fetchval("select 1 from trip where trip_id = $1 and is_deleted = false", ticket.trip_id)
        if not trip_exists:
            raise HTTPException(status_code=404, detail="Trip not found or deleted")

        staff_exists = await conn.fetchval("select 1 from staff where staff_id = $1 and is_deleted = false", ticket.staff_id)
        if not staff_exists:
            raise HTTPException(status_code=404, detail="Staff member not found or deleted")

        query = """
            insert into ticket (trip_id, staff_id, content, status)
            values ($1, $2, $3, 'open')
            returning ticket_id, inserted_at, status
        """
        row = await conn.fetchrow(query, ticket.trip_id, ticket.staff_id, ticket.content)

        return {
                "ticketId": row["ticket_id"],
                "status": row["status"],
                "timestamp": str(row["inserted_at"]),
                "details": ticket
                }


@router.post("/tickets/{id}/escalate")
async def escalateTicket(sessionKey: str, id: int, reason: str, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        # We append the escalation reason to the existing content and change status
        query = """
            update ticket 
            set status = 'escalated',
                content = content || '\n\nESCALATION REASON: ' || $1,
                updated_at = now()
            where ticket_id = $2 and is_deleted = false
        """
        result = await conn.execute(query, reason, id)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Ticket not found or already deleted")

        return {"id": id, "status": "Escalated", "reason": reason}
