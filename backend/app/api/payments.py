import os, hmac, hashlib, requests
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
from typing import Dict, Any, Optional

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
    contact: Optional[str] = None   # ✅ optional now
    purpose: str = "fees"

class WebhookPayload(BaseModel):
    event: str
    payload: Dict[str, Any]

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
        print(f"❌ Email send failed: {e}")

def send_payment_sms(phone: str, student_name: str, amount: int, status: str, ref_id: str):
    """Send SMS instantly via MSG91 (replace with Twilio/TextLocal if needed)."""
    if not phone:
        print("⚠️ No phone number provided, skipping SMS")
        return

    message = f"Dear {student_name}, your payment of ₹{amount} was {status}. Ref: {ref_id}"
    url = "https://api.msg91.com/api/v5/sms"
    payload = {
        "sender": "SCHOOL",
        "route": "4",
        "country": "91",
        "sms": [
            {
                "message": message,
                "to": [phone if phone.startswith("91") else f"91{phone}"]
            }
        ]
    }
    headers = {
        "authkey": settings.MSG91_AUTH_KEY,
        "content-type": "application/json"
    }
    try:
        r = requests.post(url, json=payload, headers=headers)
        print("✅ SMS sent:", r.status_code, r.json())
    except Exception as e:
        print("❌ SMS failed:", e)

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
        print(f"❌ Excel append failed: {e}")

# -----------------------------
# Create Razorpay Payment Link
# -----------------------------
@router.post("/create-payment-link")
async def create_payment_link(order: OrderRequest):
    try:
        payment_link = client.payment_link.create({
            "amount": order.amount * 100,
            "currency": "INR",
            "description": f"Fees payment for {order.student_name}",
            "customer": {
                "name": order.student_name,
                "email": f"{order.student_id}@school.com",
                "contact": order.contact or ""   # ✅ blank if not provided
            },
            "notes": {
                "student_id": order.student_id,
                "student_name": order.student_name
            },
            "notify": {"sms": True, "email": True},
            "callback_url": "http://localhost:5173/fee",
            "callback_method": "get"
        })
        return {"link": payment_link["short_url"]}
    except Exception as e:
        print("❌ Razorpay error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create payment link: {str(e)}")

# -----------------------------
# Webhook handler
# -----------------------------
@router.post("/webhook")
async def webhook(payload: WebhookPayload, request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    generated_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if signature != generated_signature:
        raise HTTPException(status_code=400, detail="Invalid signature")

    payment = payload.payload.get("payment", {}).get("entity", {})
    if not payment:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    student_id = payment.get("notes", {}).get("student_id")
    student_name = payment.get("notes", {}).get("student_name", "")
    amount = int(payment.get("amount", 0)) // 100
    method = payment.get("method", "")
    status = payment.get("status", "")
    order_id = payment.get("order_id", "")
    payment_id = payment.get("id", "")
    phone = payment.get("contact", "")

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

    # ✅ Send email
    send_payment_email(
        to_email=payment.get("email", settings.SMTP_FROM),
        student_name=student_name,
        amount=amount,
        status=status,
        method=method,
        ref_id=payment_id
    )

    # ✅ Send SMS instantly
    send_payment_sms(phone, student_name, amount, status, payment_id)

    return {"status": "ok"}