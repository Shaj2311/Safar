from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import TicketCreate
from datetime import datetime

router = APIRouter(prefix="/support", tags=["Support Staff"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_create_ticket, sp_escalate_ticket
# Views: None (ticket reads handled in staff.py)
# Triggers: trg_updated_at_ticket, trg_ticket_default_status
# Transactions: Ticket creation and escalation are atomic via procedures
# ───────────────────────────────────────────────────────────────────

@router.post("/tickets")
async def createTicket(sessionKey: str, ticket: TicketCreate, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            "CALL sp_create_ticket($1, $2, $3, NULL)",
            ticket.trip_id, ticket.staff_id, ticket.content)
        return {
                "ticketId": row[0],
                "status": "open",
                "timestamp": str(datetime.now()),
                "details": ticket
                }


@router.post("/tickets/{id}/escalate")
async def escalateTicket(sessionKey: str, id: int, reason: str, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        await conn.execute("CALL sp_escalate_ticket($1, $2)", id, reason)
        return {"id": id, "status": "Escalated", "reason": reason}
