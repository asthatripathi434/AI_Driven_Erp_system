from fastapi import APIRouter, Depends, Query
from app.core.rbac import auth_required   # ✅ use auth_required instead of role_required
from app.services.result_service import get_results

router = APIRouter(prefix="/results", tags=["results"])

# Results (any authenticated user)
@router.get("/{student_id}", dependencies=[Depends(auth_required)])
async def results(student_id: str, term: str | None = Query(default=None)):
    return await get_results(student_id, term)