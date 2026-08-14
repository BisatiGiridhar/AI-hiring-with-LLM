# X-MMHF API Documentation

## Base URL

- **Local**: `http://127.0.0.1:8000`
- **Production**: `https://your-backend.onrender.com`
- **Interactive Docs**: `{BASE_URL}/docs` (Swagger UI)

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "Jane Doe",
  "role": "recruiter"
}
```
> `role` must be one of: `recruiter`, `candidate`, `admin`  
> Password must be ≥8 chars, contain uppercase + digit

**Response `201`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "role": "recruiter",
  "is_active": true,
  "created_at": "2026-08-12T04:00:00Z"
}
```

---

### POST `/api/auth/login`
Login and obtain JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response `200`:**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": 1, "email": "...", "role": "recruiter" }
}
```

---

### POST `/api/auth/refresh`
Refresh expired access token.

**Request Body:**
```json
{ "refresh_token": "<refresh_jwt>" }
```

---

### GET `/api/auth/me`
Get current authenticated user profile. Requires JWT.

---

### PUT `/api/auth/me`
Update profile or change password.

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "current_password": "OldPass1",
  "new_password": "NewPass2"
}
```

---

## Hiring Intelligence Endpoints

### POST `/api/hiring/evaluate-upload`
**Primary endpoint — runs the full 10-agent evaluation pipeline.**

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `candidate_name` | string | ✅ | Candidate's full name |
| `job_title` | string | ✅ | Target job title |
| `job_description` | string | ✅ | Full job description text |
| `required_keywords_json` | JSON string | ✅ | `["Python","Docker","AWS"]` |
| `resume_file` | file | ⚠️ | PDF/DOCX/TXT resume file |
| `resume_text_override` | string | ⚠️ | Raw text if no file |
| `github_url` | string | Optional | GitHub profile URL |
| `portfolio_url` | string | Optional | Portfolio website URL |
| `job_posting_id` | integer | Optional | Load saved job posting |

> Either `resume_file` OR `resume_text_override` is required.

**Response `200`:** Full 10-agent evaluation result:
```json
{
  "candidate_name": "John Doe",
  "database_record_id": 42,
  "total_latency_seconds": 1.84,
  "agents_executed_count": 10,
  "summary_scores": {
    "final_candidate_score": 0.8412,
    "final_percentage": 84.12,
    "confidence_score": 0.9231,
    "hiring_readiness_index": 78.5,
    "ats_passing_probability": 82.3
  },
  "resume_analysis": { ... },
  "ats_optimization": { "s_ats": 0.823, "missing_keywords": [...], ... },
  "skill_gap_analysis": { "s_skill": 0.75, "missing_skills": [...], ... },
  "career_roadmap": { "30_day": [...], "60_day": [...], "90_day": [...] },
  "multimodal_analysis": { "portfolio": {...}, "github": {...}, "video": {...} },
  "explainability": {
    "verdict": "STRONG RECOMMENDATION FOR INTERVIEW",
    "natural_language_rationale": "...",
    "feature_attributions": { "ATS Compliance & Keywords": 21.4, ... },
    "counterfactual_insights": [...]
  },
  "recruiter_intelligence": { "interview_questions": [...], "bias_audit": {...} }
}
```

---

### GET `/api/hiring/evaluations`
List all evaluations created by the current user (paginated).

**Query Params:** `page=1`, `page_size=10`

---

### GET `/api/hiring/evaluations/{eval_id}`
Get full evaluation result by ID.

---

### DELETE `/api/hiring/evaluations/{eval_id}`
Delete an evaluation record (owner or admin).

---

### GET `/api/hiring/dashboard/stats`
Returns dashboard statistics for the current user:
```json
{
  "total_evaluations": 15,
  "average_score": 0.742,
  "top_candidates": [{ "name": "...", "score": 0.92, "verdict": "..." }]
}
```

---

## Job Postings Endpoints

### POST `/api/jobs/`
Create a new job posting (Recruiter/Admin only).

```json
{
  "title": "Senior AI Engineer",
  "description": "We are seeking...",
  "required_keywords": ["Python", "PyTorch", "Docker"],
  "department": "Engineering",
  "experience_level": "senior"
}
```

### GET `/api/jobs/`
List active job postings. Query: `active_only=true`

### GET `/api/jobs/{job_id}` | PUT `/api/jobs/{job_id}` | DELETE `/api/jobs/{job_id}`
CRUD operations on a specific job posting.

### GET `/api/jobs/my/postings`
Get all job postings created by the current user.

---

## Admin Panel Endpoints

> All admin endpoints require `role: admin`

### GET `/api/admin/stats`
System-wide statistics:
```json
{
  "total_users": 50,
  "total_evaluations": 234,
  "active_users": 48,
  "average_final_score": 0.742,
  "top_verdict_counts": { "STRONG RECOMMENDATION FOR INTERVIEW": 89 },
  "recent_activity_count": 12
}
```

### GET `/api/admin/users`
List all users. Query: `role=recruiter`, `skip=0`, `limit=50`

### PATCH `/api/admin/users/{user_id}`
Update user role or active status.

### DELETE `/api/admin/users/{user_id}`
Soft-deactivate a user.

### GET `/api/admin/audit-logs`
Security audit log entries. Query: `action=USER_LOGIN`, `user_id=1`

### GET `/api/admin/evaluations`
All evaluations across all users.

---

## Research Experiments

### GET `/api/experiments/benchmarks`
Returns the IEEE paper's empirical performance metrics comparing X-MMHF against BERT, S-BERT, GPT-4, Llama-3-70B, DeepSeek-R1, and the base IEEE paper model.

### GET `/api/experiments/ablation`
Returns the ablation study results showing per-agent contribution to overall performance.

---

## Error Codes

| Code | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 409 | Conflict — e.g. email already registered |
| 413 | File too large (>10MB) |
| 422 | Unprocessable entity — content too short |
| 429 | Rate limit exceeded (60 req/min) |
| 500 | Internal server error |
