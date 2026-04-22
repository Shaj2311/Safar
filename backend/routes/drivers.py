from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from state import sessions

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/me")
async def getDriverProfile(sessionKey: str, id: int, db = Depends(get_db)):
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="unauthorized")

    # check if the session belongs to the id requested
    if sessions[sessionKey] != id:
        raise HTTPException(status_code=403, detail="forbidden")

    async with db.acquire() as conn:
        query = """
            select d.driver_id, u.name, d.cnic, d.phone_no
            from Driver d
            join AppUser u on d.driver_id = u.user_id
            where d.driver_id = $1 and d.is_deleted = false
        """
        profile = await conn.fetchrow(query, id)
        if not profile:
            raise HTTPException(status_code=404, detail="driver not found")

        return {
                "driverId": profile["driver_id"],
                "name": profile["name"],
                "cnic": profile["cnic"],
                "phoneNo": profile["phone_no"]
                }


@router.get("/incomingRequests")
async def checkIncomingRequests(sessionKey: str, db = Depends(get_db)):
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="unauthorized")

    async with db.acquire() as conn:
        query = """
            select trip_id, passenger_id, pickup_loc, dropoff_loc, estimated_dist
            from Trip
            where driver_id is null and is_deleted = false
        """
        rows = await conn.fetch(query)

        # Point conversion
        requests = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]

            requests.append({
                "tripId": row["trip_id"],
                "passengerId": row["passenger_id"],
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "dist": float(row["estimated_dist"]) if row["estimated_dist"] else 0.0
                })
        return requests

@router.get("/incomingRequests/{id}")
async def getRideRequestDetails(sessionKey: str, id: int, db = Depends(get_db)):
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="unauthorized")

    async with db.acquire() as conn:
        query = """
            select trip_id, passenger_id, pickup_loc, dropoff_loc, estimated_dist, inserted_at
            from Trip
            where trip_id = $1 and driver_id is null
        """
        row = await conn.fetchrow(query, id)
        if not row:
            raise HTTPException(status_code=404, detail="request not found")

        # Point conversion
        p_loc = row["pickup_loc"]
        d_loc = row["dropoff_loc"]

        return {
                "tripId": row["trip_id"],
                "passengerId": row["passenger_id"],
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "estimatedDist": float(row["estimated_dist"]) if row["estimated_dist"] else 0.0,
                "requestedAt": str(row["inserted_at"])
                }
