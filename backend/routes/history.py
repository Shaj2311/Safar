from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from state import sessions

router = APIRouter(prefix="/history", tags=["Trip History"])
@router.get("/summary")
async def viewEarnings(sessionKey: str, driverId: int, db = Depends(get_db)):
    # Return exception if not logged in, or trying to view earnings of some other user
    if sessionKey not in sessions or sessions[sessionKey] != driverId:
        raise HTTPException(status_code=401, detail="unauthorized")

    async with db.acquire() as conn:
        query = """
            select p.trip_id, p.actual_fare
            from Payment p
            join Trip t on p.trip_id = t.trip_id
            where t.driver_id = $1
            and p.is_paid = true
            and p.is_deleted = false
        """
        rows = await conn.fetch(query, driverId)

        # return empty list if no records
        if not rows:
            return []

        earnings_list = []
        total_sum = 0.0

        for row in rows:
            fare = float(row["actual_fare"]) if row["actual_fare"] else 0.0
            total_sum += fare
            earnings_list.append({
                "tripId": row["trip_id"],
                "rideFare": fare
                })

        # Return earnings and a summary
        return {
                "totalEarnings": round(total_sum, 2),
                "count": len(earnings_list),
                "items": earnings_list
                }


@router.get("/rides")
async def getPastTrips(sessionKey: str, driverId: int, db = Depends(get_db)):
    if sessionKey not in sessions or sessions[sessionKey] != driverId:
        raise HTTPException(status_code=401, detail="unauthorized")

    async with db.acquire() as conn:
        query = """
            select t.trip_id, t.start_time, t.pickup_loc, t.dropoff_loc, p.actual_fare
            from trip t
            join payment p on t.trip_id = p.trip_id
            where t.driver_id = $1
            and t.is_deleted = false
            order by t.start_time desc
        """
        rows = await conn.fetch(query, driverId)

        trips = []
        for row in rows:
            p_loc = row["pickup_loc"]
            d_loc = row["dropoff_loc"]
            trips.append({
                "tripId": row["trip_id"],
                "startTime": str(row["start_time"]),
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "fare": float(row["actual_fare"]) if row["actual_fare"] else 0.0
                })
        return trips


@router.get("/rides/{id}")
async def getPastTripDetails(sessionKey: str, id: int, db = Depends(get_db)):
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="unauthorized")

    async with db.acquire() as conn:
        query = """
            select
            t.trip_id, t.start_time, t.end_time, t.pickup_loc, t.dropoff_loc, t.actual_dist,
            p.base_amount, p.trip_amount, p.actual_fare, p.is_paid,
            p_user.name as passenger_name
            from trip t
            left join payment p on t.trip_id = p.trip_id
            join appuser p_user on t.passenger_id = p_user.user_id
            where t.trip_id = $1
        """
        row = await conn.fetchrow(query, id)

        if not row:
            raise HTTPException(status_code=404, detail="trip not found")

        p_loc = row["pickup_loc"]
        d_loc = row["dropoff_loc"]

        return {
                "tripId": row["trip_id"],
                "startTime": str(row["start_time"]),
                "endTime": str(row["end_time"]) if row["end_time"] else None,
                "pickup": {"x": p_loc.x, "y": p_loc.y},
                "dropoff": {"x": d_loc.x, "y": d_loc.y},
                "distance": float(row["actual_dist"]) if row["actual_dist"] else 0.0,
                "passengerName": row["passenger_name"],
                "payment": {
                    "base": float(row["base_amount"]) if row["base_amount"] else 0.0,
                    "trip": float(row["trip_amount"]) if row["trip_amount"] else 0.0,
                    "total": float(row["actual_fare"]) if row["actual_fare"] else 0.0,
                    "isPaid": row["is_paid"]
                    }
                }
