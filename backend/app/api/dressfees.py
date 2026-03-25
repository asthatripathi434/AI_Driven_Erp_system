from fastapi import APIRouter, Depends
from app.core.rbac import auth_required   # ✅ use auth_required instead of role_required

router = APIRouter(prefix="/dressfees", tags=["dressfees"])

# Dress fee (any authenticated user)
@router.get("/{student_id}", dependencies=[Depends(auth_required)])
async def dress_fee(student_id: str):
    return {
        "student_id": student_id,
        "items": [
            {"type": "Uniform Set", "amount": 2000.0}
        ],
        "total": 2000.0
    }