"""
Integration tests for the hiring evaluation endpoint and job postings.
"""
import io
import pytest


class TestHiringDashboard:
    def test_dashboard_stats_authenticated(self, client, recruiter_headers):
        response = client.get("/api/hiring/dashboard/stats", headers=recruiter_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_evaluations" in data
        assert "average_score" in data
        assert "top_candidates" in data

    def test_dashboard_stats_unauthenticated_fails(self, client):
        response = client.get("/api/hiring/dashboard/stats")
        assert response.status_code == 401


class TestEvaluationWithText:
    def test_evaluate_with_pasted_text(self, client, recruiter_headers):
        """Full pipeline test using pasted resume text — no file upload needed."""
        resume_text = (
            "Jane Doe - Senior Python Developer\n"
            "Skills: Python, FastAPI, Docker, AWS, PostgreSQL, React\n"
            "Experience: 5 years building cloud-native applications.\n"
            "Led architecture of microservices serving 1M+ users.\n"
            "Education: B.Sc. Computer Science"
        )
        response = client.post(
            "/api/hiring/evaluate-upload",
            data={
                "candidate_name": "Jane Doe",
                "job_title": "Senior Python Engineer",
                "job_description": "Looking for Python, FastAPI, Docker, AWS, Kubernetes expert.",
                "required_keywords_json": '["Python", "FastAPI", "Docker", "AWS", "Kubernetes"]',
                "resume_text_override": resume_text,
            },
            headers=recruiter_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary_scores" in data
        assert "explainability" in data
        assert "career_roadmap" in data
        assert "ats_optimization" in data
        assert "skill_gap_analysis" in data
        assert "recruiter_intelligence" in data
        assert data["agents_executed_count"] == 10
        assert 0.0 <= data["summary_scores"]["final_candidate_score"] <= 1.0
        assert "database_record_id" in data

    def test_evaluate_too_short_text_fails(self, client, recruiter_headers):
        response = client.post(
            "/api/hiring/evaluate-upload",
            data={"resume_text_override": "Hi"},
            headers=recruiter_headers,
        )
        assert response.status_code == 422

    def test_evaluate_no_input_fails(self, client, recruiter_headers):
        response = client.post(
            "/api/hiring/evaluate-upload",
            data={},
            headers=recruiter_headers,
        )
        assert response.status_code == 400

    def test_evaluate_unauthenticated_fails(self, client):
        response = client.post(
            "/api/hiring/evaluate-upload",
            data={"resume_text_override": "Python developer with 5 years of experience."},
        )
        assert response.status_code == 401


class TestEvaluationPagination:
    def test_get_evaluations_empty(self, client, recruiter_headers):
        response = client.get("/api/hiring/evaluations", headers=recruiter_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []

    def test_get_evaluations_after_submission(self, client, recruiter_headers):
        # Submit one evaluation
        client.post(
            "/api/hiring/evaluate-upload",
            data={
                "candidate_name": "Test Candidate",
                "resume_text_override": "Python developer experienced with FastAPI Docker AWS PostgreSQL system design.",
                "required_keywords_json": '["Python", "FastAPI", "Docker"]',
            },
            headers=recruiter_headers,
        )
        response = client.get("/api/hiring/evaluations", headers=recruiter_headers)
        assert response.status_code == 200
        assert response.json()["total"] == 1


class TestJobPostings:
    def test_create_job_posting(self, client, recruiter_headers):
        response = client.post(
            "/api/jobs/",
            json={
                "title": "Senior AI Engineer",
                "description": "We are looking for an AI engineer with Python and PyTorch experience to build ML pipelines.",
                "required_keywords": ["Python", "PyTorch", "FastAPI", "Docker"],
                "experience_level": "senior",
            },
            headers=recruiter_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Senior AI Engineer"
        assert "Python" in data["required_keywords"]

    def test_list_job_postings(self, client, recruiter_headers):
        # Create one
        client.post(
            "/api/jobs/",
            json={
                "title": "ML Engineer",
                "description": "Looking for an ML engineer with TensorFlow experience to train models and deploy them.",
                "required_keywords": ["Python", "TensorFlow"],
            },
            headers=recruiter_headers,
        )
        response = client.get("/api/jobs/", headers=recruiter_headers)
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_get_specific_job(self, client, recruiter_headers):
        create_resp = client.post(
            "/api/jobs/",
            json={
                "title": "Data Scientist",
                "description": "Seeking data scientist with Python, Pandas, and Scikit-Learn expertise for ML modeling work.",
                "required_keywords": ["Python", "Pandas"],
            },
            headers=recruiter_headers,
        )
        job_id = create_resp.json()["id"]
        response = client.get(f"/api/jobs/{job_id}", headers=recruiter_headers)
        assert response.status_code == 200
        assert response.json()["title"] == "Data Scientist"

    def test_candidate_cannot_create_job(self, client, db):
        from app.models import User
        from app.core.security import hash_password, create_access_token
        candidate = User(
            email="candidate@test.com",
            hashed_password=hash_password("CandPass1"),
            full_name="Test Candidate",
            role="candidate",
            is_active=True,
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        token = create_access_token({"sub": candidate.email, "role": "candidate", "user_id": candidate.id})
        response = client.post(
            "/api/jobs/",
            json={
                "title": "Unauthorized Job",
                "description": "This should not be allowed for candidate role users.",
                "required_keywords": ["Python"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403


class TestAdminPanel:
    def test_admin_can_get_stats(self, client, admin_headers):
        response = client.get("/api/admin/stats", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_evaluations" in data

    def test_recruiter_cannot_access_admin(self, client, recruiter_headers):
        response = client.get("/api/admin/stats", headers=recruiter_headers)
        assert response.status_code == 403

    def test_admin_can_list_users(self, client, admin_headers):
        response = client.get("/api/admin/users", headers=admin_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
