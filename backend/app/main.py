"""
X-MMHF FastAPI Application Entry Point
Explainable Multimodal Multi-Agent Hiring Framework v2.0.0
Production-ready with JWT auth, rate limiting, structured logging, CORS.
"""
import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import engine, Base
from app.core.config import get_settings
from app.routers import hiring, experiments, auth, admin, jobs

# ── Structured logging setup ─────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ]
)
logger = structlog.get_logger()

# ── Settings ──────────────────────────────────────────────────────────────────
settings = get_settings()

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── Initialize Database Tables ────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
logger.info("Database tables initialized", db_url=settings.DATABASE_URL[:40])

# ── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="X-MMHF: Explainable Multimodal Multi-Agent Hiring Framework",
    description=(
        "Production AI hiring intelligence system with 10 autonomous agents, "
        "JWT authentication, real-time GitHub/portfolio analysis, and Gemini AI-powered XAI. "
        "IEEE Final Year Project — Full Stack Production System."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "X-MMHF Research Team",
        "url": "https://github.com/x-mmhf",
    },
)

# ── Rate limiter exception handler ────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)


# ── Request Logging Middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    log = structlog.get_logger()
    response = await call_next(request)
    log.info(
        "HTTP Request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        client=request.client.host if request.client else "unknown",
    )
    return response


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again or contact support."},
    )


# ── Include Routers ───────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(hiring.router)
app.include_router(experiments.router)
app.include_router(admin.router)
app.include_router(jobs.router)


# ── Health & Root Endpoints ───────────────────────────────────────────────────
@app.get("/", tags=["System"])
def read_root():
    from app.services.gemini_service import gemini_service
    return {
        "system":      "X-MMHF: Explainable Multimodal Multi-Agent Hiring Framework",
        "status":      "ONLINE",
        "version":     "2.0.0",
        "environment": settings.ENVIRONMENT,
        "database":    "PostgreSQL" if not settings.is_sqlite else "SQLite (dev)",
        "gemini_ai":   "CONNECTED" if gemini_service.is_available() else "FALLBACK_MODE",
        "agents":      10,
        "docs":        "/docs",
        "redoc":       "/redoc",
    }


@app.get("/health", tags=["System"])
def health_check():
    """Render/Vercel health probe endpoint."""
    return {"status": "healthy", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
