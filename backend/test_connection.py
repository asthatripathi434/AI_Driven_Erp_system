import asyncio
from app.db.connection import db

async def test_connection():
    try:
        # Try listing collections
        collections = await db.list_collection_names()
        print("✅ Connected to MongoDB. Collections:", collections)
    except Exception as e:
        print("❌ Connection failed:", e)

if __name__ == "__main__":
    asyncio.run(test_connection())