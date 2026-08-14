import numpy as np

def sigmoid(z: float) -> float:
    """Standard Sigmoid activation function."""
    return float(1.0 / (1.0 + np.exp(-z)))

def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable Softmax activation function."""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def compute_ats_score(
    required_keywords: list[str],
    resume_text: str,
    formatting_compliance: float = 0.9,
    parsing_penalty: float = 0.05,
    beta: list[float] = None
) -> dict:
    """
    Computes ATS passing probability and compliance score.
    Equation: S_ATS = Sigmoid(beta_0 + beta_1 * K_dens + beta_2 * F_comp - beta_3 * P_pen)
    """
    if beta is None:
        beta = [-0.5, 3.5, 2.0, 3.0]  # Intercept, K_dens weight, F_comp weight, P_pen weight

    resume_lower = resume_text.lower()
    keyword_freqs = []
    missing_keywords = []

    for kw in required_keywords:
        cnt = resume_lower.count(kw.lower())
        if cnt > 0:
            # capped ratio assuming optimal frequency is 2
            keyword_freqs.append(min(1.0, cnt / 2.0))
        else:
            keyword_freqs.append(0.0)
            missing_keywords.append(kw)

    k_dens = float(np.mean(keyword_freqs)) if keyword_freqs else 0.0
    z = beta[0] + beta[1] * k_dens + beta[2] * formatting_compliance - beta[3] * parsing_penalty
    s_ats = sigmoid(z)

    return {
        "s_ats": round(s_ats, 4),
        "passing_probability": round(s_ats * 100, 2),
        "keyword_density": round(k_dens, 4),
        "formatting_compliance": round(formatting_compliance, 4),
        "parsing_penalty": round(parsing_penalty, 4),
        "missing_keywords": missing_keywords,
        "matched_keywords_count": len(required_keywords) - len(missing_keywords),
        "total_required_keywords": len(required_keywords)
    }

def compute_skill_gap_score(
    required_skills: dict[str, dict],
    candidate_skills: list[str],
    eta: float = 15.0,
    lambda_transfer: float = 0.2
) -> dict:
    """
    Formulates skill gap optimization & time-to-competency.
    required_skills: {"Python": {"weight": 1.0, "difficulty": 2}, ...}
    """
    cand_skills_lower = [s.lower() for s in candidate_skills]
    missing_skills = []
    total_weighted_diff = 0.0
    max_possible_diff = 0.0

    for skill, meta in required_skills.items():
        w = meta.get("weight", 1.0)
        d = meta.get("difficulty", 3)
        max_possible_diff += w * 5.0
        
        if skill.lower() not in cand_skills_lower:
            missing_skills.append({
                "skill": skill,
                "weight": w,
                "difficulty": d,
                "est_hours": round(eta * d * (1.0 - lambda_transfer), 1)
            })
            total_weighted_diff += w * d

    s_skill = max(0.0, 1.0 - (total_weighted_diff / max_possible_diff if max_possible_diff > 0 else 0.0))
    t_learning_total = sum(item["est_hours"] for item in missing_skills)

    # Hiring readiness index: non-linear function of skill gap
    readiness_index = max(0.0, min(100.0, (s_skill ** 0.8) * 100))

    return {
        "s_skill": round(s_skill, 4),
        "hiring_readiness_index": round(readiness_index, 2),
        "missing_skills": missing_skills,
        "total_learning_hours": round(t_learning_total, 1),
        "estimated_learning_weeks": round(t_learning_total / 15.0, 1)
    }

def compute_multimodal_fusion(
    res_vec: np.ndarray,
    git_vec: np.ndarray,
    port_vec: np.ndarray,
    vid_vec: np.ndarray,
    d_k: int = 64
) -> dict:
    """
    Computes cross-attentional latent fusion across modalities:
    Q = W_Q * h_res, K = W_K * [h_git, h_port, h_vid], V = W_V * [h_git, h_port, h_vid]
    """
    # Keys/Values matrix (3, d_k)
    K = np.vstack([git_vec, port_vec, vid_vec])
    Q = res_vec.reshape(1, -1)

    # Scaled Dot-Product Attention
    scores = np.dot(Q, K.T) / np.sqrt(d_k)
    att_weights = softmax(scores).flatten()

    # Fused representation
    fused_vec = res_vec + att_weights[0] * git_vec + att_weights[1] * port_vec + att_weights[2] * vid_vec
    s_multimodal = sigmoid(float(np.mean(fused_vec)))

    return {
        "s_multimodal": round(s_multimodal, 4),
        "attention_weights": {
            "github_attention": round(float(att_weights[0]), 4),
            "portfolio_attention": round(float(att_weights[1]), 4),
            "video_attention": round(float(att_weights[2]), 4),
        },
        "latent_fusion_norm": round(float(np.linalg.norm(fused_vec)), 4)
    }

def compute_final_candidate_score(
    s_ats: float,
    s_skill: float,
    s_multimodal: float,
    s_roadmap: float,
    s_video: float,
    weights: dict = None,
    present_modalities_count: int = 5,
    total_modalities_count: int = 5
) -> dict:
    """
    Computes final score with variance-based confidence scaling.
    """
    if weights is None:
        weights = {"ats": 0.20, "skill": 0.30, "multimodal": 0.25, "roadmap": 0.10, "video": 0.15}

    scores_list = [s_ats, s_skill, s_multimodal, s_roadmap, s_video]
    
    # Weighted linear combination
    s_raw = (
        weights["ats"] * s_ats +
        weights["skill"] * s_skill +
        weights["multimodal"] * s_multimodal +
        weights["roadmap"] * s_roadmap +
        weights["video"] * s_video
    )

    # Variance calculation for confidence score
    score_variance = float(np.var(scores_list))
    missing_ratio = (total_modalities_count - present_modalities_count) / float(total_modalities_count)
    
    c_score = max(0.5, 1.0 - (np.sqrt(score_variance) * 0.3 + missing_ratio * 0.4))
    s_calibrated = s_raw * c_score

    return {
        "s_final_raw": round(s_raw, 4),
        "s_final_calibrated": round(s_calibrated, 4),
        "final_percentage": round(s_calibrated * 100, 2),
        "confidence_score": round(c_score, 4),
        "variance": round(score_variance, 4),
        "score_components": {
            "ats_score": round(s_ats, 4),
            "skill_gap_score": round(s_skill, 4),
            "multimodal_score": round(s_multimodal, 4),
            "roadmap_score": round(s_roadmap, 4),
            "video_score": round(s_video, 4)
        }
    }
