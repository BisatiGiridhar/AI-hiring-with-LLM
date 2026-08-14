import numpy as np

class PortfolioAgent:
    """
    Portfolio Agent (A_Port): Inspects visual UI/UX project links, architecture diagrams,
    and deployed web application quality metrics.
    Accepts pre-fetched data from the real PortfolioScraperService (async) so the
    orchestrator can stay synchronous.
    """
    def __init__(self):
        self.name = "Portfolio Agent"

    def analyze(self, portfolio_url: str = None, prefetched_data: dict = None) -> dict:
        """
        If prefetched_data is provided (from the async PortfolioScraperService), use it directly.
        Otherwise apply a simple URL-heuristic or return neutral defaults.
        """
        # --- Case 1: real data already fetched by the router ---
        if prefetched_data and prefetched_data.get("status") in ("COMPLETED", "URL_UNREACHABLE", "FETCH_ERROR"):
            raw = prefetched_data
            lv = raw.get("latent_vector", [0.60] * 64)
            if isinstance(lv, list):
                lv = np.array(lv, dtype=float)
            return {
                "agent": self.name,
                "status": raw.get("status", "COMPLETED"),
                "portfolio_url": portfolio_url or raw.get("portfolio_url", ""),
                "s_portfolio": raw.get("s_portfolio", 0.60),
                "visual_design_score": raw.get("visual_design_score", 0.65),
                "deployed_apps_count": raw.get("external_project_links_count",
                                               raw.get("deployed_apps_count", 1)),
                "detected_technologies": raw.get("detected_technologies", []),
                "title": raw.get("title", ""),
                "latent_vector": lv,
            }

        # --- Case 2: no URL provided ---
        if not portfolio_url:
            return {
                "agent": self.name,
                "status": "NOT_PROVIDED",
                "s_portfolio": 0.50,
                "visual_design_score": 0.50,
                "deployed_apps_count": 0,
                "latent_vector": np.full(64, 0.50),
            }

        # --- Case 3: URL present but no pre-fetched data; simple heuristic ---
        url_lower = portfolio_url.lower()
        has_custom_domain = not any(
            d in url_lower for d in ("github.io", "vercel.app", "netlify.app")
        )
        visual_score = 0.88 if has_custom_domain else 0.82
        deployed_apps = 3 if "github.io" in url_lower or "vercel" in url_lower else 4
        s_port = round(0.40 * visual_score + 0.60 * (min(5, deployed_apps) / 5.0), 4)
        latent_vector = np.random.normal(loc=s_port, scale=0.05, size=64)

        return {
            "agent": self.name,
            "status": "HEURISTIC",
            "portfolio_url": portfolio_url,
            "s_portfolio": s_port,
            "visual_design_score": round(visual_score, 2),
            "custom_domain_verified": has_custom_domain,
            "deployed_apps_count": deployed_apps,
            "latent_vector": latent_vector,
        }
