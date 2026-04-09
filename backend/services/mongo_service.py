"""
MongoDB Service
───────────────
Handles async reads/writes for job results and history logging.
Uses motor (async MongoDB driver).
"""

import motor.motor_asyncio
from datetime import datetime
from typing import Optional, List
from config import settings

_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None


def get_db():
    global _client
    if _client is None:
        _client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
    return _client[settings.mongodb_db]


async def save_job(job_id: str, data: dict):
    db = get_db()
    data["job_id"] = job_id
    data["created_at"] = data.get("created_at", datetime.utcnow())
    await db.jobs.update_one({"job_id": job_id}, {"$set": data}, upsert=True)


async def get_job(job_id: str) -> Optional[dict]:
    db = get_db()
    doc = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    return doc


async def list_jobs(limit: int = 20, skip: int = 0) -> List[dict]:
    db = get_db()
    cursor = db.jobs.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)


async def count_jobs() -> int:
    db = get_db()
    return await db.jobs.count_documents({})
