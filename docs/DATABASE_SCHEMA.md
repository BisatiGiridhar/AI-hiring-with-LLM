# X-MMHF Database Schema

## Overview

X-MMHF uses a **normalized relational schema** with 5 core tables. In development, SQLite is used; in production, PostgreSQL with connection pooling.

---

## Entity-Relationship Summary

```
users (1) ──< job_postings (many)
users (1) ──< candidate_evaluations (many)
users (1) ──< audit_logs (many)
job_postings (1) ──< candidate_evaluations (many, optional FK)
```

---

## Table: `users`

Registered user accounts for recruiters, candidates, and admins.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO | Auto-increment user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Login email address |
| `hashed_password` | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| `full_name` | VARCHAR(255) | NOT NULL | Display name |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'recruiter' | `recruiter` / `candidate` / `admin` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-delete flag |
| `created_at` | TIMESTAMP WITH TZ | NOT NULL, DEFAULT NOW | Account creation time |
| `updated_at` | TIMESTAMP WITH TZ | DEFAULT NOW, ONUPDATE | Last modification time |

**Indexes:**
- `ix_users_email` (UNIQUE)
- `ix_users_email_role` (composite)

---

## Table: `job_postings`

Recruiter-created job descriptions used for candidate evaluations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Job ID |
| `title` | VARCHAR(255) | NOT NULL, INDEX | Job title |
| `description` | TEXT | NOT NULL | Full job description |
| `required_keywords` | JSON | NOT NULL | `["Python", "Docker", ...]` |
| `required_skills` | JSON | NULLABLE | `{"Python": {"weight": 1.0, "difficulty": 2}}` |
| `department` | VARCHAR(100) | NULLABLE | Department name |
| `experience_level` | VARCHAR(50) | NULLABLE | `junior/mid/senior/lead/any` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Soft-delete flag |
| `created_by` | INTEGER | FK → users.id, NOT NULL | Creator user |
| `created_at` | TIMESTAMP WITH TZ | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP WITH TZ | DEFAULT NOW, ONUPDATE | Last edit time |

---

## Table: `candidate_evaluations`

Full results of each 10-agent evaluation run.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Evaluation ID |
| `candidate_name` | VARCHAR(255) | NOT NULL, INDEX | Candidate display name |
| `job_title` | VARCHAR(255) | NOT NULL | Role evaluated for |
| `job_posting_id` | INTEGER | FK → job_postings.id, NULLABLE | Linked job posting |
| `created_by` | INTEGER | FK → users.id, NULLABLE | Recruiter who ran it |
| `resume_file_name` | VARCHAR(255) | NULLABLE | Uploaded file name |
| `github_url` | VARCHAR(500) | NULLABLE | GitHub URL provided |
| `portfolio_url` | VARCHAR(500) | NULLABLE | Portfolio URL provided |
| `final_score` | FLOAT | NOT NULL | Calibrated composite score [0–1] |
| `ats_score` | FLOAT | NOT NULL | ATS passing probability [0–1] |
| `skill_gap_score` | FLOAT | NOT NULL | Skill coverage score [0–1] |
| `multimodal_score` | FLOAT | NOT NULL | Multimodal fusion score [0–1] |
| `confidence_score` | FLOAT | NOT NULL | Variance-based confidence [0–1] |
| `github_score` | FLOAT | NULLABLE | GitHub analysis score |
| `portfolio_score` | FLOAT | NULLABLE | Portfolio scraping score |
| `verdict` | VARCHAR(100) | NOT NULL | Human-readable verdict string |
| `full_result` | JSON | NULLABLE | Complete 10-agent output (all fields) |
| `created_at` | TIMESTAMP WITH TZ | NOT NULL, DEFAULT NOW | Evaluation timestamp |
| `updated_at` | TIMESTAMP WITH TZ | DEFAULT NOW, ONUPDATE | Last edit time |

**Indexes:**
- `ix_evaluations_score` on `final_score`
- `ix_evaluations_created` on `created_at`

---

## Table: `recruiter_documents`

RAG knowledge base — recruiter-uploaded documents for semantic search.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Document ID |
| `doc_id` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Unique document identifier |
| `title` | VARCHAR(255) | NOT NULL | Document title |
| `doc_type` | VARCHAR(100) | NOT NULL | `Job Description`, `Company Policy`, etc. |
| `content_text` | TEXT | NOT NULL | Full extracted text content |
| `uploaded_by` | INTEGER | FK → users.id, NULLABLE | Uploading user |
| `created_at` | TIMESTAMP WITH TZ | DEFAULT NOW | Upload time |

---

## Table: `audit_logs`

Security and operational event log for admin monitoring.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Log entry ID |
| `user_id` | INTEGER | FK → users.id, NULLABLE | Actor user (NULL for anonymous) |
| `action` | VARCHAR(255) | NOT NULL, INDEX | `USER_LOGIN`, `CANDIDATE_EVALUATED`, etc. |
| `resource` | VARCHAR(255) | NULLABLE | API endpoint path |
| `ip_address` | VARCHAR(50) | NULLABLE | Client IP |
| `user_agent` | VARCHAR(500) | NULLABLE | Browser/client UA string |
| `status_code` | INTEGER | NULLABLE | HTTP status code |
| `details` | JSON | NULLABLE | Action-specific metadata |
| `created_at` | TIMESTAMP WITH TZ | NOT NULL, INDEX | Event timestamp |

---

## Score Fields Reference

All score fields are stored as `FLOAT` in the range `[0.0, 1.0]` and represent probabilities or normalized metrics:

| Score Column | Description | Range |
|---|---|---|
| `final_score` | Calibrated composite: `S_Final × C_score` | [0–1] |
| `ats_score` | ATS passing probability | [0–1] |
| `skill_gap_score` | Fraction of required skills matched | [0–1] |
| `multimodal_score` | Cross-attention fusion result | [0–1] |
| `confidence_score` | Variance-based confidence index | [0–1] |

---

## Production PostgreSQL Configuration

Connection pooling settings in `database.py` for PostgreSQL:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=10,       # Active connections kept alive
    max_overflow=20,    # Burst connections allowed
    pool_pre_ping=True, # Test connection liveness on checkout
)
```
