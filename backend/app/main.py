from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWTError

from app.api import auth, students, fees, reports, results, timetable, dressfees, payments, webhook
from app.core.config import settings

app = FastAPI(
    title=f"{settings.SCHOOL_NAME} ERP - {settings.SCHOOL_PLACE}",
    version="1.0.0",
    description="School ERP backend for authentication, students, fees, results, timetable, and dress fees."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Public routes
app.include_router(auth.router)
app.include_router(webhook.router)

# Protected routes
app.include_router(students.router, dependencies=[Depends(verify_token)])
app.include_router(fees.router, dependencies=[Depends(verify_token)])
app.include_router(reports.router, dependencies=[Depends(verify_token)])
app.include_router(results.router, dependencies=[Depends(verify_token)])
app.include_router(timetable.router, dependencies=[Depends(verify_token)])
app.include_router(dressfees.router, dependencies=[Depends(verify_token)])
app.include_router(payments.router, dependencies=[Depends(verify_token)])

@app.get("/")
def root():
    return {"status": "ok"}