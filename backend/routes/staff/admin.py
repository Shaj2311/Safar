from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.patch("/tickets/escalated/{id}/resolve")
async def resolveEscalatedTicket(sessionKey: str, id: int):
    return {"ticketId": id, "status": "Escalated issue resolved by Admin"}


@router.get("/accounts/{role}/{id}")
async def adminViewAccount(sessionKey: str, role: str, id: int):
    return {"role": role, "id": id, "data": "Confidential Profile Data"}


@router.delete("/accounts/{role}/{id}")
async def adminDeleteAccount(sessionKey: str, role: str, id: int):
    """Delete passenger or driver accounts"""
    return {"status": f"{role} account deleted", "targetId": id}


@router.post("/drivers")
async def adminCreateDriver(sessionKey: str, details: dict):
    """Admins create accounts for hired drivers"""
    return {"status": "New driver created", "details": details}
