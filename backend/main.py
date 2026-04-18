from fastapi import FastAPI
from backend.routes import auth, users, rides, drivers, history, comms, staff

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rides.router)
app.include_router(drivers.router)
app.include_router(history.router)
app.include_router(comms.router)
app.include_router(staff.router)

@app.get("/")
async def root():
    return {"Welcome": "Welcome to Safar!"}
