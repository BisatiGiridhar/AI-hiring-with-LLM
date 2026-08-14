class CareerRoadmapAgent:
    """
    Career Roadmap Agent (A_Road): Generates milestone-driven 30-Day, 60-Day,
    and 90-Day adaptive learning plans based on identified skill gaps.
    """
    def __init__(self):
        self.name = "Career Roadmap Agent"

    def generate(self, missing_skills: list[dict], candidate_readiness: float) -> dict:
        phase_30 = []
        phase_60 = []
        phase_90 = []
        
        # Sort missing skills by difficulty
        sorted_skills = sorted(missing_skills, key=lambda x: x["difficulty"])
        
        for i, item in enumerate(sorted_skills):
            skill = item["skill"]
            diff = item["difficulty"]
            hours = item["est_hours"]
            
            if diff <= 2 or i == 0:
                phase_30.append({
                    "skill": skill,
                    "target": f"Master foundational concepts and build mini-project in {skill}",
                    "est_hours": hours,
                    "milestone": f"Week {i*2 + 1}-{i*2 + 2}: Complete hands-on tutorial & basic repo."
                })
            elif diff == 3 or (diff <= 4 and len(phase_60) < 2):
                phase_60.append({
                    "skill": skill,
                    "target": f"Integrate {skill} into end-to-end full-stack workflow",
                    "est_hours": hours,
                    "milestone": f"Week 5-7: Deploy integration microservice utilizing {skill}."
                })
            else:
                phase_90.append({
                    "skill": skill,
                    "target": f"Advanced optimization, scaling & architectural mastery in {skill}",
                    "est_hours": hours,
                    "milestone": f"Week 9-12: System design review and production deployment."
                })
                
        # Default milestones if no missing skills
        if not missing_skills:
            phase_30.append({"skill": "Leadership & Architecture", "target": "System design deep dive", "est_hours": 20, "milestone": "Publish technical architecture post."})
            phase_60.append({"skill": "Open Source", "target": "Contribute to core repository", "est_hours": 30, "milestone": "Merge 2+ PRs in major repo."})
            phase_90.append({"skill": "Domain Expertise", "target": "AI Hiring System patent/paper", "est_hours": 40, "milestone": "Submit paper draft."})

        # Calculate progress simulation index
        roadmap_completion_score = min(1.0, 0.70 + (candidate_readiness / 100.0) * 0.30)

        return {
            "agent": self.name,
            "status": "COMPLETED",
            "s_roadmap": round(roadmap_completion_score, 4),
            "roadmap": {
                "day_30_phase": {
                    "focus": "Foundational Skill Acquisition & Quick Wins",
                    "tasks": phase_30
                },
                "day_60_phase": {
                    "focus": "System Integration & Practical Application",
                    "tasks": phase_60 if phase_60 else phase_30
                },
                "day_90_phase": {
                    "focus": "Advanced Mastery, Production Readiness & Portfolio Proof",
                    "tasks": phase_90 if phase_90 else phase_30
                }
            }
        }
