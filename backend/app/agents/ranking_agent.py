import numpy as np
from app.math_engine.scoring import compute_multimodal_fusion, compute_final_candidate_score

class CandidateRankingAgent:
    """
    Candidate Ranking Agent (A_Rank): Executes adaptive multimodal cross-attention fusion
    and ranks candidates using multi-criteria decision analysis (MCDM).
    """
    def __init__(self):
        self.name = "Candidate Ranking Agent"

    @staticmethod
    def _to_ndarray(vec, default_val: float = 0.60) -> np.ndarray:
        """Safely convert list, ndarray, or None to a 64-dim numpy float array."""
        if vec is None:
            return np.full(64, default_val, dtype=float)
        if isinstance(vec, list):
            arr = np.array(vec, dtype=float)
        else:
            arr = np.asarray(vec, dtype=float)
        if arr.shape == () or arr.size == 0:
            return np.full(64, default_val, dtype=float)
        if arr.size != 64:
            # Resize to 64 dims: truncate or pad
            arr = np.resize(arr, 64)
        return arr

    def rank(
        self,
        resume_res: dict,
        ats_res: dict,
        skill_res: dict,
        portfolio_res: dict,
        github_res: dict,
        video_res: dict,
        roadmap_res: dict,
    ) -> dict:
        # Safely extract and coerce all latent vectors to numpy arrays
        res_vec  = self._to_ndarray(resume_res.get("latent_vector"),  0.60)
        git_vec  = self._to_ndarray(github_res.get("latent_vector"),  0.65)
        port_vec = self._to_ndarray(portfolio_res.get("latent_vector"), 0.60)
        vid_vec  = self._to_ndarray(video_res.get("latent_vector"),   0.65)

        fusion_result = compute_multimodal_fusion(
            res_vec=res_vec,
            git_vec=git_vec,
            port_vec=port_vec,
            vid_vec=vid_vec,
        )

        # Count modalities actually completed
        present_count = 2  # resume + skills always present
        if portfolio_res.get("status") in ("COMPLETED", "HEURISTIC", "URL_UNREACHABLE", "FETCH_ERROR"):
            present_count += 1
        if github_res.get("status") in ("COMPLETED", "API_NOTICE"):
            present_count += 1
        if video_res.get("status") == "COMPLETED":
            present_count += 1

        final_scoring = compute_final_candidate_score(
            s_ats=ats_res["s_ats"],
            s_skill=skill_res["s_skill"],
            s_multimodal=fusion_result["s_multimodal"],
            s_roadmap=roadmap_res["s_roadmap"],
            s_video=video_res["s_video"],
            present_modalities_count=present_count,
        )

        return {
            "agent": self.name,
            "status": "COMPLETED",
            **fusion_result,
            **final_scoring,
        }
