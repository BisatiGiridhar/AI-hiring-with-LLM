/**
 * TypeScript interfaces for the X-MMHF application.
 * These match the backend Pydantic schemas exactly.
 */

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'recruiter' | 'candidate' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'recruiter' | 'candidate';
}

// ─── Agent Types ───────────────────────────────────────────────────────────

export interface AgentExecutionLog {
  agent: string;
  latency_ms: number;
  status: string;
}

export interface SummaryScores {
  final_candidate_score: number;
  final_percentage: number;
  confidence_score: number;
  hiring_readiness_index: number;
  ats_passing_probability: number;
}

export interface ATSOptimization {
  agent: string;
  status: string;
  s_ats: number;
  passing_probability: number;
  keyword_density: number;
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_compliance: number;
  parsing_penalty: number;
}

export interface MissingSkill {
  skill: string;
  weight: number;
  difficulty: number;
  estimated_hours: number;
}

export interface SkillGapAnalysis {
  agent: string;
  status: string;
  s_skill: number;
  hiring_readiness_index: number;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  total_learning_hours: number;
}

export interface CareerMilestone {
  milestone: string;
  skills: string[];
  resources?: string[];
}

export interface CareerRoadmap {
  agent: string;
  status: string;
  s_roadmap: number;
  roadmap: {
    day_30_milestones?: CareerMilestone[];
    day_60_milestones?: CareerMilestone[];
    day_90_milestones?: CareerMilestone[];
    live_recommended_courses?: Record<string, Array<{ platform: string; title: string; url: string }>>;
    milestones?: CareerMilestone[];
  };
}

export interface FeatureAttribution {
  [key: string]: number;
}

export interface CounterfactualInsight {
  condition: string;
  expected_score_change: string;
  new_verdict: string;
}

export interface BiasAudit {
  demographic_parity_status: string;
  gender_identifier_stripped: boolean;
  age_proxy_terms_detected: number;
  name_bias_check: string;
  algorithmic_fairness_score: number;
  ieee_bias_compliance: string;
}

export interface ExplainabilityResult {
  agent: string;
  status: string;
  gemini_enhanced: boolean;
  verdict: string;
  candidate_tier: string;
  final_score_percentage: number;
  natural_language_rationale: string;
  feature_attributions: FeatureAttribution;
  counterfactual_insights: CounterfactualInsight[];
  bias_audit: BiasAudit;
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  evaluation_criteria: string;
}

export interface RecruiterIntelligence {
  agent: string;
  status: string;
  gemini_enhanced: boolean;
  recommended_recruiter_action: string;
  action_urgency: string;
  generated_interview_questions: InterviewQuestion[];
  synthetic_bias_audit: BiasAudit;
  team_fit_notes: string;
}

export interface MultimodalAnalysis {
  portfolio: Record<string, unknown>;
  github: Record<string, unknown>;
  video: Record<string, unknown>;
  attention_weights: Record<string, number>;
}

export interface EvaluationResult {
  database_record_id: number;
  candidate_name: string;
  total_latency_seconds: number;
  agents_executed_count: number;
  execution_dag_log: AgentExecutionLog[];
  summary_scores: SummaryScores;
  resume_analysis: Record<string, unknown>;
  ats_optimization: ATSOptimization;
  skill_gap_analysis: SkillGapAnalysis;
  career_roadmap: CareerRoadmap;
  multimodal_analysis: MultimodalAnalysis;
  ranking_details: Record<string, unknown>;
  explainability: ExplainabilityResult;
  recruiter_intelligence: RecruiterIntelligence;
}

// ─── Job Posting Types ─────────────────────────────────────────────────────

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  required_keywords: string[];
  required_skills?: Record<string, { weight: number; difficulty: number }>;
  department?: string;
  experience_level?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at?: string;
}

export interface JobPostingCreate {
  title: string;
  description: string;
  required_keywords: string[];
  department?: string;
  experience_level?: string;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────

export interface DashboardStats {
  total_evaluations: number;
  average_score: number;
  top_candidates: Array<{
    name: string;
    score: number;
    verdict: string;
    date: string;
  }>;
}

export interface EvaluationSummary {
  id: number;
  candidate_name: string;
  job_title: string;
  final_score: number;
  ats_score: number;
  skill_gap_score: number;
  multimodal_score: number;
  confidence_score: number;
  verdict: string;
  github_url?: string;
  portfolio_url?: string;
  resume_file_name?: string;
  created_at: string;
}

export interface PaginatedEvaluations {
  total: number;
  page: number;
  page_size: number;
  items: EvaluationSummary[];
}

// ─── Admin Types ───────────────────────────────────────────────────────────

export interface SystemStats {
  total_users: number;
  total_evaluations: number;
  total_job_postings: number;
  active_users: number;
  average_final_score: number | null;
  top_verdict_counts: Record<string, number>;
  recent_activity_count: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource?: string;
  ip_address?: string;
  status_code?: number;
  details?: Record<string, unknown>;
  created_at: string;
}

// ─── API Error Type ────────────────────────────────────────────────────────

export interface APIError {
  detail: string;
  status?: number;
}
