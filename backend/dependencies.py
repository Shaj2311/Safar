from fastapi import Request
from state import sessions
import time

# DB connection getter
async def get_db(request: Request):
    return request.app.state.db

from fastapi import HTTPException

def validate_session(session_key: str):
    """
    Validates session existence and expiry.
    Returns userId if valid, otherwise raises HTTPException.
    """
    # Check existence in sessions dict
    print("Validating session key ", session_key)
    print("Active sessions:")
    print(sessions)
    session_data = sessions.get(session_key)
    if not session_data:
        raise HTTPException(status_code=401, detail="unauthorized")

    # Check expired
    if time.time() > session_data["expiry"]:
        del sessions[session_key]
        raise HTTPException(status_code=401, detail="session expired")

    # Valid
    return session_data["userId"]
