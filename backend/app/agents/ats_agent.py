from app.math_engine.scoring import compute_ats_score

class ATSAgent:
    """
    ATS Optimization Agent (A_ATS): Evaluates parser compliance, typography penalties,
    keyword density, and predicts recruiter visibility & passing probability.
    """
    def __init__(self):
        self.name = "ATS Agent"

    def analyze(self, resume_text: str, required_keywords: list[str]) -> dict:
        text_lower = resume_text.lower()
        
        # Check formatting penalties (e.g. non-standard symbols, tables, long lines)
        penalty = 0.02
        if "table" in text_lower or "|" in resume_text:
            penalty += 0.03
        if len(resume_text.splitlines()) < 10:
            penalty += 0.05
            
        compliance = max(0.65, 0.98 - penalty)
        
        result = compute_ats_score(
            required_keywords=required_keywords,
            resume_text=resume_text,
            formatting_compliance=compliance,
            parsing_penalty=penalty
        )
        
        # Format optimization suggestions
        suggestions = []
        if result["missing_keywords"]:
            suggestions.append(f"Add missing core keywords: {', '.join(result['missing_keywords'][:4])}")
        if result["keyword_density"] < 0.6:
            suggestions.append("Increase keyword frequency in experience section to optimize TF-IDF index.")
        if penalty > 0.04:
            suggestions.append("Simplify document layout; replace tables or ASCII columns with clean markdown/PDF text.")

        return {
            "agent": self.name,
            "status": "COMPLETED",
            **result,
            "optimization_suggestions": suggestions
        }
