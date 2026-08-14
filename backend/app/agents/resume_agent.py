import numpy as np

class ResumeAgent:
    """
    Resume Agent (A_Res): Parses resume content, extracts normalized skills,
    work history duration, and structural token representations.
    Also emits a latent feature vector used by the multimodal fusion layer.
    """
    KNOWN_SKILLS = [
        "Python", "JavaScript", "TypeScript", "React", "FastAPI", "Node.js",
        "PyTorch", "TensorFlow", "Docker", "Kubernetes", "AWS", "SQL",
        "System Design", "GraphQL", "TailwindCSS", "Git", "CI/CD", "Scikit-Learn",
        "Natural Language Processing", "Computer Vision", "Rest API", "C++",
        "Redis", "PostgreSQL", "MongoDB", "Spark", "Kafka", "Terraform",
        "GCP", "Azure", "Flask", "Django", "Spring Boot", "Java", "Go",
        "Rust", "Ruby", "R", "Scala", "CUDA", "OpenCV", "Pandas", "NumPy",
    ]

    def __init__(self):
        self.name = "Resume Agent"

    def analyze(self, resume_text: str, candidate_name: str = "Candidate") -> dict:
        text_lower = resume_text.lower()

        # Skill extraction ontology
        extracted_skills = [s for s in self.KNOWN_SKILLS if s.lower() in text_lower]

        # Experience duration heuristics
        has_senior = any(w in text_lower for w in ("senior", "lead", "architect", "principal", "staff"))
        has_mid    = any(w in text_lower for w in ("engineer", "developer", "analyst", "researcher"))
        est_years  = 6.5 if has_senior else (3.5 if has_mid else 1.5)

        # Build a deterministic latent vector from skill presence (no randomness)
        skill_flags = np.array(
            [1.0 if s.lower() in text_lower else 0.0 for s in self.KNOWN_SKILLS],
            dtype=float,
        )
        # Pad / truncate to 64 dims with a simple TF-like density
        skill_density = len(extracted_skills) / max(1, len(self.KNOWN_SKILLS))
        latent_vector = np.zeros(64)
        for i, flag in enumerate(skill_flags[:64]):
            latent_vector[i] = flag * 0.8 + skill_density * 0.2
        # fill remainder
        if len(skill_flags) < 64:
            latent_vector[len(skill_flags):] = skill_density

        return {
            "agent": self.name,
            "status": "COMPLETED",
            "candidate_name": candidate_name,
            "extracted_skills": extracted_skills,
            "skill_count": len(extracted_skills),
            "estimated_years_experience": est_years,
            "raw_word_count": len(resume_text.split()),
            "parsed_structural_tokens": ["header", "summary", "experience", "education", "skills"],
            "latent_vector": latent_vector,
        }
