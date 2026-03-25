from fastapi import APIRouter, Depends
from app.core.rbac import auth_required   # ✅ use auth_required instead of role_required

router = APIRouter(prefix="/timetable", tags=["timetable"])

# Exam timetable (any authenticated user)
@router.get("/", dependencies=[Depends(auth_required)])
async def exam_timetable():
    return {
        "term": "Term 1",
        "schedule": [
            {"date": "2026-02-01", "subject": "Math", "time": "10:00-12:00"},
            {"date": "2026-02-03", "subject": "Science", "time": "10:00-12:00"},
            {"date": "2026-02-05", "subject": "English", "time": "10:00-12:00"},
        ]
    }