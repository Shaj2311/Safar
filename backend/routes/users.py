from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import PassengerUpdate, DriverUpdate, VehicleUpdate

router = APIRouter(prefix="/users", tags=["User Profiles"])


# Passenger
@router.patch("/me/passenger")
async def updatePassengerProfile(sessionKey: str, updates: PassengerUpdate, db = Depends(get_db)):
    """Update passenger profile data"""
    userId = validate_session(sessionKey)
    
    async with db.acquire() as conn:
        # verify existence
        is_passenger = await conn.fetchval(
            "select 1 from passenger where passenger_id = $1 and is_deleted = false", 
            userId
        )
        if not is_passenger:
            raise HTTPException(status_code=403, detail="user is not a registered passenger")

        # Update AppUser table (Core attributes)
        if updates.name:
            await conn.execute(
                "update appuser set name = $1 where user_id = $2",
                updates.name, userId
            )

        # Update Passenger table (Role-specific attributes)
        if updates.name or updates.cnic or updates.phone:
            # We use coalesce here so that if a field isn't provided in the request, 
            # it keeps its current value in the database.
            query = """
                update passenger 
                    set cnic = coalesce($1, cnic), 
                    phone_no = coalesce($2, phone_no) 
                where passenger_id = $3
            """
            await conn.execute(
                query, 
                updates.cnic, 
                updates.phone, 
                userId
            )
            
        return {"status": "Passenger profile updated"}


# Driver
@router.patch("/me/driver")
async def updateDriverProfile(sessionKey: str, updates: DriverUpdate, db = Depends(get_db)):
    """Update driver-specific profile and phone number"""
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        # Verify role
        is_driver = await conn.fetchval("select 1 from driver where driver_id = $1", userId)
        if not is_driver:
            raise HTTPException(status_code=403, detail="user is not a registered driver")

        # Update name in AppUser
        if updates.name:
            await conn.execute("update appuser set name = $1 where user_id = $2", updates.name, userId)

        # Update phone in Driver table
        if updates.phone_no:
            await conn.execute("update driver set phone_no = $1 where driver_id = $2", updates.phone_no, userId)

        return {"status": "Driver profile updated"}


@router.patch("/me/vehicle")
async def updateVehicle(sessionKey: str, vehicleData: VehicleUpdate, db = Depends(get_db)):
    userId = validate_session(sessionKey)
    
    async with db.acquire() as conn:
        # Role Check
        is_driver = await conn.fetchval("select 1 from driver where driver_id = $1", userId)
        if not is_driver:
            raise HTTPException(status_code=403, detail="not a driver")

        # Does a vehicle already exist for this driver?
        exists = await conn.fetchval("select 1 from vehicle where driver_id = $1", userId)

        if exists:
            #Update
            query = """
                update vehicle set 
                    make = $1, model = $2, engine_no = $3, chassis_no = $4, 
                    plate_no = $5, owner_name = $6, owner_cnic = $7
                where driver_id = $8
            """
            await conn.execute(query, vehicleData.make, vehicleData.model, vehicleData.engine_no, 
                               vehicleData.chassis_no, vehicleData.plate_no, vehicleData.owner_name, 
                               vehicleData.owner_cnic, userId)
        else:
            # insert
            query = """
                insert into vehicle (driver_id, make, model, engine_no, chassis_no, plate_no, owner_name, owner_cnic)
                values ($1, $2, $3, $4, $5, $6, $7, $8)
            """
            await conn.execute(query, userId, vehicleData.make, vehicleData.model, vehicleData.engine_no, 
                               vehicleData.chassis_no, vehicleData.plate_no, vehicleData.owner_name, 
                               vehicleData.owner_cnic)

        return {"status": "Vehicle updated"}



@router.get("/{userId}/profile")
async def viewDriverProfile(sessionKey: str, userId: int, db = Depends(get_db)):
    """View public driver profile, car info, and trip count"""
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
