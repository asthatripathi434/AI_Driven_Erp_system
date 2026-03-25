from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

security = HTTPBearer()

def auth_required(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def role_required(allowed_roles: list):
    def wrapper(payload: dict = Depends(auth_required)):
        role = payload.get("role")
        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload
    return wrapper

"""def role_required(allowed_roles: list):
    def wrapper(credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            role = payload.get("role")
            if role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Forbidden")
            return payload
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return wrapper"""


"""from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

security = HTTPBearer()

def role_required(allowed_roles: list):

    Dependency that checks if the JWT token contains one of the allowed roles.
    Usage: Depends(role_required(["admin", "teacher"]))
    
    def wrapper(credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            role = payload.get("role")
            if role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Forbidden")
            return payload
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return wrapper """