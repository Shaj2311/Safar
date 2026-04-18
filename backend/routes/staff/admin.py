from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.patch("/escalatedTickets/{id}/resolve")
async def resolveEscalatedTicket(sessionKey: str, id: int):
    return {"ticketId": id, "status": "Escalated issue resolved by Admin"}

#@router.get("/admin/accounts/{role}/{id}")
@router.get("/accounts/{id}")
async def adminViewAccount(sessionKey: str, role: str, id: int):
    return {"role": role, "id": id, "data": "Confidential Profile Data"}

@router.delete("/accounts/{role}/{id}")
async def adminDeleteAccount(sessionKey: str, role: str, id: int):
    return {"status": f"{role} account deleted", "targetId": id}
