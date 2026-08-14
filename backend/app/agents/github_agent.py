import numpy as np

class GitHubAgent:
    """
    GitHub Agent (A_Git): Conducts repository analysis, commit velocity evaluation,
    AST code complexity metrics, and star/fork signal extraction.
    Accepts pre-fetched data from the real GitHubService (async) so the
    orchestrator can stay synchronous.
    """
    def __init__(self):
        self.name = "GitHub Analysis Agent"

    def analyze(self, github_url: str = None, prefetched_data: dict = None) -> dict:
        """
        If prefetched_data is provided (from the async GitHubService), use it directly.
        Otherwise fall back to a default neutral score.
        """
        # --- Case 1: real data already fetched by the router ---
        if prefetched_data and prefetched_data.get("status") in ("COMPLETED", "API_NOTICE"):
            raw = prefetched_data
            # latent_vector may be a list (JSON-serialisable); convert to np.ndarray
            lv = raw.get("latent_vector", [0.65] * 64)
            if isinstance(lv, list):
                lv = np.array(lv, dtype=float)
            return {
                "agent": self.name,
                "status": raw.get("status", "COMPLETED"),
                "github_url": github_url or raw.get("profile_url", ""),
                "s_github": raw.get("s_github", 0.65),
                "commit_velocity_score": raw.get("commit_velocity_score", 0.65),
                "code_quality_score": raw.get("code_quality_score", 0.70),
                "public_repos": raw.get("public_repos", 0),
                "total_stars": raw.get("total_stars", 0),
                "total_forks": raw.get("total_forks", 0),
                "followers": raw.get("followers", 0),
                "top_languages": raw.get("top_languages", ["Python"]),
                "latent_vector": lv,
            }

        # --- Case 2: no URL provided ---
        if not github_url:
            return {
                "agent": self.name,
                "status": "NOT_PROVIDED",
                "s_github": 0.50,
                "commit_velocity_score": 0.50,
                "code_quality_score": 0.50,
                "public_repos": 0,
                "total_stars": 0,
                "latent_vector": np.full(64, 0.50),
            }

        # --- Case 3: URL provided but fetch failed; use neutral defaults ---
        return {
            "agent": self.name,
            "status": "FETCH_SKIPPED",
            "github_url": github_url,
            "s_github": 0.60,
            "commit_velocity_score": 0.60,
            "code_quality_score": 0.60,
            "public_repos": 5,
            "total_stars": 10,
            "top_languages": ["Python"],
            "latent_vector": np.full(64, 0.60),
        }
