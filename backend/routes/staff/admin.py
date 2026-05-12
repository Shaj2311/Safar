from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import AdminDriverCreate

router = APIRouter(prefix="/admin", tags=["Admin"])

# ── Migration Summary ──────────────────────────────────────────────
# Procedures: sp_resolve_ticket, sp_admin_delete_passenger, sp_admin_delete_driver, sp_admin_create_driver
# Views: v_super_staff_list (admin role verification)
# Triggers: trg_updated_at_* (removed all manual updated_at)
# Transactions: sp_admin_create_driver (atomic appuser + driver creation)
# ───────────────────────────────────────────────────────────────────

async def verify_admin(userId, conn):
    """Helper to ensure the user has the 'admin' role via View"""
    role = await conn.fetchval(
            "SELECT role FROM v_super_staff_list WHERE staff_id = $1", userId)
    if role != 'admin':
        raise HTTPException(status_code=403, detail="administrative privileges required")

@router.patch("/tickets/escalated/{id}/resolve")
async def resolveEscalatedTicket(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        await verify_admin(userId, conn)
        current_status = await conn.fetchval(
            "SELECT status FROM ticket WHERE ticket_id = $1", id)
        if current_status is None:
            raise HTTPException(status_code=404, detail="ticket not found")
        if current_status != 'escalated':
            raise HTTPException(status_code=400,
                detail=f"only escalated tickets can be resolved here. current status: {current_status}")
        await conn.execute("CALL sp_resolve_ticket($1)", id)
        return {"ticketId": id, "status": "Escalated issue resolved by Admin"}


@router.delete("/passengers/{id}")
async def deletePassenger(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        await verify_admin(userId, conn)
        await conn.execute("CALL sp_admin_delete_passenger($1)", id)
        return {"status": "Account deleted", "targetId": id}


@router.delete("/drivers/{id}")
async def deleteDriver(sessionKey: str, id: int, db = Depends(get_db)):
    userId = validate_session(sessionKey)
    async with db.acquire() as conn:
        await verify_admin(userId, conn)
        await conn.execute("CALL sp_admin_delete_driver($1)", id)
        return {"status": "Account deleted", "targetId": id}


@router.post("/drivers")
async def adminCreateDriver(sessionKey: str, details: AdminDriverCreate, db = Depends(get_db)):
    """Admins create accounts for hired drivers — atomic via sp_admin_create_driver"""
    adminId = validate_session(sessionKey)
    async with db.acquire() as conn:
        await verify_admin(adminId, conn)
        row = await conn.fetchrow(
            "CALL sp_admin_create_driver($1, $2, $3, $4, NULL)",
            details.name, details.password, details.cnic, details.phone_no)
        return {
                "status": "New driver created",
                "driverId": row[0],
                "name": details.name
                }
