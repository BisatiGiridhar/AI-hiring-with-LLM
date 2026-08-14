import httpx
from bs4 import BeautifulSoup
import re
import numpy as np

class PortfolioScraperService:
    """
    Live Web Scraper fetching metadata, headings, technology signatures,
    and deployed application links from candidate portfolio URLs.
    """

    @classmethod
    async def scrape_portfolio(cls, portfolio_url: str) -> dict:
        if not portfolio_url or not portfolio_url.startswith("http"):
            return {
                "status": "NOT_PROVIDED",
                "s_portfolio": 0.50,
                "visual_design_score": 0.50,
                "deployed_apps_count": 0,
                "latent_vector": np.full(64, 0.50).tolist()
            }

        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                resp = await client.get(portfolio_url)
                
            if resp.status_code != 200:
                return {
                    "status": "URL_UNREACHABLE",
                    "portfolio_url": portfolio_url,
                    "s_portfolio": 0.55,
                    "visual_design_score": 0.60,
                    "deployed_apps_count": 1,
                    "latent_vector": np.full(64, 0.55).tolist()
                }

            html = resp.text
            soup = BeautifulSoup(html, "html.parser")

            # Extract Title & Meta Description
            title = soup.title.string.strip() if soup.title and soup.title.string else "Candidate Portfolio"
            meta_desc = ""
            desc_tag = soup.find("meta", attrs={"name": "description"})
            if desc_tag and desc_tag.get("content"):
                meta_desc = desc_tag.get("content").strip()

            # Tech stack signature detection in HTML source
            known_techs = ["react", "next.js", "vue", "tailwind", "fastapi", "python", "pytorch", "node", "docker", "aws"]
            html_lower = html.lower()
            detected_techs = [t.capitalize() for t in known_techs if t in html_lower]

            # Count external links (deployed applications)
            links = soup.find_all("a", href=True)
            external_links = [l['href'] for l in links if l['href'].startswith("http") and portfolio_url not in l['href']]

            visual_score = 0.90 if len(detected_techs) > 3 else 0.75
            s_port = round(0.50 * visual_score + 0.50 * min(1.0, len(external_links) / 5.0), 4)

            return {
                "status": "COMPLETED",
                "portfolio_url": portfolio_url,
                "title": title,
                "meta_description": meta_desc,
                "detected_technologies": detected_techs,
                "external_project_links_count": len(external_links),
                "s_portfolio": max(0.60, s_port),
                "visual_design_score": visual_score,
                "latent_vector": np.random.normal(loc=s_port, scale=0.03, size=64).tolist()
            }
        except Exception as e:
            return {
                "status": "FETCH_ERROR",
                "portfolio_url": portfolio_url,
                "error": str(e),
                "s_portfolio": 0.60,
                "visual_design_score": 0.65,
                "deployed_apps_count": 1,
                "latent_vector": np.full(64, 0.60).tolist()
            }
