from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db

router = APIRouter(prefix="/history", tags=["Trip History"])

@router.get("/summary")
async def viewEarnings(sessionKey: str, driverId: int, db = Depends(get_db)):
    """Called by driver to view past earnings"""
    async with db.acquire() as conn:
        query = """
            select p.trip_id, p.actual_fare ride_fare
            from Payment p
            join Trip t on p.trip_id = t.trip_id
            where t.driver_id = $1
            and p.is_paid = true
            and p.is_deleted = false
        """
        earnings = await conn.fetch(query, driverId)
        if not earnings:
            raise HTTPException(status_code=404, detail="No earnings found")
        return earnings


@router.get("/rides")
async def getPastTrips(sessionKey: str, driverId: int, db = Depends(get_db)):
    """Called by driver to view their past trips"""
    async with db.acquire() as conn:
        query = """
            SELECT t.trip_id, t.start_time, t.pickup_loc, t.dropoff_loc, p.actual_fare
            FROM Trip t
            JOIN Payment p ON t.trip_id = p.trip_id
            WHERE t.driver_id = $1
            AND t.is_deleted = false
            ORDER BY t.start_time DESC
        """
        trips = await conn.fetch(query, driverId)
        if not trips:
            raise HTTPException(status_code=404, detail="No trips found")
        return trips

@router.get("/rides/{id}")
async def getPastTripDetails(sessionKey: str, id: int, db = Depends(get_db)):
    """Called by driver to view a certain past trip"""
    async with db.acquire() as conn:
        query = """
            SELECT
            t.trip_id, t.start_time, t.end_time, t.pickup_loc, t.dropoff_loc, t.actual_dist,
            p.base_amount, p.trip_amount, p.actual_fare, p.is_paid,
            p_user.name AS passenger_name
            FROM Trip t
            LEFT JOIN Payment p ON t.trip_id = p.trip_id
            LEFT JOIN Vehicle v ON t.driver_id = v.driver_id
            JOIN AppUser d_user ON t.driver_id = d_user.user_id
            JOIN AppUser p_user ON t.passenger_id = p_user.user_id
            WHERE t.trip_id = $1
        """
        trip = await conn.fetchrow(query, id)
        
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        return dict(trip)
