import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, ArrowRight, Sparkles } from 'lucide-react';

export default function ATSOptimizer({ atsData }) {
  const data = atsData || {
    passing_probability: 88.5,
    keyword_density: 0.82,
    formatting_compliance: 0.95,
    parsing_penalty: 0.02,
    missing_keywords: ["Kubernetes", "AWS", "CI/CD"],
    optimization_suggestions: [
      "Add missing core keywords: Kubernetes, AWS, CI/CD",
      "Increase keyword frequency in experience section to optimize TF-IDF index.",
      "Simplify document layout; replace tables or ASCII columns with clean text."
    ]
  };

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-indigo">Novel Contribution 1</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px' }}>
            ATS Compatibility & Recruiter Visibility Optimizer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Predicts parser compliance penalties P_pen, keyword density K_dens, and mathematical pass probability S_ATS = σ(β₀ + β₁ K_dens + β₂ F_comp - β₃ P_pen).
          </p>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(9, 13, 22, 0.6)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-glow)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ATS Passing Probability</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--cyan)' }}>
            {data.passing_probability}%
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keyword Density Index (K_dens)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
            {Math.round(data.keyword_density * 100)}%
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${data.keyword_density * 100}%`, height: '100%', background: 'var(--cyan)' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Layout Format Compliance (F_comp)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
            {Math.round(data.formatting_compliance * 100)}%
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${data.formatting_compliance * 100}%`, height: '100%', background: 'var(--emerald)' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parsing Penalty (P_pen)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--rose)', marginTop: '4px' }}>
            {Math.round(data.parsing_penalty * 100)}%
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${data.parsing_penalty * 100}%`, height: '100%', background: 'var(--rose)' }} />
          </div>
        </div>

      </div>

      {/* Recommendations & Missing Keywords */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle style={{ color: 'var(--amber)', width: '18px', height: '18px' }} />
            Detected Missing Keywords
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.missing_keywords && data.missing_keywords.length > 0 ? (
              data.missing_keywords.map((kw, i) => (
                <span key={i} className="badge badge-amber" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  + Add '{kw}'
                </span>
              ))
            ) : (
              <p style={{ color: 'var(--emerald)', fontSize: '0.85rem' }}>All core job description keywords are present!</p>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ color: 'var(--cyan)', width: '18px', height: '18px' }} />
            Actionable Optimization Recommendations
          </h3>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '0', listStyle: 'none' }}>
            {data.optimization_suggestions.map((sug, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--emerald)', shrink: 0, marginTop: '2px' }} />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
