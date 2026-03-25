import hmac, hashlib, requests

# Your webhook secret
secret = "myschoolwebhooksecret12345"

# Load JSON payload
with open("C:\\Users\\astha\\OneDrive\\Desktop\\final_erp\\backend\\app\\api\\webhook_test.json", "rb") as f:
    body = f.read()

# Generate signature
signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
print("Generated signature:", signature)

# Send request with signature header
resp = requests.post(
    "http://127.0.0.1:8000/payments/webhook",
    headers={
        "Content-Type": "application/json",
        "X-Razorpay-Signature": signature
    },
    data=body
)

print("Response:", resp.status_code, resp.text)