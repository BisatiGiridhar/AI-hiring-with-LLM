# X-MMHF: Explainable Multimodal Multi-Agent Hiring Framework

> **IEEE Final Year Project** | Production-Ready AI Hiring Intelligence System  
> FastAPI + React + PostgreSQL | 10-Agent DAG | Gemini AI | JWT Auth

[![Backend Tests](https://img.shields.io/badge/tests-41%2F41%20passing-brightgreen)](./backend/tests)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://python.org)
[![React](https://img.shields.io/badge/react-18.3-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Overview

X-MMHF is a **context-aware, multimodal, and explainable multi-agent recruitment intelligence system** built as a complete IEEE publication-quality project. It orchestrates **10 specialized autonomous agents** in a Directed Acyclic Graph (DAG) to evaluate candidates across Resume, GitHub, Portfolio, and Video modalities — producing ranked scores, XAI explanations, and adaptive 30-60-90 day career roadmaps.

**Live Demo:**
- Frontend (Vercel): `https://your-project.vercel.app`
- Backend API (Render): `https://your-backend.onrender.com`
- API Documentation: `https://your-backend.onrender.com/docs`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 CANDIDATE MULTIMODAL INPUTS              │
│  [Resume PDF]  [GitHub URL]  [Portfolio URL]  [Text]    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              DAG MULTI-AGENT ORCHESTRATION               │
│  Resume Agent → ATS Agent → Skill Gap Agent             │
│  GitHub Agent → Portfolio Agent → Video Agent           │
│  Ranking Agent → XAI Agent → Recruiter Agent            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│           MULTIMODAL CROSS-ATTENTION FUSION             │
│  S_Final = α·S_ATS + β·S_Skill + γ·S_Multi + δ·S_Road  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Features

| Feature | Status |
|---|---|
| 10-Agent DAG Orchestration | ✅ |
| Real PDF/DOCX Resume Parsing | ✅ |
| Live GitHub REST API Analysis | ✅ |
| Live Portfolio Web Scraping | ✅ |
| Gemini AI XAI Explanations | ✅ |
| JWT Authentication (Access + Refresh) | ✅ |
| Role-Based Access (Admin/Recruiter/Candidate) | ✅ |
| 30-60-90 Day Career Roadmap Generator | ✅ |
| ATS Compliance Mathematical Model | ✅ |
| Skill Gap Ontology Mapping | ✅ |
| Bias Audit & Demographic Parity | ✅ |
| Admin Panel with Audit Logs | ✅ |
| PostgreSQL (prod) / SQLite (dev) | ✅ |
| Vercel + Render Deployment | ✅ |
| 41/41 Tests Passing | ✅ |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/x-mmhf.git
cd x-mmhf
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Edit .env and fill in: GEMINI_API_KEY, GITHUB_TOKEN (optional)

# Start the server
uvicorn app.main:app --reload
# → http://127.0.0.1:8000
# → http://127.0.0.1:8000/docs
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (for local development, default is fine)
# Edit .env.local if needed: VITE_API_BASE_URL=http://127.0.0.1:8000

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | ✅ | `sqlite:///./hiring_intelligence.db` (dev) or PostgreSQL URL (prod) |
| `GEMINI_API_KEY` | ⚠️ Optional | Google Gemini API key for AI-enhanced XAI (falls back to rule-based) |
| `GITHUB_TOKEN` | ⚠️ Optional | GitHub personal access token for higher API rate limits |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed frontend origins |
| `ENVIRONMENT` | ✅ | `development` or `production` |

### Frontend (`frontend/.env.local`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL (e.g. `https://your-backend.onrender.com`) |

---

## Project Structure

```
x-mmhf/
├── backend/
│   ├── app/
│   │   ├── agents/          # 10 autonomous AI agents
│   │   │   ├── orchestrator.py    # DAG pipeline controller
│   │   │   ├── resume_agent.py    # Resume parsing & skill extraction
│   │   │   ├── ats_agent.py       # ATS compliance scoring
│   │   │   ├── skill_gap_agent.py # Skill gap ontology mapping
│   │   │   ├── career_agent.py    # 30-60-90 roadmap generator
│   │   │   ├── github_agent.py    # GitHub repository analysis
│   │   │   ├── portfolio_agent.py # Portfolio web scraping
│   │   │   ├── video_agent.py     # Video/soft-skill analysis
│   │   │   ├── ranking_agent.py   # Multimodal fusion scoring
│   │   │   ├── xai_agent.py       # XAI explanations & SHAP
│   │   │   └── recruiter_agent.py # Bias audit & interview Q gen
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic settings management
│   │   │   └── security.py        # JWT + bcrypt security
│   │   ├── math_engine/
│   │   │   └── scoring.py         # Mathematical models (Eq 1-8)
│   │   ├── routers/
│   │   │   ├── auth.py            # Register, Login, Refresh, Profile
│   │   │   ├── hiring.py          # Evaluation pipeline endpoints
│   │   │   ├── jobs.py            # Job posting CRUD
│   │   │   ├── admin.py           # Admin panel endpoints
│   │   │   └── experiments.py     # IEEE benchmark data
│   │   ├── services/
│   │   │   ├── gemini_service.py  # Gemini AI integration
│   │   │   ├── github_service.py  # GitHub REST API client
│   │   │   ├── portfolio_scraper.py # Web scraping service
│   │   │   ├── document_parser.py # PDF/DOCX/TXT parser
│   │   │   ├── learning_trends_service.py # 30+ skill→course mapping
│   │   │   └── rag_service.py     # RAG knowledge base
│   │   ├── database.py            # SQLAlchemy engine & session
│   │   ├── models.py              # ORM database models
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   └── main.py                # FastAPI app entry point
│   ├── tests/
│   │   ├── test_agents.py         # Agent unit tests
│   │   ├── test_auth.py           # Authentication tests
│   │   └── test_hiring.py         # Hiring pipeline tests
│   ├── requirements.txt
│   ├── render.yaml                # Render deployment config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route-level page components
│   │   ├── services/api.ts        # Axios API client with JWT
│   │   ├── store/AuthContext.tsx  # Global auth state
│   │   └── types/                 # TypeScript type definitions
│   ├── package.json
│   └── vercel.json                # Vercel deployment config
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── ARCHITECTURE.md
│   ├── USER_MANUAL.md
│   └── ADMIN_MANUAL.md
└── IEEE_Paper_Multimodal_Agentic_Hiring.md
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login (returns JWT) | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| GET | `/api/auth/me` | Get current user profile | JWT |
| PUT | `/api/auth/me` | Update profile/password | JWT |
| POST | `/api/hiring/evaluate-upload` | **Run 10-agent evaluation** | JWT |
| GET | `/api/hiring/evaluations` | List my evaluations | JWT |
| GET | `/api/hiring/evaluations/{id}` | Get evaluation details | JWT |
| DELETE | `/api/hiring/evaluations/{id}` | Delete evaluation | JWT |
| GET | `/api/hiring/dashboard/stats` | Dashboard statistics | JWT |
| POST | `/api/jobs/` | Create job posting | Recruiter/Admin |
| GET | `/api/jobs/` | List active job postings | JWT |
| GET | `/api/admin/stats` | System statistics | Admin |
| GET | `/api/admin/users` | Manage users | Admin |
| GET | `/api/admin/audit-logs` | Security audit logs | Admin |
| GET | `/api/experiments/benchmarks` | IEEE benchmark results | Public |
| GET | `/api/experiments/ablation` | Ablation study results | Public |

---

## Running Tests

```bash
cd backend
python -m pytest tests/ -v
# Expected: 41/41 passed
```

---

## Deployment

See [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md) and [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md) for complete deployment guides.

**Quick deployment:**
1. **Backend → Render**: Connect GitHub repo, Render auto-reads `render.yaml`
2. **Frontend → Vercel**: Import repo, set `VITE_API_BASE_URL` to your Render URL

---

## IEEE Paper

The full IEEE research paper is in [`IEEE_Paper_Multimodal_Agentic_Hiring.md`](./IEEE_Paper_Multimodal_Agentic_Hiring.md).

**Published Metrics (X-MMHF vs. SOTA Baselines):**
| Metric | BERT | S-BERT | GPT-4 | X-MMHF (Ours) |
|---|---|---|---|---|
| F1-Score | 0.727 | 0.770 | 0.861 | **0.953** |
| NDCG@5 | 0.712 | 0.765 | 0.881 | **0.974** |
| ROC-AUC | 0.781 | 0.824 | 0.912 | **0.982** |
| Recruiter Trust | 2.1/5 | 2.8/5 | 3.9/5 | **4.85/5** |

---

## Security

- Passwords hashed with **bcrypt**
- **JWT** access (60 min) + refresh (7 day) tokens
- **Role-Based Access Control**: admin / recruiter / candidate
- **Rate limiting**: 60 req/min per IP
- **Input sanitization** on all endpoints via Pydantic validation
- **CORS** configured per environment
- **Audit logging** of all sensitive actions

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for IEEE Final Year Project | X-MMHF Research Team*
