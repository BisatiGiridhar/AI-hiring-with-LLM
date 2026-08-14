# Frontend Deployment Guide — Vercel

## Prerequisites
- Vercel account at https://vercel.com
- Backend deployed on Render (get the URL first)

---

## Step 1: Import Project

1. Log in to Vercel → **Add New** → **Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`

---

## Step 2: Build Settings

Vercel auto-detects Vite. Verify these settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## Step 3: Environment Variables

In Vercel project → **Settings** → **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |

> **Important**: The value must NOT have a trailing slash.

---

## Step 4: Vercel Configuration

The `vercel.json` in `/frontend` handles SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
This ensures React Router's client-side routes work on direct page load/refresh.

---

## Step 5: Deploy

Click **Deploy**. Vercel builds and deploys in ~2 minutes.

---

## Step 6: Verify

1. Visit your Vercel URL → should show the login/register page
2. Register a new account → confirm it saves to the backend DB
3. Try running a candidate evaluation

---

## Custom Domain (Optional)

Vercel → your project → **Settings** → **Domains** → Add your domain.

Update `CORS_ORIGINS` on Render to include your custom domain.

---

## Production Checklist

- [ ] `VITE_API_BASE_URL` is set to the exact Render backend URL
- [ ] No trailing slash in the API URL
- [ ] Register & login works end-to-end
- [ ] Evaluation pipeline returns results
- [ ] All tabs load without errors (Dashboard, Evaluator, ATS, Roadmap, XAI)
