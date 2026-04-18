from backend.schemas import Ticket
from fastapi import APIRouter

router = APIRouter(prefix="/support", tags=["Support Staff"])

@router.post("/tickets")
async def createTicket(sessionKey: str, ticket: Ticket):
    return ticket
