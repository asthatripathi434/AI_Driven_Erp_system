import os, hmac, hashlib
from fastapi import APIRouter, HTTPException, Request
from app.core.config import settings
from app.db.connection import db
import razorpay
import pandas as pd
from pathlib import Path
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/payments", tags=["payments"])
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET))
FILE_PATH = Path(settings.EXCEL_PATH)

# -----------------------------
# Request models
# -----------------------------
class OrderRequest(BaseModel):
    amount: int
    student_id: str
    student_name: str
    purpose: str = "fees"

# ✅ Flexible webhook payload model
class WebhookPayload(BaseModel):
    event: str
    payload: Dict[str, Any]   # allow any nested structure

    class Config:
        schema_extra = {
            "example": {
                "event": "payment.captured",
                "payload": {
                    "payment": {
                        "entity": {
                            "id": "pay_123",
                            "amount": 5000,
                            "currency": "INR",
                            "status": "captured",
                            "order_id": "order_123",
                            "method": "card",
                            "email": "test@example.com",
                            "contact": "+919876543210",
                            "notes": {
                                "student_id": "697860242c65b328dfdb6364",
                                "student_name": "Priya"
                            }
                        }
                    }
                }
            }
        }

# -----------------------------
# Helpers
# -----------------------------
def send_payment_email(to_email: str, student_name: str, amount: int, status: str, method: str, ref_id: str):
    subject = f"Payment {status}: ₹{amount}"
    body = (
        f"Dear {student_name},\n\n"
        f"Your payment of ₹{amount} via {method} was {status}.\n"
        f"Reference: {ref_id}\n\n"
        f"Thank you,\n{settings.SCHOOL_NAME}"
    )
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.send_message(msg)
    except Exception as e:
        print(f"Email send failed: {e}")

def append_payment_to_excel(row: dict):
    sheet = "payments"
    try:
        if FILE_PATH.exists():
            try:
                df = pd.read_excel(FILE_PATH, sheet_name=sheet)
            except Exception:
                df = pd.DataFrame(columns=["Timestamp","StudentID","Name","Email","Amount","Method","Status","OrderID","PaymentID"])
        else:
            df = pd.DataFrame(columns=["Timestamp","StudentID","Name","Email","Amount","Method","Status","OrderID","PaymentID"])

        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        with pd.ExcelWriter(FILE_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
            df.to_excel(writer, sheet_name=sheet, index=False)
    except Exception as e:
        print(f"Excel append failed: {e}")

# -----------------------------
# Create Razorpay order
# -----------------------------
@router.post("/create-order")
async def create_order(order: OrderRequest):
    try:
        order_data = client.order.create({
            "amount": order.amount * 100,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "student_id": order.student_id,
                "student_name": order.student_name,
                "purpose": order.purpose
            }
        })
        return {"order_id": order_data["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Webhook handler (secure + with signature logging)
# -----------------------------
@router.post("/webhook")
async def webhook(payload: WebhookPayload, request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    print("🔑 Received Razorpay Signature:", signature)

    # Allow manual testing without signature
    if not signature:
        print("⚠️ No signature header found (manual test via Swagger/curl). Skipping verification.")
    else:
        generated_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        print("🧮 Generated Signature:", generated_signature)

        if signature != generated_signature:
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Extract payment entity safely
    payment = payload.payload.get("payment", {}).get("entity", {})

    student_id = payment.get("notes", {}).get("student_id") or payment.get("notes", {}).get("user_id")
    student_name = payment.get("notes", {}).get("student_name", "")
    amount = int(payment.get("amount", 0)) // 100
    method = payment.get("method", "")
    status = payment.get("status", "")
    order_id = payment.get("order_id", "")
    payment_id = payment.get("id", "")

    record = {
        "timestamp": datetime.utcnow(),
        "student_id": student_id,
        "amount": amount,
        "method": method,
        "status": status,
        "order_id": order_id,
        "payment_id": payment_id
    }

    await db["payments"].insert_one(record)

    append_payment_to_excel({
        "Timestamp": datetime.utcnow(),
        "StudentID": student_id,
        "Name": student_name,
        "Email": payment.get("email", ""),
        "Amount": amount,
        "Method": method,
        "Status": status,
        "OrderID": order_id,
        "PaymentID": payment_id
    })

    send_payment_email(
        to_email=payment.get("email", settings.SMTP_FROM),
        student_name=student_name,
        amount=amount,
        status=status,
        method=method,
        ref_id=payment_id
    )

    print(f"✅ Webhook processed successfully for event: {payload.event}")
    return {"status": "ok"}