from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class BrandPersona(str, Enum):
    PROFESSIONAL = "Professional"
    WITTY = "Witty"
    URGENT = "Urgent"
    INSPIRATIONAL = "Inspirational"
    CASUAL = "Casual"


class Platform(str, Enum):
    LINKEDIN = "LinkedIn"
    INSTAGRAM = "Instagram"
    TWITTER = "Twitter"
    FACEBOOK = "Facebook"


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Request / Response ──────────────────────────────────────

class GenerateRequest(BaseModel):
    brief: str = Field(..., min_length=3, max_length=500,
                       description="Short marketing brief, e.g. 'red running shoes'")
    persona: BrandPersona = BrandPersona.PROFESSIONAL
    platform: Platform = Platform.INSTAGRAM
    include_image: bool = True


class GenerateResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str = "Job queued successfully"


class JobResult(BaseModel):
    job_id: str
    status: JobStatus
    brief: str = ""
    persona: str = ""
    platform: str = ""
    refined_prompt: Optional[str] = None
    marketing_copy: Optional[str] = None
    image_url: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class HistoryItem(BaseModel):
    job_id: str
    brief: str
    persona: str
    platform: str
    status: str
    marketing_copy: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None


class HistoryResponse(BaseModel):
    items: List[HistoryItem]
    total: int
