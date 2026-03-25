from app.db.connection import db

async def get_fee_overview(student_id: str | None = None):
    query = {"student_id": student_id} if student_id else {}
    fees = await db.fees.find(query).to_list(200)
    return fees

async def get_fee_breakdown(student_id: str):
    doc = await db.fees.find_one({"student_id": student_id})
    if not doc:
        return {
            "student_id": student_id,
            "tuition": 12000.0,
            "exam": 1500.0,
            "dress": 2000.0,
            "transport": 0.0,
            "paid": 5000.0,
        }
    return doc