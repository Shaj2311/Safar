from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from state import sessions

router = APIRouter(prefix="/users", tags=["User Profiles"])


@router.patch("/me")
async def updateProfile(sessionKey: str, updates: dict):
    return {"message": "Profile updated", "appliedUpdates": updates}

@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: dict):
    return {"message": "Vehicle details updated", "vehicle": vehicleData}

# async def viewDriverProfile(sessionKey: str, userId: int):
#     """Called by passenger to view driver"""
#     return {"driverId": userId}
@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int, db = Depends(get_db)):
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid session")

    async with db.acquire() as conn:
        query = """
            SELECT u.name, d.phone_no, v.make, v.model, v.plate_no,
               (SELECT COUNT(*) FROM Trip WHERE driver_id = $1) AS total_trips
            FROM AppUser u
            JOIN Driver d ON u.user_id = d.driver_id
            LEFT JOIN Vehicle v ON d.driver_id = v.driver_id
            WHERE u.user_id = $1 AND d.is_deleted = false
        """
        profile = await conn.fetchrow(query, userId)
        if not profile:
            raise HTTPException(status_code=404, detail="Driver not found")
        return dict(profile)


@router.get("/{userId}/ratings")
async def viewDriverRatings(sessionKey: str, userId: int, db = Depends(get_db)):
    """Called by passenger to view driver ratings"""
    if sessionKey not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid session")

    async with db.acquire() as conn:
        # Basic query to get all ratings for this driver
        query = """
            select r.score, r.feedback, r.inserted_at rated_at
            from Rating r
            join Trip t on r.trip_id = t.trip_id
            where t.driver_id = $1 and r.is_deleted = false
        """
        rows = await conn.fetch(query, userId)

        # Convert null data to 0 data
        if not rows:
            return {
                    "average_rating": 0.0,
                    "total_reviews": 0,
                    "reviews": []
                    }

        # Accumulate score
        total_score = 0
        reviews_list = []

        for row in rows:
            total_score += row['score']
            reviews_list.append({
                "score": row['score'],
                "feedback": row['feedback'],
                "date": str(row['rated_at']) # String conversion for JSON safety
                })

        # Get average rating
        avg_rating = total_score / len(rows)

        return {
                "average_rating": round(avg_rating, 2),
                "total_reviews": len(rows),
                "reviews": reviews_list
                }
