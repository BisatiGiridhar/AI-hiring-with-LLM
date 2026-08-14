# X-MMHF User Manual

## Getting Started

### 1. Create an Account

1. Navigate to the application URL
2. Click **"Create Account"** or **"Register"**
3. Fill in:
   - **Full Name**: Your real name
   - **Email**: A valid email address
   - **Password**: Minimum 8 characters, must include an uppercase letter and a digit
   - **Role**: Select `recruiter` (to evaluate candidates) or `candidate`
4. Click **Register** — you will be automatically logged in

---

### 2. Navigating the Application

After login, you'll see the navigation bar with these sections:

| Tab | Description |
|---|---|
| **10-Agent DAG Network** | Visual map of all 10 AI agents and their connections |
| **Multimodal Evaluator** | Upload resumes and run candidate assessments |
| **ATS Optimizer** | View ATS compliance details from the last evaluation |
| **30-60-90 Roadmap** | Career roadmap generated for the last candidate |
| **XAI Recruiter Room** | Explainability report and interview question generator |
| **IEEE Benchmarks** | Performance comparison charts vs. baseline models |
| **IEEE Paper Viewer** | Full research paper viewer |

---

## Running a Candidate Evaluation

### Step 1: (Optional) Load a Job Posting

If you have previously created job postings, a **dropdown** will appear at the top of the evaluator form. Select a job to auto-fill the title, description, and required keywords.

### Step 2: Fill in Candidate Information

| Field | Required | Description |
|---|---|---|
| **Candidate Name** | ✅ | Full name of the candidate |
| **Target Job Title** | ✅ | The role being evaluated for |
| **Resume File** | ⚠️ | Upload PDF, DOCX, or TXT file |
| **Resume Text** | ⚠️ | OR paste raw resume text |
| **GitHub URL** | Optional | Candidate's GitHub profile URL |
| **Portfolio URL** | Optional | Candidate's portfolio website |
| **Required Keywords** | Required | Comma-separated key skills |

> Either a resume file upload OR pasted text is required. If you upload a file, the text area is hidden.

### Step 3: Run the Assessment

Click **"Run Real Candidate Multimodal Assessment"**.

The system will:
1. Parse the resume using OCR/PDF extraction
2. Call the GitHub API for live repository data (if URL provided)
3. Scrape the portfolio website (if URL provided)
4. Execute all 10 agents in the DAG pipeline
5. Compute cross-attention multimodal fusion
6. Generate an XAI explanation via Gemini AI (or rule-based fallback)

Processing typically takes **2–8 seconds**.

---

## Understanding Evaluation Results

### Summary Scores Panel

| Score | Meaning |
|---|---|
| **Final Score %** | Overall composite score (0–100%) |
| **Confidence Score** | How reliable the score is (higher = more modalities available) |
| **ATS Pass Rate** | Probability resume passes ATS parsers |
| **Hiring Readiness** | Fraction of required skills possessed |

### Verdict Tiers

| Verdict | Score Range |
|---|---|
| STRONG RECOMMENDATION FOR INTERVIEW | ≥82% |
| MODERATE CANDIDATE - SHORTLIST FOR REVIEW | 68–81% |
| BORDERLINE - MANAGER DISCRETION ADVISED | 50–67% |
| REJECT / DIVERSIFY CANDIDATE POOL | <50% |

---

## ATS Optimizer Tab

View after running an evaluation:
- **Keyword Density Score**: How well keywords appear in the resume
- **Missing Keywords**: Keywords not found (add these to the resume)
- **Formatting Compliance**: Layout compatibility with ATS parsers
- **Optimization Suggestions**: Specific, actionable improvements

---

## 30-60-90 Day Career Roadmap Tab

Shows a structured upskilling plan for the evaluated candidate:
- **30-Day Goals**: Quick wins and foundational skills
- **60-Day Goals**: Intermediate skill development
- **90-Day Goals**: Advanced competency targets
- **Live Recommended Courses**: Real course links from Coursera, edX, AWS, etc.

---

## XAI Recruiter Room Tab

- **Natural Language Rationale**: Gemini AI-generated explanation of the hiring decision
- **Feature Attributions**: SHAP-style breakdown of which factors contributed most
- **Counterfactual Insights**: "If candidate acquires X, score improves by Y%"
- **Bias Audit**: Demographic parity and fairness compliance check
- **Interview Questions**: AI-generated targeted questions based on the candidate's profile

---

## Evaluation History

Click **"History"** in the navigation to:
- View all past evaluations
- See scores and verdicts at a glance
- Open full evaluation details
- Delete records

---

## Managing Job Postings

From the profile or admin area:
1. Create a job posting with title, description, and required keywords
2. Use it in evaluations via the dropdown selector
3. Edit or deactivate postings as needed

---

## Profile Settings

Click your name or **"Profile"** in the navigation to:
- Update your full name
- Change your password (requires current password)

---

## Security Notes

- Your session uses secure JWT tokens that expire after 60 minutes
- Tokens are automatically refreshed in the background
- Logging out clears all tokens from your browser
- Passwords are never stored in plain text — only bcrypt hashes
