from fastapi import APIRouter
from schemas import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
async def signup(userDetails: User):
    return {"Status": "Sign up complete"}

@router.post("/login")
async def login(userDetails: User):
    return {"Status": "Login complete"}
