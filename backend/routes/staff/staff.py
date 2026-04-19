from fastapi import APIRouter

router = APIRouter(prefix="/staff", tags=["Staff"])

# Rides

@router.get("/rides")
async def staffViewRides(sessionKey: str, search: str | None = None, filter: dict | None = None):
    return {"results": [], "searchQuery": search, "appliedFilter": filter}


@router.get("/rides/{id}")
async def staffViewRideDetails(sessionKey: str, id: int):
    return {"rideId": id, "details": {}}



# Tickets
@router.get("/tickets")
async def viewAllTickets(sessionKey: str, searchKeyword: str | None = None, filters: str | None = None):
    return {"tickets": [{"id": 999, "status": "Open"}]}


@router.get("/tickets/{id}")
async def viewTicketDetails(sessionKey: str, id: int):
    return {"ticketId": id, "details": {}}


@router.patch("/tickets/{id}/resolve")
async def resolveTicket(sessionKey: str, id: int):
    return {"ticketId": id, "status": "Resolved"}


@router.delete("/tickets/{id}")
async def deleteTicket(sessionKey: str, id: int):
    return {"id": id, "status": "deleted"}


@router.patch("/tickets/{id}")
async def editTicketDetails(sessionKey: str, id: int, updates: dict):
    return {"ticketId": id, "updates": updates}


# Passengers
@router.get("/passengers/{id}")
async def viewAllPassengers(sessionKey: str, searchKeyword: str | None = None, filters: str | None = None):
    return {"passengerId": id, "flags": 0, "status": "Active"}

# Drivers
@router.get("/drivers/{id}")
async def viewAllPassengers(sessionKey: str, searchKeyword: str | None = None, filters: str | None = None):
    return {"driverId": id, "flags": 0, "status": "Active"}


# View Users (Passengers + Drivers)
async def staffViewUsers(sessionKey: str, role: str, id: int):
    return {"Role": role, "id": id}


@router.get("/staff/users/{role}/{id}")
async def staffViewUserProfile(sessionKey: str, role: str, id: int):
    """Generic profile viewer for any user type."""
    return {"role": role, "userId": id, "profileData": {}}


# Call
@router.post("/call")
async def staffCallUser(sessionKey: str, details: dict):
    return details
