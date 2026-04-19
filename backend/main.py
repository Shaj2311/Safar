from fastapi import FastAPI
import asyncpg
from dotenv import load_dotenv
import os
from backend.routes import auth, users, rides, drivers, history, comms
from backend.routes.staff import admin, superAdmin, support, staff

# Load DB environment variables
load_dotenv("db/.env")

# Initialize API
app = FastAPI()
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rides.router)
app.include_router(drivers.router)
app.include_router(history.router)
app.include_router(comms.router)
app.include_router(admin.router)
app.include_router(support.router)
app.include_router(superAdmin.router)
app.include_router(staff.router)


# Connect to DB at startup
@app.on_event("startup")
async def startup():
    print("Connecting!")
    app.state.db = await asyncpg.create_pool(
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            database=os.getenv("POSTGRES_DB"),
            host="localhost"
            )


# Disconnect from DB at shutdown
@app.on_event("shutdown")
async def shutdown():
    print("Disconecting!")
    await app.state.db.close()


@app.get("/")
async def root():
    return {"Welcome": "Welcome to Safar!"}
