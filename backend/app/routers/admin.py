"""
Admin panel router: User management, system stats, audit logs.
All endpoints are restricted to admin role only.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models import User, CandidateEvaluation, JobPosting, AuditLog
from app.schemas import UserPublic, AdminUserUpdate, SystemStatsResponse, AuditLogResponse
from app.core.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return high-level system metrics for the admin dashboard."""
    total_users       = db.query(func.count(User.id)).scalar()
    total_evals       = db.query(func.count(CandidateEvaluation.id)).scalar()
    total_jobs        = db.query(func.count(JobPosting.id)).scalar()
    active_users      = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    avg_score_raw     = db.query(func.avg(CandidateEvaluation.final_score)).scalar()
    avg_score         = round(float(avg_score_raw), 4) if avg_score_raw else None

    # Count verdicts
    verdict_rows = (
        db.query(CandidateEvaluation.verdict, func.count(CandidateEvaluation.id))
        .group_by(CandidateEvaluation.verdict)
        .all()
    )
    verdict_counts = {row[0]: row[1] for row in verdict_rows}

    # Recent activity: logs in last 24 hours
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_count = db.query(func.count(AuditLog.id)).filter(AuditLog.created_at >= since).scalar()

    return SystemStatsResponse(
        total_users=total_users,
        total_evaluations=total_evals,
        total_job_postings=total_jobs,
        active_users=active_users,
        average_final_score=avg_score,
        top_verdict_counts=verdict_counts,
        recent_activity_count=recent_count,
    )


@router.get("/users", response_model=List[UserPublic])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all registered users with optional role filter."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserPublic)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.patch("/users/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    req: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a user's role or active status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot modify their own account here.")

    if req.is_active is not None:
        user.is_active = req.is_active
    if req.role is not None:
        user.role = req.role
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=200)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft-delete (deactivate) a user account. Does not permanently delete data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account.")
    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": f"User {user.email} has been deactivated."}


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve audit logs for security monitoring (admin only)."""
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    return query.offset(skip).limit(limit).all()


@router.get("/evaluations", response_model=List[dict])
def get_all_evaluations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get all candidate evaluations across all users (admin view)."""
    evals = (
        db.query(CandidateEvaluation)
        .order_by(CandidateEvaluation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": e.id,
            "candidate_name": e.candidate_name,
            "job_title": e.job_title,
            "final_score": e.final_score,
            "verdict": e.verdict,
            "created_by": e.created_by,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in evals
    ]
