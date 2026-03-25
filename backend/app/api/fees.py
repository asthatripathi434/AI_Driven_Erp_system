from fastapi import APIRouter, HTTPException, Request, Depends, Query
from bson import ObjectId
from app.db.connection import db
from app.api.auth import decode_token
from app.core.rbac import auth_required   # use auth_required instead of role_required
from app.services.fee_service import get_fee_overview, get_fee_breakdown

router = APIRouter(prefix="/fees", tags=["fees"])

# -----------------------------
# Utility: Fee calculation
# -----------------------------
def calculate_fee(class_level: int, paid: int = 0):
    if 1 <= class_level <= 3:
        fee = 10000
    elif 4 <= class_level <= 6:
        fee = 12000
    elif 7 <= class_level <= 10:
        fee = 15000
    else:
        fee = 0
    remaining = fee - paid if paid <= fee else 0
    return {"total": fee, "paid": paid, "remaining": remaining}

# -----------------------------
# Student Fee Details (token-based)
# -----------------------------
@router.get("/details")
async def get_student_fees(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]
    payload = decode_token(token)

    student = await db.students.find_one({"_id": ObjectId(payload["id"])})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    paid = student.get("paid", 0)
    fee_info = calculate_fee(student["class_level"], paid)

    return {
        "student": {
            "id": str(student["_id"]),   # ✅ include ID here
            "name": student["name"],
            "standard": student["class_level"]
        },
        "fees": fee_info
    }

# -----------------------------
# Pay Fees (token-based)
# -----------------------------
@router.post("/pay")
async def pay_fees(request: Request, amount: int, method: str):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]
    payload = decode_token(token)

    student = await db.students.find_one({"_id": ObjectId(payload["id"])})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_paid = student.get("paid", 0) + amount
    fee_info = calculate_fee(student["class_level"], new_paid)

    await db.students.update_one(
        {"_id": ObjectId(payload["id"])},
        {"$set": {"paid": fee_info["paid"], "remaining": fee_info["remaining"], "fee": fee_info["total"]}}
    )

    return {"updatedFees": fee_info}

# -----------------------------
# Fees overview (service-based)
# -----------------------------
@router.get("/", dependencies=[Depends(auth_required)])
async def fees_overview(student_id: str | None = Query(default=None)):
    return await get_fee_overview(student_id)

# -----------------------------
# Fee breakdown (service-based)
# -----------------------------
@router.get("/breakdown/{student_id}", dependencies=[Depends(auth_required)])
async def fee_breakdown(student_id: str):
    data = await get_fee_breakdown(student_id)
    total = data.get("tuition", 0) + data.get("exam", 0) + data.get("dress", 0) + data.get("transport", 0)
    paid = data.get("paid", 0)
    remaining = total - paid
    return {
        "student_id": student_id,
        "total": total,
        "paid": paid,
        "remaining": remaining,
        "items": data
    }