import asyncio
import time
from fastapi import HTTPException

# Global session storage
sessions = {}

def create_session(user_id: int):
    """Generates a UUID key and stores the session"""
    import uuid
    session_key = str(uuid.uuid4())
    
    sessions[session_key] = {
        "userId": user_id,
        "expiry": time.time() + 3600
    }
    print("Session created: ", sessions[session_key])
    print("Active sessions: ")
    print(sessions)
    return session_key

def validate_session(sessionKey: str):
    """Validation used by almost all API calls"""
    session = sessions.get(sessionKey)
    
    if not session:
        # This is where your 401 is coming from
        raise HTTPException(status_code=401, detail="Session invalid or expired")
    
    return session["userId"]

async def session_sweeper():
    """Background task to remove expired sessions every 5 minutes"""
    while True:
        current_time = time.time()
        expired_keys = [k for k, v in sessions.items() if current_time > v["expiry"]]
        
        print("Logging out expired keys: ")
        print(expired_keys)
        for k in expired_keys:
            del sessions[k]
            
        await asyncio.sleep(300)
