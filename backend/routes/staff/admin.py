from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.patch("/tickets/escalated/{id}/resolve")
async def resolveEscalatedTicket(sessionKey: str, id: int):
    return {"ticketId": id, "status": "Escalated issue resolved by Admin"}


@router.delete("/passengers/{id}")
async def deletePassenger(sessionKey: str, id: int):
    return {"status": "Account deleted", "targetId": id}


@router.delete("/drivers/{id}")
async def deleteDriver(sessionKey: str, id: int):
    return {"status": "Account deleted", "targetId": id}


@router.post("/drivers")
async def adminCreateDriver(sessionKey: str, details: dict):
    """Admins create accounts for hired drivers"""
    return {"status": "New driver created", "details": details}
