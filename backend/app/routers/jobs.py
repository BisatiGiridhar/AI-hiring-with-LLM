"""
Job Postings router: CRUD operations for recruiters to manage real job descriptions.
These job postings feed directly into candidate evaluation runs.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import User, JobPosting
from app.schemas import JobPostingCreate, JobPostingUpdate, JobPostingResponse
from app.core.security import get_current_user, require_recruiter_or_admin

router = APIRouter(prefix="/api/jobs", tags=["Job Postings"])


@router.post("/", response_model=JobPostingResponse, status_code=201)
def create_job_posting(
    req: JobPostingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter_or_admin),
):
    """Create a new job posting (recruiters and admins only)."""
    # Auto-build required_skills dict if not provided
    skills = req.required_skills or {
        kw: {"weight": 1.0, "difficulty": 3} for kw in req.required_keywords
    }
    job = JobPosting(
        title=req.title,
        description=req.description,
        required_keywords=req.required_keywords,
        required_skills=skills,
        department=req.department,
        experience_level=req.experience_level,
        created_by=current_user.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[JobPostingResponse])
def list_job_postings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List job postings. Active-only filter by default."""
    query = db.query(JobPosting)
    if active_only:
        query = query.filter(JobPosting.is_active == True)
    return query.order_by(JobPosting.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=JobPostingResponse)
def get_job_posting(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single job posting by ID."""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    return job


@router.put("/{job_id}", response_model=JobPostingResponse)
def update_job_posting(
    job_id: int,
    req: JobPostingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter_or_admin),
):
    """Update a job posting. Only the creator or admin can update."""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    if job.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only modify your own job postings.")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    job.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=200)
def delete_job_posting(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter_or_admin),
):
    """Soft-delete a job posting by setting is_active=False."""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    if job.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own job postings.")
    job.is_active = False
    job.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": f"Job posting '{job.title}' has been deactivated."}


@router.get("/my/postings", response_model=List[JobPostingResponse])
def get_my_job_postings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all job postings created by the current user."""
    return (
        db.query(JobPosting)
        .filter(JobPosting.created_by == current_user.id)
        .order_by(JobPosting.created_at.desc())
        .all()
    )
