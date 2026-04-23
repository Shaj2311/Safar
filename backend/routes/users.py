from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session

router = APIRouter(prefix="/users", tags=["User Profiles"])


@router.patch("/me")
async def updateProfile(sessionKey: str, updates: dict):
    validate_session(sessionKey)
    return {"message": "Profile updated", "appliedUpdates": updates}

@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: dict):
    validate_session(sessionKey)
    return {"message": "Vehicle details updated", "vehicle": vehicleData}

@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int, db = Depends(get_db)):
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select u.name, d.phone_no, v.make, v.model, v.plate_no,
               (select count(*) from trip where driver_id = $1) as total_trips
            from appuser u
            join driver d on u.user_id = d.driver_id
            left join vehicle v on d.driver_id = v.driver_id
            where u.user_id = $1 and d.is_deleted = false
        """
        profile = await conn.fetchrow(query, userId)
        if not profile:
            raise HTTPException(status_code=404, detail="driver not found")
        return dict(profile)


@router.get("/{userId}/ratings")
async def viewDriverRatings(sessionKey: str, userId: int, db = Depends(get_db)):
    """Called by passenger to view driver ratings"""
    validate_session(sessionKey)

    async with db.acquire() as conn:
        query = """
            select r.score, r.feedback, r.inserted_at rated_at
            from rating r
            join trip t on r.trip_id = t.trip_id
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
