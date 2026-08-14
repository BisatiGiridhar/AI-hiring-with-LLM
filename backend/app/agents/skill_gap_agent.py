from app.math_engine.scoring import compute_skill_gap_score

class SkillGapAgent:
    """
    Skill Gap Agent (A_Skill): Formulates semantic skill matching as an optimization problem,
    projecting missing skills, acquisition difficulty, and time-to-competency.
    """
    def __init__(self):
        self.name = "Skill Gap Agent"

    def analyze(self, extracted_skills: list[str], target_job_skills: dict[str, dict]) -> dict:
        result = compute_skill_gap_score(
            required_skills=target_job_skills,
            candidate_skills=extracted_skills
        )
        
        # Certification recommendations
        cert_map = {
            "AWS": "AWS Certified Solutions Architect",
            "Docker": "Certified Kubernetes Administrator (CKA)",
            "PyTorch": "Deep Learning Specialization (Coursera)",
            "System Design": "Grokking the System Design Interview",
            "React": "Meta Front-End Developer Professional Certificate",
            "FastAPI": "Production REST API Design in Python"
        }
        
        recommended_certs = []
        for item in result["missing_skills"]:
            skill_name = item["skill"]
            if skill_name in cert_map:
                recommended_certs.append({
                    "skill": skill_name,
                    "certification": cert_map[skill_name]
                })

        return {
            "agent": self.name,
            "status": "COMPLETED",
            **result,
            "recommended_certifications": recommended_certs
        }
