from fastapi import APIRouter, Depends
from app.core.rbac import auth_required   # ✅ use auth_required instead of role_required

router = APIRouter(prefix="/reports", tags=["reports"])

# Attendance report (any authenticated user)
@router.get("/attendance", dependencies=[Depends(auth_required)])
async def attendance_report():
    return {
        "summary": {"present": 450, "absent": 30},
        "by_class": {"6A": {"present": 40, "absent": 2}}
    }

# Marks summary (any authenticated user)
@router.get("/marks-summary", dependencies=[Depends(auth_required)])
async def marks_summary():
    return {
        "avg_scores": {"Math": 78, "Science": 82, "English": 75}
    }