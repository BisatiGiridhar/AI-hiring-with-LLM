"""
SQLAlchemy ORM models for the X-MMHF hiring intelligence database.
All tables follow normalized relational design with proper indexes and constraints.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean,
    DateTime, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    """Registered users: recruiters, candidates, and admins."""
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name    = Column(String(255), nullable=False)
    role         = Column(String(50), default="recruiter", nullable=False)
    is_active    = Column(Boolean, default=True, nullable=False)
    created_at   = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at   = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    evaluations  = relationship("CandidateEvaluation", back_populates="created_by_user", lazy="dynamic")
    job_postings = relationship("JobPosting", back_populates="created_by_user", lazy="dynamic")
    audit_logs   = relationship("AuditLog", back_populates="user", lazy="dynamic")

    __table_args__ = (
        Index("ix_users_email_role", "email", "role"),
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"


class JobPosting(Base):
    """Job descriptions created by recruiters for evaluation runs."""
    __tablename__ = "job_postings"

    id                 = Column(Integer, primary_key=True, index=True)
    title              = Column(String(255), nullable=False, index=True)
    description        = Column(Text, nullable=False)
    required_keywords  = Column(JSON, nullable=False)     # list of keyword strings
    required_skills    = Column(JSON, nullable=True)      # dict: {skill: {weight, difficulty}}
    department         = Column(String(100), nullable=True)
    experience_level   = Column(String(50), nullable=True)  # junior/mid/senior
    is_active          = Column(Boolean, default=True)
    created_by         = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at         = Column(DateTime(timezone=True), default=utcnow)
    updated_at         = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    created_by_user = relationship("User", back_populates="job_postings")
    evaluations     = relationship("CandidateEvaluation", back_populates="job_posting", lazy="dynamic")

    def __repr__(self):
        return f"<JobPosting id={self.id} title={self.title}>"


class CandidateEvaluation(Base):
    """Complete evaluation record per candidate submission."""
    __tablename__ = "candidate_evaluations"

    id               = Column(Integer, primary_key=True, index=True)
    candidate_name   = Column(String(255), index=True, nullable=False)
    job_title        = Column(String(255), nullable=False)
    job_posting_id   = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    created_by       = Column(Integer, ForeignKey("users.id"), nullable=True)
    resume_file_name = Column(String(255), nullable=True)
    github_url       = Column(String(500), nullable=True)
    portfolio_url    = Column(String(500), nullable=True)

    # Scores
    final_score       = Column(Float, nullable=False)
    ats_score         = Column(Float, nullable=False)
    skill_gap_score   = Column(Float, nullable=False)
    multimodal_score  = Column(Float, nullable=False)
    confidence_score  = Column(Float, nullable=False)
    github_score      = Column(Float, nullable=True)
    portfolio_score   = Column(Float, nullable=True)

    # Verdict & Full JSON Result
    verdict       = Column(String(100), nullable=False)
    full_result   = Column(JSON, nullable=True)  # complete multi-agent output

    created_at    = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at    = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    created_by_user = relationship("User", back_populates="evaluations")
    job_posting     = relationship("JobPosting", back_populates="evaluations")

    __table_args__ = (
        Index("ix_evaluations_score", "final_score"),
        Index("ix_evaluations_created", "created_at"),
    )

    def __repr__(self):
        return f"<CandidateEvaluation id={self.id} name={self.candidate_name} score={self.final_score}>"


class RecruiterDocumentIndex(Base):
    """RAG knowledge base: recruiter-uploaded documents for semantic search."""
    __tablename__ = "recruiter_documents"

    id           = Column(Integer, primary_key=True, index=True)
    doc_id       = Column(String(255), unique=True, index=True, nullable=False)
    title        = Column(String(255), nullable=False)
    doc_type     = Column(String(100), nullable=False)  # Job Description, Company Policy, etc.
    content_text = Column(Text, nullable=False)
    uploaded_by  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=utcnow)

    def __repr__(self):
        return f"<RecruiterDocumentIndex id={self.id} title={self.title}>"


class AuditLog(Base):
    """Security and operational audit log for admin monitoring."""
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    action      = Column(String(255), nullable=False, index=True)
    resource    = Column(String(255), nullable=True)
    ip_address  = Column(String(50), nullable=True)
    user_agent  = Column(String(500), nullable=True)
    status_code = Column(Integer, nullable=True)
    details     = Column(JSON, nullable=True)
    created_at  = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

    # Relationship
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog id={self.id} action={self.action} user_id={self.user_id}>"
