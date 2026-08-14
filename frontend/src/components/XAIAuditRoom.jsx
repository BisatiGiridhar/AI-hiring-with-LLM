import React from 'react';
import { UserCheck, ShieldCheck, HelpCircle, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function XAIAuditRoom({ xaiData, recruiterData }) {
  const xai = xaiData || {
    verdict: "STRONG RECOMMENDATION FOR INTERVIEW",
    natural_language_rationale: "Candidate exhibits high multimodal alignment (Match Score: 89.2%). Core strengths include high ATS keyword coverage (91.4%) and exceptional code/portfolio evidence.",
    feature_attributions: {
      "ATS Compliance & Keywords": 34.2,
      "Skill Coverage & Expertise": 38.5,
      "Multimodal (GitHub/Portfolio)": 27.3
    },
    counterfactual_insights: [
      "If candidate acquires 'Kubernetes', match score increases by +7.5%, upgrading recommendation to Top Tier.",
      "Adding 'AWS' to resume increases ATS visibility by +4.2%."
    ]
  };

  const recruiter = recruiterData || {
    synthetic_bias_audit: {
      demographic_parity_status: "VERIFIED_NEUTRAL",
      gender_identifier_stripped: true,
      age_proxy_terms_detected: 0,
      algorithmic_fairness_score: 0.96
    },
    generated_interview_questions: [
      { category: "Technical Mastery", question: "Can you describe a challenging architecture problem you solved using Python & PyTorch in production?" },
      { category: "Skill Gap Probe", question: "We noticed you haven't listed extensive experience in Kubernetes. How would you approach getting up to speed within your first 30 days?" },
      { category: "System Architecture", question: "How do you ensure high availability, fault tolerance, and low latency when designing scalable microservices?" }
    ],
    recommended_recruiter_action: "Proceed with Technical Stage 1 Interview"
  };

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-rose">Explainability & Recruiter Intelligence</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px' }}>
            Explainable AI (XAI) & Synthetic Bias Audit Room
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Provides SHAP feature attribution, contrastive counterfactual explanations, and demographic fairness verification to ensure recruiter trust.
          </p>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(9, 13, 22, 0.6)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glow)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fairness Audit Index</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)' }}>
            {Math.round(recruiter.synthetic_bias_audit.algorithmic_fairness_score * 100)}%
          </div>
        </div>
      </div>

      {/* Decision Justification Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '6px solid var(--rose)' }}>
        <span className="badge badge-rose">{xai.verdict}</span>
        <p style={{ fontSize: '1.05rem', color: '#fff', marginTop: '10px', lineHeight: 1.6 }}>
          "{xai.natural_language_rationale}"
        </p>
      </div>

      {/* Feature Attribution & Counterfactuals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* SHAP Attributions */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Feature Attribution Breakdown (SHAP Values)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(xai.feature_attributions).map(([feat, val], idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>{feat}</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{val}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${val}%`, height: '100%', background: idx === 0 ? 'var(--cyan)' : idx === 1 ? 'var(--emerald)' : 'var(--purple)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counterfactual Insights */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Contrastive Counterfactual Hints ("What If?")
          </h3>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0, listStyle: 'none' }}>
            {xai.counterfactual_insights.map((cf, idx) => (
              <li key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', borderLeft: '4px solid var(--cyan)', color: 'var(--text-muted)' }}>
                {cf}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Recruiter Prompts & Bias Audit */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
          Tailored Interview Questions & Bias Verification
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {recruiter.generated_interview_questions.map((q, idx) => (
            <div key={idx} style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{q.category}</span>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '8px', fontWeight: 500 }}>
                "{q.question}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
