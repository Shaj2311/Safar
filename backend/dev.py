import time
from state import sessions

def setup_dev_sessions():
    """Hardcoded dev sessions mapping to init.sql users"""
    
    dev_users = [
        {"id": 1, "name": "John Driver"},
        {"id": 2, "name": "Jane Driver"},
        {"id": 3, "name": "Alice Passenger"},
        {"id": 4, "name": "Bob Passenger"},
        {"id": 5, "name": "Charlie Admin"},
        {"id": 6, "name": "Dana Support"}
    ]

    print(f"\n--- [DEV MODE] Injecting Hardcoded Sessions ---")
    
    for user in dev_users:
        uid = user["id"]
        dev_key = f"session-{uid}"
        
        # Inject directly into the global sessions dict from state.py
        sessions[dev_key] = {
            "userId": uid,
            "expiry": time.time() + 86400 * 30  # 30 days
        }
        print(f"  Login: {user['name']:15} | Key: {dev_key}")
        
    print("--- [DEV MODE] Ready: No DB queries performed ---\n")
