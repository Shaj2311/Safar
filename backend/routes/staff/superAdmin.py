from fastapi import APIRouter

router = APIRouter(prefix="/super", tags=["Super Admin"])

#@router.get("/users/{role}/{id}")
@router.get("/users/{id}")
async def superViewUser(sessionKey: str, role: str, id: int):
    """View any user (driver, passenger, support, admin)."""
    return {"role": role, "id": id, "audit": "Complete system history"}


#@router.delete("/users/{role}/{id}")
@router.delete("/users/{id}")
async def superDeleteUser(sessionKey: str, role: str, id: int):
    """Delete any user (driver, passenger, support, admin)."""
    return {"status": "Wiped from DB", "role": role, "id": id}


@router.post("/staff/manage")
async def superCreateStaff(sessionKey: str, details: dict):
    """Create new Admin or Support staff accounts."""
    return details
