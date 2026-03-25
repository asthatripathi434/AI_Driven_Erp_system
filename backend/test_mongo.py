import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()  # loads your .env file

DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = os.getenv("DB_NAME")

async def test_connection():
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL)
        db = client[DB_NAME]
        # Run a simple command
        await db.command("ping")
        print({"status": "ok"})
    except Exception as e:
        print({"status": "error", "details": str(e)})

asyncio.run(test_connection())