from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.db.connection import db
from passlib.context import CryptContext
import jwt
from app.core.config import settings
import pandas as pd
from pathlib import Path
from bson import ObjectId
from datetime import datetime
import razorpay


router = APIRouter(prefix="/auth", tags=["auth"])
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET))


school_router = APIRouter(prefix="/school", tags=["school"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
FILE_PATH = Path(r"C:\Users\astha\Downloads\students_data.xlsx")
STUDENT_SHEET = "newstudent"
STAFF_SHEET="staff"

# -----------------------------
# Request Models
# -----------------------------
class StudentSignupRequest(BaseModel):
    name: str
    email: str
    password: str
    class_level: str
    birthYear: int
    address: str
    role: str 

class TeacherSignupRequest(BaseModel):   
    name: str
    email: str
    password: str
    subject: str
    department: str
    address: str

class LoginRequest(BaseModel):
    name: str
    password: str
# -----------------------------
# Utility Functions
# -----------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# -----------------------------
# Student Signup Route
# -----------------------------
@router.post("/signup-student")
async def signup_student(payload: StudentSignupRequest):
    student = await db.students.find_one({"email": payload.email})
    if student:
        raise HTTPException(status_code=400, detail="Student already registered")

    hashed_pw = hash_password(payload.password)

    # ✅ Extract grade from "4 D" → 4
    try:
        grade = int(payload.class_level.strip().split()[0])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid class format. Use format like '4 D'.")

    fee = 10000 if 1 <= grade <= 3 else \
          12000 if 4 <= grade <= 6 else \
          15000 if 7 <= grade <= 10 else 0

    new_student = {
        "name": payload.name,
        "email": payload.email,
        "class_level": payload.class_level,  # ✅ store full "4 D"
        "birthYear": payload.birthYear,
        "address": payload.address,
        "password": hashed_pw,
        "role": "student",
        "fee": fee,
        "paid": 0,
        "remaining": fee
    }
    result = await db.students.insert_one(new_student)

    # ✅ Excel update
    try:
        if FILE_PATH.exists():
            df = pd.read_excel(FILE_PATH, sheet_name=STUDENT_SHEET)
            df = pd.read_excel(FILE_PATH, sheet_name=STAFF_SHEET)

        else:
            df = pd.DataFrame(columns=[
                "Name", "Email", "ClassLevel", "BirthYear", "Address",
                "Role", "Fee", "Paid", "Remaining"
            ])

        new_row = pd.DataFrame([{
            "Name": payload.name,
            "Email": payload.email,
            "ClassLevel": payload.class_level,
            "BirthYear": payload.birthYear,
            "Address": payload.address,
            "Role": "student",
            "Fee": fee,
            "Paid": 0,
            "Remaining": fee
        }])

        df = pd.concat([df, new_row], ignore_index=True)

        with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
            df.to_excel(writer, sheet_name=STUDENT_SHEET, index=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB insert ok, but Excel update failed: {e}")

    return {
        "status": "success",
        "id": str(result.inserted_id),
        "name": payload.name,
        "role": "student"
    }

# -----------------------------
# Teacher Signup Route
# -----------------------------
@router.post("/signup-teacher")
async def signup_teacher(payload: TeacherSignupRequest):
    teacher = await db.teachers.find_one({"email": payload.email})
    if teacher:
        raise HTTPException(status_code=400, detail="Teacher already registered")

    hashed_pw = hash_password(payload.password)

    new_teacher = {
        "name": payload.name,
        "email": payload.email,
        "subject": payload.subject,
        "department": payload.department,
        "address": payload.address,
        "password": hashed_pw,
        "role": "teacher"
    }
    result = await db.teachers.insert_one(new_teacher)

    # Excel update
    try:
        if FILE_PATH.exists():
            df = pd.read_excel(FILE_PATH, sheet_name=STAFF_SHEET)
        else:
            df = pd.DataFrame(columns=[
                "Name", "Email", "Subject", "Department", "Address", "Role"
            ])

        new_row = pd.DataFrame([{
            "Name": payload.name,
            "Email": payload.email,
            "Subject": payload.subject,
            "Department": payload.department,
            "Address": payload.address,
            "Role": "teacher"
        }])

        df = pd.concat([df, new_row], ignore_index=True)

        with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
            df.to_excel(writer, sheet_name=STAFF_SHEET, index=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB insert ok, but Excel update failed: {e}")

    return {
        "status": "success",
        "id": str(result.inserted_id),
        "name": payload.name,
        "role": "teacher"
    }

# -----------------------------
# Login Route
# -----------------------------
# Login Route
# -----------------------------
@router.post("/login")
async def login(payload: LoginRequest):
    # Try to find user in students
    student = await db.students.find_one({"name": payload.name})
    # If not found, try teachers
    teacher = await db.teachers.find_one({"name": payload.name})

    # Pick whichever exists
    user = student or teacher

    if not user or "password" not in user:
        raise HTTPException(status_code=404, detail="User not found or not signed up")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Ensure role is set correctly
    role = user.get("role")
    if not role:
        role = "student" if student else "teacher"

    token = create_access_token({
        "id": str(user["_id"]),
        "name": user["name"],
        "role": user.get("role","unknown")
    })

    return {"access_token": token, "token_type": "bearer"}


# -----------------------------
# Profile Route
# -----------------------------
# Profile Route
# -----------------------------
@router.get("/profile")
async def get_profile(token: str):
    payload = decode_token(token)

    # Decide which collection to query based on role
    if payload["role"] == "student":
        user = await db.students.find_one({"_id": ObjectId(payload["id"])})
    elif payload["role"] == "teacher":
        user = await db.teachers.find_one({"_id": ObjectId(payload["id"])})
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Clean up sensitive fields
    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return {"profile": user}

# -----------------------------
# -----------------------------
# Change Password Route
# -----------------------------
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(token: str, payload: ChangePasswordRequest):
    decoded = decode_token(token)

    # Decide which collection to query based on role
    if decoded["role"] == "student":
        user = await db.students.find_one({"_id": ObjectId(decoded["id"])})
        collection = db.students
    elif decoded["role"] == "teacher":
        user = await db.teachers.find_one({"_id": ObjectId(decoded["id"])})
        collection = db.teachers
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.current_password, user["password"]):
        raise HTTPException(status_code=401, detail="Current password incorrect")

    new_hashed = hash_password(payload.new_password)
    await collection.update_one(
        {"_id": ObjectId(decoded["id"])},
        {"$set": {"password": new_hashed}}
    )

    return {"status": "success", "message": "Password changed successfully"}
# -----------------------------
# -----------------------------
# Update Profile Route
# -----------------------------
class UpdateProfileRequest(BaseModel):
    name: str
    email: str

@router.put("/update-profile")
async def update_profile(token: str, payload: UpdateProfileRequest):
    decoded = decode_token(token)

    # Decide which collection to query based on role
    if decoded["role"] == "student":
        user = await db.students.find_one({"_id": ObjectId(decoded["id"])})
        collection = db.students
        sheet_name = STUDENT_SHEET
    elif decoded["role"] == "teacher":
        user = await db.teachers.find_one({"_id": ObjectId(decoded["id"])})
        collection = db.teachers
        sheet_name = STAFF_SHEET   # define this separately for teachers
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update MongoDB
    await collection.update_one(
        {"_id": ObjectId(decoded["id"])},
        {"$set": {"name": payload.name, "email": payload.email}}
    )

    # Update Excel too
    try:
        if FILE_PATH.exists():
            df = pd.read_excel(FILE_PATH, sheet_name=sheet_name)
            # Update row where Email matches old email
            df.loc[df["Email"] == user["email"], ["Name", "Email"]] = [payload.name, payload.email]
            with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB update ok, but Excel update failed: {e}")

    # Fetch updated user
    updated_user = await collection.find_one({"_id": ObjectId(decoded["id"])})
    updated_user["_id"] = str(updated_user["_id"])
    updated_user.pop("password", None)

    return {"status": "success", "message": "Profile updated successfully", "profile": updated_user}

# email updates



# -----------------------------
# -----------------------------
# Email Principal Route
# -----------------------------
class EmailPrincipalRequest(BaseModel):
    subject: str
    message: str

@router.post("/email-principal")
async def email_principal(token: str, payload: EmailPrincipalRequest):
    # Decode token to get user ID and role
    decoded = decode_token(token)
    user_id = decoded["id"]
    role = decoded.get("role")

    # Find user based on role
    if role == "student":
        user = await db.students.find_one({"_id": ObjectId(user_id)})
    elif role == "teacher":
        user = await db.teachers.find_one({"_id": ObjectId(user_id)})
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Insert into MongoDB
    await db.emails.insert_one({
        "user_id": user_id,
        "role": role,
        "name": user.get("name"),
        "email": user.get("email"),
        "subject": payload.subject,
        "message": payload.message
    })

    # Append to Excel
    try:
        if FILE_PATH.exists():
            try:
                df = pd.read_excel(FILE_PATH, sheet_name="emails")
            except ValueError:
                df = pd.DataFrame(columns=["Role", "Name", "Email", "Subject", "Message"])
        else:
            df = pd.DataFrame(columns=["Role", "Name", "Email", "Subject", "Message"])

        new_row = pd.DataFrame([{
            "Role": role,
            "Name": user.get("name"),
            "Email": user.get("email"),
            "Subject": payload.subject,
            "Message": payload.message
        }])

        df = pd.concat([df, new_row], ignore_index=True)

        with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="w") as writer:
            df.to_excel(writer, sheet_name="emails", index=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB insert ok, but Excel update failed: {str(e)}")

    return {"status": "success", "message": "Email sent to principal"}
# -----------------------------
# -----------------------------
# Submit Complaint Route
# -----------------------------
class ComplaintRequest(BaseModel):
    complaint: str

@router.post("/submit-complaint")
async def submit_complaint(token: str, payload: ComplaintRequest):
    # Decode token to get user ID and role
    decoded = decode_token(token)
    user_id = decoded["id"]
    role = decoded.get("role")

    # Find user based on role
    if role == "student":
        user = await db.students.find_one({"_id": ObjectId(user_id)})
    elif role == "teacher":
        user = await db.teachers.find_one({"_id": ObjectId(user_id)})
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Insert into MongoDB
    await db.complaints.insert_one({
        "user_id": user_id,
        "role": role,
        "name": user.get("name"),
        "email": user.get("email"),
        "complaint": payload.complaint
    })

    # Append to Excel
    try:
        if FILE_PATH.exists():
            try:
                df = pd.read_excel(FILE_PATH, sheet_name="complaints")
            except ValueError:
                df = pd.DataFrame(columns=["Role", "Name", "Email", "Complaint"])
        else:
            df = pd.DataFrame(columns=["Role", "Name", "Email", "Complaint"])

        new_row = pd.DataFrame([{
            "Role": role,
            "Name": user.get("name"),
            "Email": user.get("email"),
            "Complaint": payload.complaint
        }])

        df = pd.concat([df, new_row], ignore_index=True)

        with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="w") as writer:
            df.to_excel(writer, sheet_name="complaints", index=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB insert ok, but Excel update failed: {str(e)}")

    return {"status": "success", "message": "Complaint submitted successfully"}

# Delete account 

# -----------------------------
# Delete Account Route
# -----------------------------
@router.delete("/delete-account")
async def delete_account(token: str):
    # Decode token
    payload = decode_token(token)
    user_id = payload["id"]
    role = payload.get("role")

    # Convert ID safely
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Role-based lookup
    if role == "student":
        collection = db.students
        sheet_name = STUDENT_SHEET
    elif role == "teacher":
        collection = db.teachers
        sheet_name = STAFF_SHEET
    else:
        raise HTTPException(status_code=400, detail="Invalid role in token")

    # Find user
    user = await collection.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete from MongoDB
    await collection.delete_one({"_id": obj_id})

    # Remove from Excel
    try:
        if FILE_PATH.exists():
            try:
                df = pd.read_excel(FILE_PATH, sheet_name=sheet_name)
            except ValueError:
                # Sheet not found → create empty DataFrame
                df = pd.DataFrame(columns=["Name", "Email"])

            # Drop rows matching the user's name/email
            if "Name" in df.columns and "Email" in df.columns:
                df = df[~(
                    (df["Name"] == user.get("name")) &
                    (df["Email"] == user.get("email"))
                )]

            # Safely overwrite just this sheet
            with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB delete ok, but Excel update failed: {str(e)}")

    return {"status": "success", "message": "Account deleted successfully"}
# -----------------------------
# Payment endpoints inside auth
# -----------------------------

@router.post("/create-order")
async def create_order(amount: int, student_id: str, purpose: str = "fees", method: str = "razorpay"):
    try:
        order = client.order.create({
            "amount": amount * 100,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "student_id": student_id,
                "purpose": purpose,
                "method": method
            }
        })
        return {"order_id": order["id"], "method": method}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Google Pay / UPI
@router.post("/create-order/upi")
async def create_order_upi(amount: int, student_id: str, purpose: str = "fees"):
    return await create_order(amount, student_id, purpose, method="upi")

# Visa
@router.post("/create-order/visa")
async def create_order_visa(amount: int, student_id: str, purpose: str = "fees"):
    return await create_order(amount, student_id, purpose, method="visa")

# Mastercard
@router.post("/create-order/mastercard")
async def create_order_mastercard(amount: int, student_id: str, purpose: str = "fees"):
    return await create_order(amount, student_id, purpose, method="mastercard")

# Manual Bank Transfer
@router.post("/manual-bank-payment")
async def manual_bank_payment(student_id: str, amount: int, utr: str):
    timestamp = datetime.utcnow().isoformat()
    await db.payments.insert_one({
        "timestamp": timestamp,
        "student_id": student_id,
        "amount": amount,
        "method": "Bank Transfer",
        "status": "Pending Verification",
        "utr": utr
    })
    return {"status": "recorded", "utr": utr}
