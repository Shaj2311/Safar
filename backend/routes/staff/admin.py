from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import AdminDriverCreate

router = APIRouter(prefix="/admin", tags=["Admin"])

async def verify_admin(userId, conn):
    """Helper to ensure the user has the 'admin' role in Staff table"""
    role = await conn.fetchval(
            "select role from staff where staff_id = $1 and is_deleted = false",
            userId
            )
    if role != 'admin':
        raise HTTPException(status_code=403, detail="administrative privileges required")

@router.patch("/tickets/escalated/{id}/resolve")
async def resolveEscalatedTicket(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        await verify_admin(userId, conn)

        #Fetch current status
        current_status = await conn.fetchval("select status from ticket where ticket_id = $1", id)

        #Check existence
        if current_status is None:
            raise HTTPException(status_code=404, detail="ticket not found")

        #If it's already 'resolved' or still 'open', exit
        if current_status != 'escalated':
            raise HTTPException(
                    status_code=400,
                    detail=f"only escalated tickets can be resolved here. current status: {current_status}"
                    )

        # Update
        await conn.execute(
                "update ticket set status = 'resolved', updated_at = now() where ticket_id = $1",
                id
                )

        return {"ticketId": id, "status": "Escalated issue resolved by Admin"}


@router.delete("/passengers/{id}")
async def deletePassenger(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        await verify_admin(userId, conn)

        # Soft delete in the Passenger table
        result = await conn.execute(
                "update passenger set is_deleted = true, updated_at = now() where passenger_id = $1",
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="passenger not found")

        return {"status": "Account deleted", "targetId": id}


@router.delete("/drivers/{id}")
async def deleteDriver(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        await verify_admin(userId, conn)

        # Soft delete in the Driver table
        result = await conn.execute(
                "update driver set is_deleted = true, updated_at = now() where driver_id = $1",
                id
                )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="driver not found")

        return {"status": "Account deleted", "targetId": id}


@router.post("/drivers")
async def adminCreateDriver(sessionKey: str, details: AdminDriverCreate, db = Depends(get_db)):
    """Admins create accounts for hired drivers"""
    adminId = validate_session(sessionKey)

    async with db.acquire() as conn:
        await verify_admin(adminId, conn)

        #Create the base User
        new_user_id = await conn.fetchval(
                "insert into appuser (name, password) values ($1, $2) returning user_id",
                details.name, details.password
                )

        #Create the Driver profile linked to that User
        await conn.execute(
                "insert into driver (driver_id, cnic, phone_no) values ($1, $2, $3)",
                new_user_id, details.cnic, details.phone_no
                )

        return {
                "status": "New driver created",
                "driverId": new_user_id,
                "name": details.name
                }
