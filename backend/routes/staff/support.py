from backend.schemas import Ticket
from fastapi import APIRouter

router = APIRouter(prefix="/support", tags=["Support Staff"])

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
@router.post("/tickets")
async def createTicket(ticket: Ticket):
    return ticket
