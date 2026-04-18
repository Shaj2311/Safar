from backend.schemas import Ticket
from fastapi import APIRouter

router = APIRouter(prefix="", tags=["Staff"])

#            .-"``"-.
#           /______; \
#          {_______}\|
#          (/ a a \)(_)
#          (.-.).-.)
#   _ooo__(    ^    )_____
#  /       '-.___.-'      \
# |   Support Staff Only   |
#  \__________________ooo_/
#          |_  |  _|
#          \___|___/
#          {___|___}
#           |_ | _|
#           /-'Y'-\
#          (__/ \__)
@router.post("/support/tickets")
async def createTicket(ticket: Ticket):
    return ticket


#         .-"""-.
#        / .===. \
#        \/ 6 6 \/
#        ( \___/ )
#   _ooo__\_____/______
#  /                   \
# |      All Staff      |
#  \_______________ooo_/
#         |  |  |
#         |_ | _|
#         |  |  |
#         |__|__|
#         /-'Y'-\
#        (__/ \__)
# May change this call later
@router.get("/staff/trips")
async def staffViewTrips(search: str | None = None, status: str | None = None):
    return {"results": [], "searchQuery": search, "statusFilter": status}


@router.get("/staff/trips/{id}")
async def staffViewTripDetails(id: int):
    return {"tripId": id, "details": {}}


@router.get("/staff/tickets")
async def viewAllTickets():
    return {"tickets": [{"id": 999, "status": "Open"}]}


@router.get("/staff/tickets/{id}")
async def viewTicketDetails(id: int):
    return {"ticketId": id, "details": {}}


@router.patch("/staff/tickets/{id}/resolve")
async def resolveTicket(id: int):
    return {"ticketId": id, "status": "Resolved"}


@router.get("/staff/users/{id}")
async def staffViewUserProfile(id: int):
    return {"userId": id, "flags": 0, "status": "Active"}


@router.post("/staff/call")
async def staffCallUser(details: dict):
    return details


#      .--,       .--,
#     ( (  \.---./  ) )
#      '.__/o   o\__.'
#         {=  ^  =}
#          >  -  <
#  ____.""`-------`"".____
# /                       \
# \      Admins Only      /
# /                       \
# \_______________________/
#        ___)( )(___
#       (((__) (__)))
@router.patch("/admin/escalatedTickets/{id}/resolve")
async def resolveEscalatedTicket(id: int):
    return {"ticketId": id, "status": "Escalated issue resolved by Admin"}

#@router.get("/admin/accounts/{role}/{id}")
@router.get("/admin/accounts/{id}")
async def adminViewAccount(id: int):
    return {"id": id, "data": "Confidential Profile Data"}

@router.delete("/admin/accounts/{role}/{id}")
async def adminDeleteAccount(id: int):
    return {"status": "Account deleted", "targetId": id}


#          .-"""-.
#         / .===. \
#        / / a a \ \
#       / ( \___/ ) \
#   _ooo\__\_____/__/____
#  /                     \
# | Super Admin           |
#  \_________________ooo_/
#       /           \
#      /:.:.:.:.:.:.:\
#          |  |  |
#          \==|==/
#          /-'Y'-\
#         (__/ \__)
#@router.get("/super/users/{role}/{id}")
@router.get("/super/users/{id}")
async def superViewUser(id: int):
    """View any user (driver, passenger, support, admin)."""
    return {"id": id, "audit": "Complete system history"}


#@router.delete("/super/users/{role}/{id}")
@router.delete("/super/users/{id}")
async def superDeleteUser(id: int):
    """Delete any user (driver, passenger, support, admin)."""
    return {"status": "Wiped from DB", "id": id}


@router.post("/super/staff/manage")
async def superCreateStaff(details: dict):
    """Create new Admin or Support staff accounts."""
    return details
