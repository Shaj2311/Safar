from schemas import Ticket
from fastapi import APIRouter

router = APIRouter(prefix="/support", tags=["Support Staff"])

@router.post("/tickets")
async def createTicket(sessionKey: str, ticket: Ticket):
    return ticket


@router.post("/tickets/{id}/escalate")
async def escalateTicket(sessionKey: str, id: int, reason: str):
    return {"id": id, "status": "Escalated"}
