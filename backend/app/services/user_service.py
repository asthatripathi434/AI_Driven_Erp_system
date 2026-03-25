from app.db.connection import db
from app.core.security import verify_password

async def create_user(user):
    existing = await db.users.find_one({"username": user.username})
    if existing:
        return None

    # password is already hashed in signup
    doc = {
        "username": user.username,
        "password": user.password,
        "role": user.role
    }
    await db.users.insert_one(doc)

    # return safe fields only
    return {"username": user.username, "role": user.role}


async def authenticate_user(username: str, password: str):
    user = await db.users.find_one({"username": username})
    if not user:
        return None

    if not verify_password(password, user["password"]):
        return None

    return user
