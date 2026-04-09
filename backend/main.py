"""
ViralGen AI — FastAPI Backend
"""

import uuid
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config import settings
from models.schemas import (
    GenerateRequest, GenerateResponse, JobResult,
    HistoryResponse, HistoryItem, JobStatus
)
from workers.celery_worker import generate_content_task, get_job_state
from services.mongo_service import list_jobs, count_jobs

# ── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ViralGen AI",
    description="Multi-Modal Social Media Ad Content Generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images
static_path = Path(settings.static_dir)
static_path.mkdir(parents=True, exist_ok=True)
app.mount("/static/generated", StaticFiles(directory=str(static_path)), name="static")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "ViralGen AI"}


@app.post("/api/generate", response_model=GenerateResponse, status_code=202)
def generate(req: GenerateRequest):
    """
    Submit a content generation job.
    Returns a Job ID immediately — generation happens asynchronously.
    """
    job_id = str(uuid.uuid4())

    # Dispatch to Celery
    generate_content_task.apply_async(
        args=[job_id, req.brief, req.persona.value,
              req.platform.value, req.include_image],
        task_id=job_id,
    )

    return GenerateResponse(
        job_id=job_id,
        status=JobStatus.PENDING,
        message="Job queued — poll /api/jobs/{job_id} for status",
    )


@app.get("/api/jobs/{job_id}", response_model=JobResult)
def poll_job(job_id: str):
    """
    Polling endpoint: returns current job status + results when ready.
    """
    state = get_job_state(job_id)
    if not state:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobResult(
        job_id=state["job_id"],
        status=JobStatus(state["status"]),
        brief=state.get("brief", ""),
        persona=state.get("persona", ""),
        platform=state.get("platform", ""),
        refined_prompt=state.get("refined_prompt"),
        marketing_copy=state.get("marketing_copy"),
        image_url=state.get("image_url"),
        error=state.get("error"),
        created_at=_parse_dt(state.get("created_at")),
        completed_at=_parse_dt(state.get("completed_at")),
    )


@app.get("/api/history", response_model=HistoryResponse)
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    """
    Return paginated generation history from MongoDB.
    """
    try:
        items_raw = await list_jobs(limit=limit, skip=skip)
        total = await count_jobs()
        items = [
            HistoryItem(
                job_id=r["job_id"],
                brief=r.get("brief", ""),
                persona=r.get("persona", ""),
                platform=r.get("platform", ""),
                status=r.get("status", "unknown"),
                marketing_copy=r.get("marketing_copy"),
                image_url=r.get("image_url"),
                created_at=_parse_dt(r.get("created_at")),
            )
            for r in items_raw
        ]
        return HistoryResponse(items=items, total=total)
    except Exception as e:
        # MongoDB unavailable — return empty gracefully
        return HistoryResponse(items=[], total=0)


@app.get("/api/personas")
def get_personas():
    from templates.brand_personas import PERSONA_TEMPLATES, PLATFORM_GUIDELINES
    return {
        "personas": list(PERSONA_TEMPLATES.keys()),
        "platforms": list(PLATFORM_GUIDELINES.keys()),
    }


def _parse_dt(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val))
    except Exception:
        return None
