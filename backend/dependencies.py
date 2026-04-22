from fastapi import Request

# DB connection getter
async def get_db(request: Request):
    return request.app.state.db
