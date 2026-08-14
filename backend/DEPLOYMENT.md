# Backend Deployment Guide — Render

## Prerequisites
- Render account at https://render.com
- PostgreSQL database provisioned on Render (or external)
- GitHub repository with the project pushed

---

## Step 1: Connect Repository

1. Log in to Render → **New** → **Web Service**
2. Connect your GitHub account and select this repository
3. Render will auto-detect `render.yaml` — click **Apply**

---

## Step 2: Render Auto-Configuration

The `render.yaml` file in `/backend` configures:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health`
- **Database**: PostgreSQL (`xmmhf-db`) auto-provisioned

---

## Step 3: Required Environment Variables

Set these in the Render dashboard → your service → **Environment**:

| Variable | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | Generate a 64-char random string |
| `DATABASE_URL` | Auto-set from `fromDatabase` in render.yaml |
| `CORS_ORIGINS` | `https://your-vercel-app.vercel.app` |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `GITHUB_TOKEN` | (Optional) GitHub personal access token |

> **Get Gemini API key**: https://aistudio.google.com/app/apikey

---

## Step 4: Database Migration

On first deploy, the backend auto-creates all tables via:
```python
Base.metadata.create_all(bind=engine)
```

No manual migration steps needed for initial deployment.

---

## Step 5: Verify Deployment

After deploy completes:
1. Visit `https://your-service.onrender.com/health` → should return `{"status":"healthy"}`
2. Visit `https://your-service.onrender.com/docs` → should show all API endpoints
3. Visit `https://your-service.onrender.com/` → should show system status

---

## Step 6: Create First Admin User

Use the `/api/auth/register` endpoint via Swagger UI:
```json
{
  "email": "admin@yourcompany.com",
  "password": "YourSecurePassword1",
  "full_name": "System Administrator",
  "role": "admin"
}
```

Then manually update the database role if needed, or register with `"role": "admin"`.

---

## Production Checklist

- [ ] `SECRET_KEY` is a long random value (never use the default)
- [ ] `ENVIRONMENT=production` is set
- [ ] `CORS_ORIGINS` matches your exact Vercel domain
- [ ] `DATABASE_URL` points to PostgreSQL (not SQLite)
- [ ] Health check endpoint returns 200
- [ ] All 5 route groups visible in `/docs`
