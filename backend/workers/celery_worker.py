"""
Celery Worker
─────────────
Handles async image generation tasks.
Broker: Redis
Backend: Redis (for result storage + polling)

Run with:
    celery -A workers.celery_worker worker --loglevel=info
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from celery import Celery
from datetime import datetime
import redis
import json

from config import settings
from services.gpt_service import refine_prompt, generate_marketing_copy
from services.stability_service import generate_image

# ── Celery App ────────────────────────────────────────────────────────────────
celery_app = Celery(
    "viralgen",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# ── Redis client for job-state storage ───────────────────────────────────────
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

JOB_TTL = 60 * 60 * 24  # 24 hours


def _set_job_state(job_id: str, state: dict):
    redis_client.setex(f"job:{job_id}", JOB_TTL, json.dumps(state))


def get_job_state(job_id: str) -> dict | None:
    raw = redis_client.get(f"job:{job_id}")
    return json.loads(raw) if raw else None


# ── Task ──────────────────────────────────────────────────────────────────────
@celery_app.task(bind=True, name="generate_content", max_retries=2)
def generate_content_task(self, job_id: str, brief: str, persona: str,
                          platform: str, include_image: bool):
    """
    Full pipeline:
      1. Refine the user brief into a detailed image prompt (GPT-4)
      2. Generate marketing copy (GPT-4 + Brand Persona)
      3. Generate image (Stability AI)
      4. Composite result and save state to Redis (+ MongoDB async)
    """
    try:
        # Mark as processing
        _set_job_state(job_id, {
            "job_id": job_id,
            "status": "processing",
            "brief": brief,
            "persona": persona,
            "platform": platform,
            "created_at": datetime.utcnow().isoformat(),
        })

        # Step 1 — Prompt Refinement Agent
        refined_prompt = refine_prompt(brief, persona, platform)

        # Step 2 — Marketing Copy
        marketing_copy = generate_marketing_copy(brief, persona, platform)

        # Step 3 — Image Generation
        image_url = None
        if include_image:
            image_url = generate_image(refined_prompt, job_id)

        # Step 4 — Save completed state
        completed_state = {
            "job_id": job_id,
            "status": "completed",
            "brief": brief,
            "persona": persona,
            "platform": platform,
            "refined_prompt": refined_prompt,
            "marketing_copy": marketing_copy,
            "image_url": image_url,
            "error": None,
            "created_at": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
        }
        _set_job_state(job_id, completed_state)

        # Async MongoDB persistence (fire-and-forget via subprocess-safe pattern)
        _persist_to_mongo(completed_state)

        return completed_state

    except Exception as exc:
        error_state = {
            "job_id": job_id,
            "status": "failed",
            "brief": brief,
            "persona": persona,
            "platform": platform,
            "error": str(exc),
            "created_at": datetime.utcnow().isoformat(),
        }
        _set_job_state(job_id, error_state)
        raise self.retry(exc=exc, countdown=5)


def _persist_to_mongo(state: dict):
    """Best-effort MongoDB persistence from within the worker process."""
    try:
        import pymongo
        client = pymongo.MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=3000)
        db = client[settings.mongodb_db]
        db.jobs.update_one({"job_id": state["job_id"]}, {"$set": state}, upsert=True)
        client.close()
    except Exception:
        pass  # MongoDB is optional; Redis is the source of truth for polling
