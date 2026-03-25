from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException
from app.core.config import settings

# bcrypt hashing for secure passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # bcrypt limit: 72 bytes
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password too long. Must be 72 characters or fewer."
        )
    if len(password) < 12:
        raise HTTPException(
            status_code=400,
            detail="Password too short. Must be at least 12 characters."
        )
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    pw_bytes = plain.encode("utf-8")
    if len(pw_bytes) > 72:
        # reject too-long passwords at login
        return False
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    ))
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")