"""
Gemini AI service for LLM-enhanced XAI explanations and recruiter intelligence.
Gracefully falls back to rule-based explanations if API key is not configured.
Uses google-generativeai (stable) with fallback to google.genai (new).
"""
import os
from typing import Optional

# Import Gemini using the current google.genai package
GEMINI_AVAILABLE = False
try:
    import google.genai as genai
    from google.genai import types as genai_types
    GEMINI_AVAILABLE = True
except ImportError:
    # If google.genai is not installed, also try the legacy package
    try:
        import google.generativeai as genai  # type: ignore[no-redef]
        GEMINI_AVAILABLE = True
    except ImportError:
        pass


class GeminiService:
    """
    Wraps the Google Gemini API for natural language XAI generation.
    Falls back to deterministic rule-based explanations if API key is absent.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = None
        self._use_new_sdk = False
        if GEMINI_AVAILABLE and self.api_key:
            try:
                # Try the new google.genai SDK first
                if hasattr(genai, 'Client'):
                    self._client = genai.Client(api_key=self.api_key)
                    self.model = "gemini-1.5-flash"
                    self._use_new_sdk = True
                else:
                    # Legacy google.generativeai SDK
                    genai.configure(api_key=self.api_key)  # type: ignore[attr-defined]
                    self.model = genai.GenerativeModel("gemini-1.5-flash")  # type: ignore[attr-defined]
                    self._use_new_sdk = False
            except Exception:
                self.model = None

    def is_available(self) -> bool:
        return self.model is not None

    def generate_xai_narrative(
        self,
        candidate_name: str,
        final_score: float,
        score_components: dict,
        missing_skills: list,
        verdict: str,
        ats_info: dict,
    ) -> str:
        """
        Generate a natural language explanation of the evaluation decision.
        Uses Gemini if available, otherwise returns a structured rule-based explanation.
        """
        if self.is_available():
            return self._gemini_narrative(
                candidate_name, final_score, score_components,
                missing_skills, verdict, ats_info
            )
        return self._rule_based_narrative(
            candidate_name, final_score, score_components,
            missing_skills, verdict, ats_info
        )

    def _gemini_narrative(self, candidate_name, final_score, score_components, missing_skills, verdict, ats_info) -> str:
        """Call Gemini API to generate a recruiter-facing explanation."""
        skill_list = ", ".join([s.get("skill", s) if isinstance(s, dict) else str(s) for s in missing_skills[:5]])
        prompt = f"""You are an expert AI hiring analyst for the X-MMHF framework.
Generate a concise, professional recruiter report (150 words max) for:

Candidate: {candidate_name}
Final Score: {final_score:.1%}
Verdict: {verdict}
ATS Passing Probability: {ats_info.get('passing_probability', 0):.1%}
Score Components: {score_components}
Missing Key Skills: {skill_list if skill_list else 'None identified'}

Write in second person addressing the recruiter. Be factual, specific, and actionable.
Do NOT use placeholders, generic phrases, or dummy data. Base everything on the numbers above."""
        try:
            if self._use_new_sdk:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
                return response.text.strip()
            else:
                response = self.model.generate_content(prompt)  # type: ignore[union-attr]
                return response.text.strip()
        except Exception:
            return self._rule_based_narrative(candidate_name, final_score, score_components, missing_skills, verdict, ats_info)

    def generate_interview_questions(
        self,
        candidate_name: str,
        extracted_skills: list,
        missing_skills: list,
        job_title: str,
    ) -> list[str]:
        """Generate targeted interview questions using Gemini or rule-based fallback."""
        if self.is_available():
            return self._gemini_interview_questions(candidate_name, extracted_skills, missing_skills, job_title)
        return self._rule_based_questions(extracted_skills, missing_skills, job_title)

    def _gemini_interview_questions(self, candidate_name, extracted_skills, missing_skills, job_title) -> list[str]:
        skill_str = ", ".join(extracted_skills[:8])
        gap_str = ", ".join([s.get("skill", s) if isinstance(s, dict) else str(s) for s in missing_skills[:4]])
        prompt = f"""Generate 5 targeted technical interview questions for {candidate_name} applying for {job_title}.
Their confirmed skills: {skill_str}
Their skill gaps: {gap_str}
Questions should probe both depth in confirmed skills and assess potential to learn gaps.
Return ONLY the questions as a numbered list. No explanations."""
        try:
            if self._use_new_sdk:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
            else:
                response = self.model.generate_content(prompt)  # type: ignore[union-attr]
            lines = [line.strip() for line in response.text.strip().split("\n") if line.strip()]
            questions = [line.lstrip("0123456789.-) ") for line in lines if len(line) > 20]
            return questions[:5]
        except Exception:
            return self._rule_based_questions(extracted_skills, missing_skills, job_title)

    @staticmethod
    def _rule_based_narrative(
        candidate_name, final_score, score_components, missing_skills, verdict, ats_info
    ) -> str:
        pct = final_score * 100
        ats_pct = ats_info.get("passing_probability", 0) * 100
        gaps = [s.get("skill", s) if isinstance(s, dict) else str(s) for s in missing_skills[:3]]
        gap_str = ", ".join(gaps) if gaps else "no critical gaps identified"
        ats_component = score_components.get("s_ats", score_components.get("ats", 0))
        skill_component = score_components.get("s_skill", score_components.get("skill", 0))

        level = "strong" if pct >= 75 else ("moderate" if pct >= 55 else "weak")
        return (
            f"{candidate_name} achieved a composite score of {pct:.1f}% — a {level} candidacy signal. "
            f"ATS compatibility stands at {ats_pct:.1f}%, meaning the resume "
            f"{'is well-optimized' if ats_pct >= 70 else 'requires ATS formatting improvements'}. "
            f"Skill alignment score: {float(skill_component)*100:.1f}%. "
            f"Primary skill gaps: {gap_str}. "
            f"Overall verdict: {verdict}."
        )

    @staticmethod
    def _rule_based_questions(extracted_skills, missing_skills, job_title) -> list[str]:
        questions = []
        if extracted_skills:
            questions.append(f"Can you walk us through a production system you built using {extracted_skills[0]}?")
        if len(extracted_skills) > 1:
            questions.append(f"How have you used {extracted_skills[1]} to solve a complex technical challenge?")
        if missing_skills:
            gap = missing_skills[0].get("skill", missing_skills[0]) if isinstance(missing_skills[0], dict) else str(missing_skills[0])
            questions.append(f"We require strong {gap} skills. What's your current familiarity and how would you close that gap?")
        questions.append(f"Describe your most impactful project relevant to the {job_title} role.")
        questions.append("How do you ensure code quality and maintainability in collaborative engineering environments?")
        return questions[:5]


# Singleton instance
gemini_service = GeminiService()
