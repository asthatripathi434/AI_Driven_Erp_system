from fastapi import APIRouter, UploadFile, File, HTTPException
from app.db.connection import db
import pandas as pd
from io import BytesIO
from pathlib import Path
from bson import ObjectId
from fastapi.responses import FileResponse
from app.api.auth import decode_token
import math

router = APIRouter(prefix="/students", tags=["students"])

FILE_PATH = Path(r"C:\Users\astha\Downloads\students_data.xlsx")

# ✅ List students (open to anyone)
@router.get("/")
async def list_students():
    students = await db.students.find().to_list(200)
    if not students:
        return {"message": "No students found. Upload a file or sign up first."}

    for s in students:
        if "_id" in s and isinstance(s["_id"], ObjectId):
            s["_id"] = str(s["_id"])
        # sanitize floats
        for k, v in s.items():
            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                s[k] = None
    return students

# ✅ Add single student (open to anyone)
@router.post("/")
async def add_student(student: dict):
    if "student_id" not in student or "name" not in student:
        raise HTTPException(status_code=400, detail="Student must include student_id and name")
    await db.students.insert_one(student)
    return {"status": "created"}

# ✅ Bulk upload students from Excel/CSV (open to anyone)
@router.post("/upload")
async def upload_students(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(contents))
        elif file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only .xlsx or .csv files supported")

        df.rename(columns={
            "Student_ID": "student_id",
            "Name": "name",
            "Class_Level": "class_level",
            "Fees": "fees"
        }, inplace=True)

        if "student_id" not in df.columns or "name" not in df.columns:
            raise HTTPException(status_code=400, detail="File must include 'student_id' and 'name' columns")

        records = df.to_dict(orient="records")

        ops = []
        for r in records:
            ops.append({
                "update_one": {
                    "filter": {"student_id": r.get("student_id")},
                    "update": {"$set": r},
                    "upsert": True
                }
            })
        if ops:
            await db.students.bulk_write(ops)

        # sanitize before saving
        df = df.replace([float("inf"), float("-inf")], None)
        df = df.where(pd.notnull(df), None)

        df.to_excel(FILE_PATH, index=False)

        return {"status": "success", "inserted_or_updated": len(records)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Export all students to Excel (open to anyone)
@router.get("/export")
async def export_students():
    try:
        students = await db.students.find().to_list(200)
        if not students:
            raise HTTPException(status_code=404, detail="No students found to export")

        # Convert ObjectId to string and sanitize floats
        for s in students:
            if "_id" in s and isinstance(s["_id"], ObjectId):
                s["_id"] = str(s["_id"])
            for k, v in s.items():
                if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    s[k] = None

        # Create DataFrame and sanitize
        df = pd.DataFrame(students)
        df = df.replace([float("inf"), float("-inf")], None)
        df = df.where(pd.notnull(df), None)

        # Save to Excel file
        export_path = FILE_PATH.parent / "students_export.xlsx"
        df.to_excel(export_path, index=False)

        return FileResponse(
            path=export_path,
            filename="students_export.xlsx",
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Upload student certificate (open to anyone)
ALLOWED_EXTENSIONS = {"pdf", "docx", "png", "jpg", "jpeg"}

@router.post("/upload-certificate")
async def upload_certificate(token: str, file: UploadFile = File(...), certificate_type: str = "general"):
    # Decode token to get student ID
    decoded = decode_token(token)
    student_id = decoded["id"]

    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Save metadata in MongoDB
    await db.certificates.insert_one({
        "student_id": student_id,
        "certificate_type": certificate_type,  # e.g. "migration", "leaving", "quota"
        "filename": file.filename,
        "content_type": file.content_type,
    })

    # Save file to disk
    save_dir = FILE_PATH.parent / "certificates"
    save_dir.mkdir(parents=True, exist_ok=True)
    save_path = save_dir / f"{student_id}_{certificate_type}_{file.filename}"

    with open(save_path, "wb") as f:
        f.write(await file.read())

    return {"status": "success", "message": f"{certificate_type.capitalize()} certificate uploaded successfully"}