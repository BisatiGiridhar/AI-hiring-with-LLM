"""
Pydantic schemas for request/response validation across all API endpoints.
Separates API data shapes from database ORM models.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    role: str = Field(default="recruiter", pattern="^(recruiter|candidate|admin)$")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=8, max_length=128)


# ─────────────────────────────────────────────
# JOB POSTING SCHEMAS
# ─────────────────────────────────────────────

class JobPostingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=20)
    required_keywords: List[str] = Field(min_length=1)
    required_skills: Optional[Dict[str, Dict[str, Any]]] = None
    department: Optional[str] = Field(None, max_length=100)
    experience_level: Optional[str] = Field(None, pattern="^(junior|mid|senior|lead|any)$")


class JobPostingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    required_keywords: Optional[List[str]] = None
    required_skills: Optional[Dict[str, Dict[str, Any]]] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    is_active: Optional[bool] = None


class JobPostingResponse(BaseModel):
    id: int
    title: str
    description: str
    required_keywords: List[str]
    required_skills: Optional[Dict[str, Any]]
    department: Optional[str]
    experience_level: Optional[str]
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# EVALUATION SCHEMAS
# ─────────────────────────────────────────────

class EvaluationSummary(BaseModel):
    id: int
    candidate_name: str
    job_title: str
    final_score: float
    ats_score: float
    skill_gap_score: float
    multimodal_score: float
    confidence_score: float
    verdict: str
    github_url: Optional[str]
    portfolio_url: Optional[str]
    resume_file_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedEvaluations(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[EvaluationSummary]


# ─────────────────────────────────────────────
# ADMIN SCHEMAS
# ─────────────────────────────────────────────

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = Field(None, pattern="^(recruiter|candidate|admin)$")


class SystemStatsResponse(BaseModel):
    total_users: int
    total_evaluations: int
    total_job_postings: int
    active_users: int
    average_final_score: Optional[float]
    top_verdict_counts: Dict[str, int]
    recent_activity_count: int


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource: Optional[str]
    ip_address: Optional[str]
    status_code: Optional[int]
    details: Optional[Dict[str, Any]]
    created_at: datetime

    model_config = {"from_attributes": True}
