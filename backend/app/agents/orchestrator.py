import time
import numpy as np
from app.agents.resume_agent import ResumeAgent
from app.agents.ats_agent import ATSAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.career_agent import CareerRoadmapAgent
from app.agents.portfolio_agent import PortfolioAgent
from app.agents.github_agent import GitHubAgent
from app.agents.video_agent import VideoInterviewAgent
from app.agents.xai_agent import ExplainabilityAgent
from app.agents.ranking_agent import CandidateRankingAgent
from app.agents.recruiter_agent import RecruiterIntelligenceAgent

class MultiAgentOrchestrator:
    """
    DAG Multi-Agent System Orchestrator coordinating execution flow across all 10 agents.

    Key fix: the router pre-fetches async data (GitHub REST API, portfolio scraper)
    and injects it here via `github_prefetched` and `portfolio_prefetched` so that
    the synchronous orchestrator pipeline can use real live data without being async.
    """
    def __init__(self):
        self.resume_agent    = ResumeAgent()
        self.ats_agent       = ATSAgent()
        self.skill_gap_agent = SkillGapAgent()
        self.career_agent    = CareerRoadmapAgent()
        self.portfolio_agent = PortfolioAgent()
        self.github_agent    = GitHubAgent()
        self.video_agent     = VideoInterviewAgent()
        self.xai_agent       = ExplainabilityAgent()
        self.ranking_agent   = CandidateRankingAgent()
        self.recruiter_agent = RecruiterIntelligenceAgent()

    def process_candidate(
        self,
        candidate_name: str,
        resume_text: str,
        job_description: str,
        required_keywords: list[str],
        required_skills: dict[str, dict],
        github_url: str = None,
        portfolio_url: str = None,
        has_video: bool = True,
        job_title: str = "the target role",
        # Pre-fetched async data injected from the router
        github_prefetched: dict = None,
        portfolio_prefetched: dict = None,
    ) -> dict:
        start_time = time.time()
        agent_execution_log = []

        # ── Step 1: Resume Agent Parsing ──────────────────────────────────────
        t0 = time.time()
        res_out = self.resume_agent.analyze(resume_text, candidate_name)
        agent_execution_log.append({
            "agent": self.resume_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 2: ATS Agent ─────────────────────────────────────────────────
        t0 = time.time()
        ats_out = self.ats_agent.analyze(resume_text, required_keywords)
        agent_execution_log.append({
            "agent": self.ats_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 3: Skill Gap Agent ───────────────────────────────────────────
        t0 = time.time()
        skill_out = self.skill_gap_agent.analyze(res_out["extracted_skills"], required_skills)
        agent_execution_log.append({
            "agent": self.skill_gap_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 4: Career Roadmap Agent ─────────────────────────────────────
        t0 = time.time()
        road_out = self.career_agent.generate(skill_out["missing_skills"], skill_out["hiring_readiness_index"])
        agent_execution_log.append({
            "agent": self.career_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 5: Portfolio Agent (uses pre-fetched real data) ─────────────
        t0 = time.time()
        port_out = self.portfolio_agent.analyze(
            portfolio_url=portfolio_url,
            prefetched_data=portfolio_prefetched,
        )
        agent_execution_log.append({
            "agent": self.portfolio_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 6: GitHub Agent (uses pre-fetched real data) ────────────────
        t0 = time.time()
        git_out = self.github_agent.analyze(
            github_url=github_url,
            prefetched_data=github_prefetched,
        )
        agent_execution_log.append({
            "agent": self.github_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 7: Video Interview Agent (data-driven, no mock) ─────────────
        t0 = time.time()
        vid_out = self.video_agent.analyze(
            video_data_present=has_video,
            resume_text=resume_text,
            ats_keyword_density=ats_out["keyword_density"],
        )
        agent_execution_log.append({
            "agent": self.video_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 8: Candidate Ranking Agent (Multimodal Attention & Scoring) ─
        t0 = time.time()
        rank_out = self.ranking_agent.rank(
            resume_res=res_out,
            ats_res=ats_out,
            skill_res=skill_out,
            portfolio_res=port_out,
            github_res=git_out,
            video_res=vid_out,
            roadmap_res=road_out,
        )
        agent_execution_log.append({
            "agent": self.ranking_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 9: Explainability Agent ─────────────────────────────────────
        t0 = time.time()
        xai_out = self.xai_agent.generate_explanation(
            candidate_name=candidate_name,
            final_score=rank_out["s_final_calibrated"],
            score_components=rank_out["score_components"],
            missing_skills=skill_out["missing_skills"],
            ats_info=ats_out,
        )
        agent_execution_log.append({
            "agent": self.xai_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        # ── Step 10: Recruiter Intelligence Agent ────────────────────────────
        t0 = time.time()
        rec_out = self.recruiter_agent.audit_and_generate_prompts(
            candidate_name=candidate_name,
            missing_skills=skill_out["missing_skills"],
            extracted_skills=res_out["extracted_skills"],
            final_score=rank_out["s_final_calibrated"],
            job_title=job_title,
        )
        agent_execution_log.append({
            "agent": self.recruiter_agent.name,
            "latency_ms": round((time.time() - t0) * 1000, 2),
            "status": "SUCCESS",
        })

        total_latency = round((time.time() - start_time), 3)

        return {
            "candidate_name": candidate_name,
            "total_latency_seconds": total_latency,
            "agents_executed_count": len(agent_execution_log),
            "execution_dag_log": agent_execution_log,
            "summary_scores": {
                "final_candidate_score": rank_out["s_final_calibrated"],
                "final_percentage": rank_out["final_percentage"],
                "confidence_score": rank_out["confidence_score"],
                "hiring_readiness_index": skill_out["hiring_readiness_index"],
                "ats_passing_probability": ats_out["passing_probability"],
            },
            "resume_analysis": res_out,
            "ats_optimization": ats_out,
            "skill_gap_analysis": skill_out,
            "career_roadmap": road_out["roadmap"],
            "multimodal_analysis": {
                "portfolio": port_out,
                "github": git_out,
                "video": vid_out,
                "attention_weights": rank_out["attention_weights"],
            },
            "ranking_details": rank_out,
            "explainability": xai_out,
            "recruiter_intelligence": rec_out,
        }
