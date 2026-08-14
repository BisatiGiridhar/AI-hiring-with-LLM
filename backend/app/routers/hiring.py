"""
Hiring evaluation router — secured with JWT authentication.
Processes real candidate data through the 10-agent DAG pipeline.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
import json

import numpy as np
from app.database import get_db
from app.models import CandidateEvaluation, User, AuditLog, JobPosting
from app.schemas import EvaluationSummary, PaginatedEvaluations
from app.agents.orchestrator import MultiAgentOrchestrator
from app.services.document_parser import DocumentParserService
from app.services.github_service import GitHubService
from app.services.portfolio_scraper import PortfolioScraperService
from app.services.learning_trends_service import LearningTrendsService
from app.services.rag_service import rag_service_instance
from app.core.security import get_current_user, require_recruiter_or_admin

router = APIRouter(prefix="/api/hiring", tags=["Real-Time Hiring Intelligence"])
orchestrator = MultiAgentOrchestrator()


def _sanitize(obj):
    """Recursively convert numpy types and raw latent vectors to JSON-safe Python types."""
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items() if k != "latent_vector"}
    if isinstance(obj, list):
        return [_sanitize(i) for i in obj]
    if isinstance(obj, np.ndarray):
        return None  # omit raw vectors from API response
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    return obj


@router.post("/evaluate-upload")
async def evaluate_real_candidate_upload(
    candidate_name: str = Form("Real Candidate"),
    job_title: str = Form("Senior AI Systems Engineer"),
    job_description: str = Form("Required skills: Python, PyTorch, System Design, FastAPI, Docker, AWS."),
    required_keywords_json: str = Form('[\"Python\", \"PyTorch\", \"System Design\", \"FastAPI\", \"Docker\", \"AWS\"]'),
    job_posting_id: Optional[int] = Form(None),
    github_url: Optional[str] = Form(None),
    portfolio_url: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    resume_text_override: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PRIMARY ENDPOINT: Evaluates a real candidate through the 10-agent DAG.

    - Parses actual uploaded PDF/DOCX/TXT resume files
    - Calls GitHub REST API for live repository data
    - Scrapes portfolio URLs in real-time
    - Requires valid JWT authentication
    - Persists complete results to database
    """
    try:
        # ── 1. Real Document Parsing ─────────────────────────────────────────
        if resume_file and resume_file.filename:
            file_bytes = await resume_file.read()
            if len(file_bytes) > 10 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Resume file exceeds 10MB limit.")
            extracted_resume_text = DocumentParserService.extract_text(resume_file.filename, file_bytes)
        elif resume_text_override and resume_text_override.strip():
            extracted_resume_text = resume_text_override.strip()
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a resume file (PDF/DOCX/TXT) or paste resume text."
            )

        if len(extracted_resume_text.strip()) < 50:
            raise HTTPException(status_code=422, detail="Resume content is too short to evaluate. Minimum 50 characters.")

        # ── 2. Parse keywords ────────────────────────────────────────────────
        try:
            keywords_list = json.loads(required_keywords_json)
            if not isinstance(keywords_list, list):
                raise ValueError
        except Exception:
            keywords_list = ["Python", "PyTorch", "FastAPI", "System Design", "Docker", "AWS"]

        # ── 3. Optionally load from a saved job posting ─────────────────────
        job_desc_text = job_description
        if job_posting_id:
            posting = db.query(JobPosting).filter(JobPosting.id == job_posting_id, JobPosting.is_active == True).first()
            if posting:
                job_title = posting.title
                job_desc_text = posting.description
                keywords_list = posting.required_keywords

        required_skills_dict = {kw: {"weight": 1.0, "difficulty": 3} for kw in keywords_list}

        # ── 4. Live GitHub API Data Fetching ─────────────────────────────────
        github_data = (
            await GitHubService.fetch_user_data(github_url)
            if github_url and github_url.strip()
            else {"status": "NOT_PROVIDED", "s_github": 0.50, "latent_vector": [0.50] * 64}
        )

        # ── 5. Live Portfolio Web Scraping ───────────────────────────────────
        portfolio_data = (
            await PortfolioScraperService.scrape_portfolio(portfolio_url)
            if portfolio_url and portfolio_url.strip()
            else {"status": "NOT_PROVIDED", "s_portfolio": 0.50, "latent_vector": [0.50] * 64}
        )

        # ── 6. Multi-Agent DAG Pipeline ──────────────────────────────────────
        result = orchestrator.process_candidate(
            candidate_name=candidate_name,
            resume_text=extracted_resume_text,
            job_description=job_desc_text,
            required_keywords=keywords_list,
            required_skills=required_skills_dict,
            github_url=github_url,
            portfolio_url=portfolio_url,
            has_video=True,
            github_prefetched=github_data,
            portfolio_prefetched=portfolio_data,
        )

        # ── 7. Live Learning Resources for Career Roadmap ───────────────────
        missing_skill_names = [m["skill"] for m in result["skill_gap_analysis"]["missing_skills"]]
        live_courses = LearningTrendsService.get_learning_resources_for_skills(missing_skill_names)
        result["career_roadmap"]["live_recommended_courses"] = live_courses

        # ── 8. Database Persistence ──────────────────────────────────────────
        sanitized_result = _sanitize(result)
        db_eval = CandidateEvaluation(
            candidate_name=candidate_name,
            job_title=job_title,
            job_posting_id=job_posting_id,
            created_by=current_user.id,
            resume_file_name=(resume_file.filename if resume_file and resume_file.filename else "pasted_text"),
            github_url=github_url,
            portfolio_url=portfolio_url,
            final_score=result["summary_scores"]["final_candidate_score"],
            ats_score=result["summary_scores"]["ats_passing_probability"],
            skill_gap_score=result["summary_scores"]["hiring_readiness_index"],
            multimodal_score=result["summary_scores"]["final_percentage"],
            confidence_score=result["summary_scores"]["confidence_score"],
            github_score=float(github_data.get("s_github", 0.5)),
            portfolio_score=float(portfolio_data.get("s_portfolio", 0.5)),
            verdict=result["explainability"]["verdict"],
            full_result=sanitized_result,
        )
        db.add(db_eval)
        db.commit()
        db.refresh(db_eval)

        # ── 9. Audit Log ─────────────────────────────────────────────────────
        log = AuditLog(
            user_id=current_user.id,
            action="CANDIDATE_EVALUATED",
            resource=f"/api/hiring/evaluate-upload",
            details={"candidate": candidate_name, "eval_id": db_eval.id, "score": float(db_eval.final_score)},
        )
        db.add(log)
        db.commit()

        sanitized_result["database_record_id"] = db_eval.id
        return sanitized_result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation pipeline error: {str(e)}")


