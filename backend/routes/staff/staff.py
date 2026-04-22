from fastapi import APIRouter, Depends
from dependencies import get_db

router = APIRouter(prefix="/staff", tags=["Staff"])

# Rides

@router.get("/rides")
async def staffViewRides(sessionKey: str, searchStr: str | None = None, filters: dict | None = None, db = Depends(get_db)):
    async with db.acquire() as conn:
        # Not implementing filtering yet

        # Base query
        query = """
            SELECT
                t.trip_id,
                p.name as passenger_name,
                d.name as driver_name,
                t.pickup_loc, 
                t.dropoff_loc
            FROM Trip t
            LEFT JOIN AppUser p ON t.passenger_id = p.user_id
            LEFT JOIN AppUser d ON t.driver_id = d.user_id
            WHERE 1=1
        """

        params = []
        counter = 1

        # Search
        if searchStr:
            query += f" and (t.trip_id::text ILIKE ${counter} or p.name ILIKE ${counter} or d.name ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        ## Filter
        #if filters:
        #    for key, value in filters.items():
        #        # Safety check: Ensure the key is a valid column to prevent injection
        #        if key in ["status", "passenger_id", "driver_id"]:
        #            query += f" AND t.{key} = ${counter}"
        #            params.append(value)
        #            counter += 1

        query += " ORDER BY t.inserted_at DESC"

        rides = await conn.fetch(query, *params)
        if not rides:
            return {"Error": "No matching rides"}
        return [dict(row) for row in rides]




