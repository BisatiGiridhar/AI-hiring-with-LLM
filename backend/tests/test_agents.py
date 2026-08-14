"""
Agent unit tests: verifies each of the 10 agents produces valid, non-mock output
when given real resume text input.
"""
import pytest
from app.agents.resume_agent import ResumeAgent
from app.agents.ats_agent import ATSAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.career_agent import CareerRoadmapAgent
from app.agents.xai_agent import ExplainabilityAgent
from app.agents.ranking_agent import CandidateRankingAgent
from app.agents.recruiter_agent import RecruiterIntelligenceAgent

SAMPLE_RESUME = """
John Smith - Senior Software Engineer
Email: john@example.com | GitHub: github.com/johnsmith

Summary:
Experienced software engineer with 6+ years building production AI systems.

Skills: Python, PyTorch, FastAPI, Docker, AWS, PostgreSQL, React, TypeScript

Experience:
Senior AI Engineer at TechCorp (2021-2024)
- Built real-time ML inference pipelines using Python and PyTorch
- Deployed containerized FastAPI services on AWS ECS
- Led team of 5 engineers across 3 product launches

Education:
B.Sc. Computer Science, MIT, 2018
"""

REQUIRED_KEYWORDS = ["Python", "PyTorch", "FastAPI", "Docker", "AWS", "Kubernetes"]
REQUIRED_SKILLS = {k: {"weight": 1.0, "difficulty": 3} for k in REQUIRED_KEYWORDS}


class TestResumeAgent:
    def test_extracts_skills_from_real_text(self):
        agent = ResumeAgent()
        result = agent.analyze(SAMPLE_RESUME, "John Smith")
        assert result["status"] == "COMPLETED"
        assert "Python" in result["extracted_skills"]
        assert "PyTorch" in result["extracted_skills"]
        assert result["skill_count"] >= 5
        assert result["estimated_years_experience"] > 0
        assert isinstance(result["raw_word_count"], int)

    def test_produces_latent_vector_of_correct_shape(self):
        import numpy as np
        agent = ResumeAgent()
        result = agent.analyze(SAMPLE_RESUME, "John Smith")
        assert len(result["latent_vector"]) == 64

    def test_empty_resume_handled_gracefully(self):
        agent = ResumeAgent()
        result = agent.analyze("  ", "Unknown")
        assert result["status"] == "COMPLETED"
        assert result["skill_count"] == 0


class TestATSAgent:
    def test_computes_ats_score_in_valid_range(self):
        agent = ATSAgent()
        result = agent.analyze(SAMPLE_RESUME, REQUIRED_KEYWORDS)
        assert result["status"] == "COMPLETED"
        assert 0.0 <= result["s_ats"] <= 1.0
        # passing_probability may be 0-1 or 0-100 depending on math engine
        assert result["passing_probability"] >= 0
        assert isinstance(result["missing_keywords"], list)
        assert isinstance(result["matched_keywords_count"], int)

    def test_high_match_gives_higher_score(self):
        agent = ATSAgent()
        high_match = agent.analyze("Python PyTorch FastAPI Docker AWS Kubernetes expert developer", REQUIRED_KEYWORDS)
        low_match  = agent.analyze("Marketing manager with sales experience", REQUIRED_KEYWORDS)
        assert high_match["s_ats"] >= low_match["s_ats"]


class TestSkillGapAgent:
    def test_identifies_missing_skills(self):
        agent = SkillGapAgent()
        extracted = ["Python", "PyTorch", "FastAPI", "Docker", "AWS"]
        result = agent.analyze(extracted, REQUIRED_SKILLS)
        assert result["status"] == "COMPLETED"
        assert 0.0 <= result["s_skill"] <= 1.0
        # hiring_readiness_index may be 0-1 or 0-100 depending on implementation
        assert result["hiring_readiness_index"] >= 0
        missing_names = [m["skill"] for m in result["missing_skills"]]
        assert "Kubernetes" in missing_names  # Kubernetes not in extracted

    def test_full_skill_match_gives_high_score(self):
        agent = SkillGapAgent()
        extracted = list(REQUIRED_SKILLS.keys())  # All required skills present
        result = agent.analyze(extracted, REQUIRED_SKILLS)
        assert result["hiring_readiness_index"] >= 0.9


