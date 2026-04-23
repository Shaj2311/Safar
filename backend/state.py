import asyncio
import time

# Hardcode one logged in user
sessions = {"asdf": {
    "userId": 1,
    "expiry": time.time() + 3600
    }}


def create_session(session_key: str, user_id: int):
    # Set expiry for 1 hour from now
    sessions[session_key] = {
        "userId": user_id,
        "expiry": time.time() + 3600
    }


async def session_sweeper():
    """Background task to remove expired sessions every 5 minutes"""
    while True:
        current_time = time.time()

        # Create a list of keys to delete to avoid 'dict size changed during iteration' error
        expired_keys = [
                k for k, v in sessions.items()
                if current_time > v["expiry"]
                ]

        # Delete all expired keys
        for k in expired_keys:
            del sessions[k]

        await asyncio.sleep(300) # Wait 5 minutes before sweeping again
