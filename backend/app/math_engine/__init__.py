"""
Math Engine Package for X-MMHF Framework.
Exposes scoring utilities for multimodal fusion and candidate ranking.
"""
from app.math_engine.scoring import (
    compute_ats_score,
    compute_skill_gap_score,
    compute_multimodal_fusion,
    compute_final_candidate_score,
    sigmoid,
    softmax,
)

__all__ = [
    "compute_ats_score",
    "compute_skill_gap_score",
    "compute_multimodal_fusion",
    "compute_final_candidate_score",
    "sigmoid",
    "softmax",
]
