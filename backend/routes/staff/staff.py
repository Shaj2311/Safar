from fastapi import APIRouter

router = APIRouter(prefix="/staff", tags=["Staff"])

# May change this call later
@router.get("/trips")
async def staffViewTrips(search: str | None = None, status: str | None = None):
    return {"results": [], "searchQuery": search, "statusFilter": status}


@router.get("/trips/{id}")
async def staffViewTripDetails(id: int):
    return {"tripId": id, "details": {}}


@router.get("/tickets")
async def viewAllTickets():
    return {"tickets": [{"id": 999, "status": "Open"}]}


@router.get("/tickets/{id}")
async def viewTicketDetails(id: int):
    return {"ticketId": id, "details": {}}


@router.patch("/tickets/{id}/resolve")
async def resolveTicket(id: int):
    return {"ticketId": id, "status": "Resolved"}


@router.get("/users/{id}")
async def staffViewUserProfile(id: int):
    return {"userId": id, "flags": 0, "status": "Active"}


@router.post("/call")
async def staffCallUser(details: dict):
    return details