@router.get("/rides/{id}")
async def staffViewRideDetails(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select
            t.trip_id,
            t.passenger_id, p.name passenger_name,
            t.driver_id, d.name driver_name,
            t.start_time, t.end_time,
            t.pickup_loc, t.dropoff_loc,
            t.estimated_dist, t.actual_dist
            from Trip t
            join AppUser p on t.passenger_id = p.user_id
            join AppUser d on t.passenger_id = d.user_id
            where t.trip_id = $1
        """
        rideDetails = await conn.fetchrow(query, id)
        if not rideDetails:
            return {"Error": "Ride does not exist"}
        return rideDetails



# Tickets
@router.get("/tickets")
async def viewAllTickets(sessionKey: str, searchStr: str | None = None, filters: dict | None = None, db = Depends(get_db)):
    async with db.acquire() as conn:
        # Not implementing filtering yet

        # Base query
        query = """
            SELECT
            FROM Ticket ti
            LEFT JOIN Trip tr ON ti.trip_id = tr.trip_id
            LEFT JOIN Staff s ON ti.staff_id = s.staff_id
            WHERE 1=1
        """

        params = []
        counter = 1

        # Search
        if searchStr:
            query += f" and (tr.trip_id::text ILIKE ${counter} or s.staff_id::text ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        ## Filter
        #if filters:
        #    for key, value in filters.items():
        #        # Safety check: Ensure the key is a valid column to prevent injection
        #        if key in ["status", "passenger_id", "driver_id"]:
        #            query += f" AND t.{key} = ${counter}"
        #            params.append(value)
        #            counter += 1

        query += " ORDER BY ti.inserted_at DESC"

        rides = await conn.fetch(query, *params)
        if not rides:
            return {"Error": "No matching rides"}
        return [dict(row) for row in rides]


@router.get("/tickets/{id}")
async def viewTicketDetails(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select *
            from Ticket t
            where t.ticket_id = $1
        """
        ticketDetails = await conn.fetchrow(query, id)
        if not ticketDetails:
            return {"Error": "Ticket does not exist"}
        return ticketDetails


@router.patch("/tickets/{id}/resolve")
async def resolveTicket(sessionKey: str, id: int):
    return {"ticketId": id, "status": "Resolved"}


@router.delete("/tickets/{id}")
async def deleteTicket(sessionKey: str, id: int):
    return {"id": id, "status": "deleted"}


@router.patch("/tickets/{id}")
async def editTicketDetails(sessionKey: str, id: int, updates: dict):
    return {"ticketId": id, "updates": updates}


# Passengers
@router.get("/passengers")
async def viewAllPassengers(sessionKey: str, searchStr: str | None = None, filters: dict | None = None, db = Depends(get_db)):
    async with db.acquire() as conn:
        # Not implementing filtering yet

        # Base query
        query = """
            select p.passenger_id, u.name, p.cnic, p.phone_no
            from Passenger p
            join AppUser u on p.passenger_id = u.user_id
        """

        params = []
        counter = 1

        # Search
        if searchStr:
            query += f"and (p.passenger_id::text ILIKE ${counter} or u.name ILIKE ${counter} or p.cnic ILIKE ${counter} or p.phone_no ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        ## Filter
        #if filters:
        #    for key, value in filters.items():
        #        # Safety check: Ensure the key is a valid column to prevent injection
        #        if key in ["status", "passenger_id", "driver_id"]:
        #            query += f" AND t.{key} = ${counter}"
        #            params.append(value)
        #            counter += 1

        query += " ORDER BY p.inserted_at DESC"

        passengers = await conn.fetch(query, *params)
        if not passengers:
            return {"Error": "No passengers"}
        return [dict(row) for row in passengers]


@router.get("/passengers/{id}")
async def viewPassengerDetails(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select p.passenger_id, u.name, p.cnic, p.phone_no
            from Passenger p
            join AppUser u on p.passenger_id = u.user_id
            where p.passenger_id = $1
        """
        passengerDetails = await conn.fetchrow(query, id)
        if not passengerDetails:
            return {"Error": "Passenger does not exist"}
        return passengerDetails


# Drivers
@router.get("/drivers/")
async def viewAllDrivers(sessionKey: str, searchStr: str | None = None, filters: dict | None = None, db = Depends(get_db)):
    async with db.acquire() as conn:
        # Not implementing filtering yet

        # Base query
        query = """
            select d.driver_id, u.name, d.cnic, d.phone_no
            from Driver d
            join AppUser u on d.driver_id = u.user_id
        """

        params = []
        counter = 1

        # Search
        if searchStr:
            query += f"and (d.driver_id::text ILIKE ${counter} or u.name ILIKE ${counter} or d.cnic ILIKE ${counter} or d.phone_no ILIKE ${counter})"
            params.append(f"%{searchStr}%")
            counter += 1

        ## Filter
        #if filters:
        #    for key, value in filters.items():
        #        # Safety check: Ensure the key is a valid column to prevent injection
        #        if key in ["status", "passenger_id", "driver_id"]:
        #            query += f" AND t.{key} = ${counter}"
        #            params.append(value)
        #            counter += 1

        query += " ORDER BY d.inserted_at DESC"

        drivers = await conn.fetch(query, *params)
        if not drivers:
            return {"Error": "No drivers"}
        return [dict(row) for row in drivers]


@router.get("/drivers/{id}")
async def viewDriverDetails(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select d.driver_id, u.name, d.cnic, d.phone_no,
            v.make, v.model, v.engine_no, v.chassis_no,
            v.plate_no, v.owner_name, v.owner_cnic
            from Driver d
            join AppUser u on d.driver_id = u.user_id
            join Vehicle v on d.driver_id = v.driver_id
            where d.driver_id = $1
        """
        driverDetails = await conn.fetchrow(query, id)
        if not driverDetails:
            return {"Error": "Driver does not exist"}
        return driverDetails


# Call
@router.post("/passengers/call")
async def staffCallPassenger(sessionKey: str, id: int, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select p.phone_no
            from Passenger p
            where p.passenger_id = $1
        """
        passengerPhoneNo = await conn.fetchval(query, id)
        if not passengerPhoneNo:
            return {"Error": "Passenger does not exist or phone number not registered"}
        return passengerPhoneNo

@router.post("/drivers/call")
async def staffCallDriver(sessionKey: str, details: dict, db = Depends(get_db)):
    async with db.acquire() as conn:
        query = """
            select d.phone_no
            from Passenger d
            where d.driver_id = $1
        """
        driverPhoneNo = await conn.fetchval(query, id)
        if not driverPhoneNo:
            return {"Error": "Driver does not exist or phone number not registered"}
        return driverPhoneNo
