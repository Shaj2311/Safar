from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db, validate_session
from schemas import RideRequest, GPSData, RatingData

router = APIRouter(prefix="/rides", tags=["Rides"])

@router.post("/")
async def requestRide(sessionKey: str, rideDetails: RideRequest, db = Depends(get_db)):
    """Called by passenger to request a ride"""
    userId = validate_session(sessionKey)

    async with db.acquire() as conn:
        is_passenger = await conn.fetchval(
                "select 1 from passenger where passenger_id = $1 and is_deleted = false", 
                userId
                )

        if not is_passenger:
            raise HTTPException(status_code=403, detail="only passengers can request rides")

        # Placeholder for distance calculation
        estimated_dist = 0.0 

        # Insert trip
        query = """
            insert into trip (passenger_id, pickup_loc, dropoff_loc, estimated_dist)
            values ($1, point($2, $3), point($4, $5), $6)
            returning trip_id
        """
        trip_id = await conn.fetchval(
                query, 
                userId, 
                rideDetails.pickup_x, 
                rideDetails.pickup_y, 
                rideDetails.dropoff_x, 
                rideDetails.dropoff_y, 
                estimated_dist
                )

        return {"status": "Ride requested", "tripId": trip_id}


@router.patch("/{id}/cancel")
async def cancelRide(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        query = "update trip set is_deleted = true, updated_at = now() where trip_id = $1"
        result = await conn.execute(query, id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="ride not found")
            
        return {"rideId": id, "status": "Cancelled"}


@router.get("/{id}")
async def getRideStatus(sessionKey: str, id: int, db = Depends(get_db)):
    """Polled by passenger during ride"""
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = """
            select t.start_time, t.end_time, t.is_deleted
            from trip t
            where t.trip_id = $1
        """
        row = await conn.fetchrow(query, id)
    
    if not row:
        raise HTTPException(status_code=404, detail="ride not found")
        
    print(row)
    if row['is_deleted']:
        return {"Status": "Cancelled"}
    if row['end_time']:
        return {"Status": "Completed"}
    if row['start_time']:
        return {"Status": "In progress"}
    
    return {"Status": "Pending"}


@router.patch("/{id}/accept")
async def acceptRideRequest(sessionKey: str, id: int, db = Depends(get_db)):
    """Called by driver to accept ride request"""
    userId = validate_session(sessionKey)
    
    async with db.acquire() as conn:
        # Check availability
        check = await conn.fetchval("select driver_id from trip where trip_id = $1 and is_deleted = false", id)
        print("(accepting)", check)
        if check is not None:
            raise HTTPException(status_code=410, detail="ride already accepted")
            
        # Acceptance logic: link driver and auto-create chat
        await conn.execute("update trip set driver_id = $1, updated_at = now() where trip_id = $2", userId, id)
        await conn.execute("insert into chat (trip_id) values ($1)", id)
        
        return {"rideId": id, "status": "Accepted"}


@router.post("/{id}/location")
async def updateLocation(sessionKey: str, id: int, gpsData: GPSData, db = Depends(get_db)):
    """Called continuously by driver during ride"""
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        query = "insert into locationhistory (trip_id, location) values ($1, point($2, $3))"
        await conn.execute(query, id, gpsData.x, gpsData.y)
        
        return {"rideId": id, "location": {"x": gpsData.x, "y": gpsData.y}}


@router.patch("/{id}/start")
async def startRide(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        query = "update trip set start_time = now(), updated_at = now() where trip_id = $1"
        result = await conn.execute(query, id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="ride not found")
            
        return {"rideId": id, "status": "In progress"}


@router.patch("/{id}/end")
async def endRide(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        # Update trip completion
        await conn.execute("update trip set end_time = now(), updated_at = now() where trip_id = $1", id)
        
        # Calculate fare
        trip_data = await conn.fetchrow("select estimated_dist from trip where trip_id = $1", id)
        if not trip_data:
            raise HTTPException(status_code=404, detail="ride not found")
            
        dist = float(trip_data['estimated_dist']) if trip_data['estimated_dist'] else 0.0
        base_fare = 100.0
        dist_multiplier = 50.0
        total_fare = base_fare + (dist * dist_multiplier)
        
        # Auto-create payment entry
        pay_query = """
            insert into payment (trip_id, base_amount, trip_amount, estimated_fare, actual_fare)
            values ($1, $2, $3, $4, $4)
        """
        await conn.execute(pay_query, id, base_fare, (total_fare - base_fare), total_fare)
        
        return {"rideId": id, "status": "Completed", "fare": total_fare}


@router.post("/{id}/confirm-payment")
async def confirmPayment(sessionKey: str, id: int, db = Depends(get_db)):
    """Called by driver at end of ride to confirm that they've been paid"""
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        query = "update payment set is_paid = true, updated_at = now() where trip_id = $1"
        result = await conn.execute(query, id)
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="payment record not found")
            
        return {"id": id, "paymentStatus": "Paid"}


@router.get("/{id}/summary")
async def getCompletedRideSummary(sessionKey: str, id: int, db = Depends(get_db)):
    validate_session(sessionKey)
    async with db.acquire() as conn:
        query = """
            select t.passenger_id, p.name as passenger_name, t.driver_id, d.name as driver_name,
            t.start_time, t.end_time,
            t.pickup_loc, t.dropoff_loc,
            t.actual_dist distance,
            pay.base_amount, pay.trip_amount, pay.actual_fare total_fare
            from trip t
            join appuser p on t.passenger_id = p.user_id
            left join appuser d on t.driver_id = d.user_id
            left join payment pay on t.trip_id = pay.trip_id
            where t.trip_id = $1
        """
        summary = await conn.fetchrow(query, id)
        if not summary:
            raise HTTPException(status_code=404, detail="ride not found")

        res = dict(summary)
        # Point conversion
        res["pickup_loc"] = {"x": summary["pickup_loc"].x, "y": summary["pickup_loc"].y}
        res["dropoff_loc"] = {"x": summary["dropoff_loc"].x, "y": summary["dropoff_loc"].y}
        # DateTime to string
        res["start_time"] = str(summary["start_time"])
        res["end_time"] = str(summary["end_time"]) if summary["end_time"] else None
        # Decimal to float
        res["distance"] = float(summary["distance"]) if summary["distance"] else 0.0
        res["base_amount"] = float(summary["base_amount"]) if summary["base_amount"] else 0.0
        res["trip_amount"] = float(summary["trip_amount"]) if summary["trip_amount"] else 0.0
        res["total_fare"] = float(summary["total_fare"]) if summary["total_fare"] else 0.0
        
        return res


@router.post("/{id}/rate")
async def rateDriver(sessionKey: str, id: int, ratingData: RatingData, db = Depends(get_db)):
    validate_session(sessionKey)
    
    async with db.acquire() as conn:
        query = "insert into rating (trip_id, score, feedback) values ($1, $2, $3)"
        await conn.execute(query, id, ratingData.score, ratingData.feedback)
        
        return {"rideId": id, "status": "Rating submitted"}