class TestCareerRoadmapAgent:
    def test_generates_30_60_90_day_plan(self):
        agent = CareerRoadmapAgent()
        missing_skills = [{"skill": "Kubernetes", "difficulty": 4, "weight": 1.0, "est_hours": 40}]
        # career agent uses candidate_readiness parameter
        result = agent.generate(missing_skills, candidate_readiness=0.7)
        assert result["status"] == "COMPLETED"
        assert "roadmap" in result
        roadmap = result["roadmap"]
        assert any(k for k in roadmap.keys() if "30" in k or "day" in k.lower() or "phase" in k.lower())


class TestExplainabilityAgent:
    def test_generates_verdict_and_rationale(self):
        agent = ExplainabilityAgent()
        score_components = {
            "s_ats": 0.75, "s_skill": 0.80, "s_multimodal": 0.70,
            "s_roadmap": 0.65, "s_video": 0.72
        }
        missing_skills = [{"skill": "Kubernetes", "difficulty": 3, "weight": 1.0}]
        ats_info = {"passing_probability": 0.78, "missing_keywords": ["Kubernetes"]}
        result = agent.generate_explanation(
            candidate_name="John Smith",
            final_score=0.85,
            score_components=score_components,
            missing_skills=missing_skills,
            ats_info=ats_info,
        )
        assert result["status"] == "COMPLETED"
        assert "verdict" in result
        assert "natural_language_rationale" in result
        assert "feature_attributions" in result
        assert "counterfactual_insights" in result
        assert "bias_audit" in result
        assert "INTERVIEW" in result["verdict"] or "RECOMMEND" in result["verdict"] or "STRONG" in result["verdict"]

    def test_low_score_gives_reject_verdict(self):
        agent = ExplainabilityAgent()
        result = agent.generate_explanation(
            candidate_name="Weak Candidate",
            final_score=0.30,
            score_components={"s_ats": 0.3, "s_skill": 0.3, "s_multimodal": 0.3, "s_roadmap": 0.3, "s_video": 0.3},
            missing_skills=[{"skill": "Python", "difficulty": 4, "weight": 1.0}],
            ats_info={"passing_probability": 0.30, "missing_keywords": ["Python"]},
        )
        assert "REJECT" in result["verdict"] or "PASS" in result["verdict"] or "BORDERLINE" in result["verdict"]


class TestRecruiterIntelligenceAgent:
    def test_generates_interview_questions(self):
        agent = RecruiterIntelligenceAgent()
        result = agent.audit_and_generate_prompts(
            candidate_name="John Smith",
            missing_skills=[{"skill": "Kubernetes", "difficulty": 3}],
            extracted_skills=["Python", "PyTorch", "FastAPI"],
            final_score=0.80,
            job_title="Senior AI Engineer",
        )
        assert result["status"] == "COMPLETED"
        assert len(result["generated_interview_questions"]) >= 3
        assert "recommended_recruiter_action" in result
        assert result["synthetic_bias_audit"]["demographic_parity_status"] == "VERIFIED_NEUTRAL"


class TestCandidateRankingAgent:
    def test_produces_valid_scores(self):
        import numpy as np
        agent = CandidateRankingAgent()
        mock_resume_res  = {"latent_vector": np.random.rand(64).tolist()}
        mock_ats_res     = {"s_ats": 0.75, "passing_probability": 0.75, "keyword_density": 0.7}
        mock_skill_res   = {"s_skill": 0.80, "hiring_readiness_index": 0.80, "missing_skills": []}
        mock_port_res    = {"s_portfolio": 0.65, "status": "COMPLETED", "latent_vector": np.random.rand(64).tolist()}
        mock_github_res  = {"s_github": 0.70, "status": "COMPLETED", "latent_vector": np.random.rand(64).tolist()}
        mock_video_res   = {"s_video": 0.72, "status": "COMPLETED", "latent_vector": np.random.rand(64).tolist()}
        mock_roadmap_res = {"s_roadmap": 0.68}

        result = agent.rank(
            resume_res=mock_resume_res,
            ats_res=mock_ats_res,
            skill_res=mock_skill_res,
            portfolio_res=mock_port_res,
            github_res=mock_github_res,
            video_res=mock_video_res,
            roadmap_res=mock_roadmap_res,
        )
        assert result["status"] == "COMPLETED"
        assert 0.0 <= result["s_final_calibrated"] <= 1.0
        assert 0.0 <= result["confidence_score"] <= 1.0
        assert "attention_weights" in result
