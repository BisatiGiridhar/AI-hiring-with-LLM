import React from 'react';
import { FileText, Download, ExternalLink, Award } from 'lucide-react';

export default function PaperViewer() {
  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-indigo">IEEE Manuscript Reader</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px' }}>
            A Context-Aware, Multimodal, and Explainable Multi-Agent Intelligence System
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Target Publication: IEEE Transactions on Artificial Intelligence / IEEE Access / IEEE ICMLA
          </p>
        </div>
      </div>

      {/* Embedded Manuscript Container */}
      <div className="glass-panel" style={{ padding: '32px', background: '#0b0f19', color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            A Context-Aware, Multimodal, and Explainable Multi-Agent Intelligence System for Next-Generation Recruitment and Skill-Gap Optimization
          </h1>
          <p style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.9rem' }}>
            IEEE Senior AI Research Group • AI in Human Capital Research Lab
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>Abstract</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Traditional Automated Applicant Tracking Systems (ATS) and early LLM resume screeners suffer from severe limitations: single-modality bias, static keyword matching, lack of post-rejection actionable career guidance, and opaque black-box scoring. In this paper, we propose a novel <strong>Context-Aware, Multimodal, and Explainable Multi-Agent Hiring Framework (X-MMHF)</strong> orchestrating 10 autonomous specialized agents communicating via a directed acyclic graph (DAG). Our contributions include mathematical formulations for ATS pass probability (S_ATS), semantic skill gap optimization (S_Skill), dynamic 30-60-90 day career roadmapping (S_Roadmap), and multimodal cross-attention fusion (S_Multimodal).
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>I. Introduction & Research Questions</h3>
            <p>
              Automated recruitment has evolved rapidly, yet existing screeners remain modality-blind and fail to provide actionable upskilling pathways. We formulate 5 core research questions (RQ1-RQ5) addressing ATS compatibility modeling, multimodal cross-attention signal fusion, graph-based skill gap difficulty prediction, reinforcement-guided career roadmapping, and recruiter XAI trust metrics.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>II. Systematic Literature Gap Analysis</h3>
            <p>
              We perform a systematic matrix comparison across Traditional ATS, Machine Learning (TF-IDF/SVM), Deep Learning (BERT/S-BERT), Single LLMs (GPT-4), Base Multi-Agent Paper, and our proposed X-MMHF Framework across 9 key dimension metrics.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>III. Mathematical Model Equations</h3>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan)' }}>
              S_ATS = Sigmoid(beta_0 + beta_1 * K_dens + beta_2 * F_comp - beta_3 * P_pen)<br/>
              S_Skill = 1 - ( sum(w_i * d_i) / sum(w_j * max(d)) )<br/>
              S_Multimodal = Softmax( Q * K^T / sqrt(d_k) ) * V<br/>
              S_Final = alpha * S_ATS + beta * S_Skill + gamma * S_Multimodal + delta * S_Roadmap + epsilon * S_Video
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
