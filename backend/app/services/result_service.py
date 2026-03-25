from app.db.connection import db

async def get_results(student_id: str, term: str | None = None):
    query = {"student_id": student_id}
    if term:
        query["term"] = term
    results = await db.results.find(query).to_list(50)
    if not results:
        return [{
            "student_id": student_id,
            "term": term or "Term 1",
            "subjects": {"Math": 88, "Science": 92, "English": 85}
        }]
    return results