@router.get("/evaluations", response_model=PaginatedEvaluations)
def get_my_evaluations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Paginated list of evaluations created by the current user."""
    offset = (page - 1) * page_size
    query = db.query(CandidateEvaluation).filter(CandidateEvaluation.created_by == current_user.id)
    total = query.count()
    items = query.order_by(CandidateEvaluation.created_at.desc()).offset(offset).limit(page_size).all()
    return PaginatedEvaluations(total=total, page=page, page_size=page_size, items=items)


@router.get("/evaluations/{eval_id}")
def get_evaluation_detail(
    eval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full evaluation result by ID."""
    eval_record = db.query(CandidateEvaluation).filter(CandidateEvaluation.id == eval_id).first()
    if not eval_record:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    if eval_record.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied.")
    return eval_record.full_result or {"message": "Full result not stored for this record."}


@router.delete("/evaluations/{eval_id}", status_code=200)
def delete_evaluation(
    eval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an evaluation record (owner or admin only)."""
    eval_record = db.query(CandidateEvaluation).filter(CandidateEvaluation.id == eval_id).first()
    if not eval_record:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    if eval_record.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied.")
    db.delete(eval_record)
    db.commit()
    return {"message": "Evaluation deleted successfully."}


@router.post("/rag/upload-document")
async def upload_recruiter_rag_document(
    title: str = Form(...),
    doc_type: str = Form("Job Description"),
    file: UploadFile = File(...),
    current_user: User = Depends(require_recruiter_or_admin),
):
    """RAG Knowledge Base: upload recruiter documents for semantic search indexing."""
    file_bytes = await file.read()
    content = DocumentParserService.extract_text(file.filename, file_bytes)
    doc_record = rag_service_instance.add_document(
        doc_id=f"rag_{file.filename}_{current_user.id}",
        title=title,
        doc_type=doc_type,
        content=content,
    )
    return {"message": "Document indexed in knowledge base.", "document": doc_record}


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard statistics for the current user."""
    from sqlalchemy import func
    total = db.query(func.count(CandidateEvaluation.id)).filter(
        CandidateEvaluation.created_by == current_user.id
    ).scalar()
    avg_score_raw = db.query(func.avg(CandidateEvaluation.final_score)).filter(
        CandidateEvaluation.created_by == current_user.id
    ).scalar()
    top_candidates = (
        db.query(CandidateEvaluation)
        .filter(CandidateEvaluation.created_by == current_user.id)
        .order_by(CandidateEvaluation.final_score.desc())
        .limit(5)
        .all()
    )
    return {
        "total_evaluations": total,
        "average_score": round(float(avg_score_raw), 3) if avg_score_raw else 0.0,
        "top_candidates": [
            {
                "name": e.candidate_name,
                "score": round(e.final_score, 3),
                "verdict": e.verdict,
                "date": e.created_at.isoformat() if e.created_at else None,
            }
            for e in top_candidates
        ],
    }
