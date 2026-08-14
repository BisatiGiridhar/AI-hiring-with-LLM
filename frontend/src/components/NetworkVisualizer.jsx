import React, { useState } from 'react';
import { Network, Play, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Code, Video, Globe, FileCheck, Layers } from 'lucide-react';

export default function NetworkVisualizer({ evaluationResult, onTriggerEvaluation }) {
  const [activeAgentIndex, setActiveAgentIndex] = useState(null);

  const agents = [
    { id: 1, name: 'Resume Agent', code: 'A_Res', role: 'Entity & Trajectory Extraction', icon: FileCheck, color: '#6366f1', status: 'Active' },
    { id: 2, name: 'ATS Optimization Agent', code: 'A_ATS', role: 'Format Compliance & Pass Probability', icon: ShieldCheck, color: '#06b6d4', status: 'Active' },
    { id: 3, name: 'Skill Gap Agent', code: 'A_Skill', role: 'Graph Optimization & Difficulty Matrix', icon: Cpu, color: '#10b981', status: 'Active' },
    { id: 4, name: 'Career Roadmap Agent', code: 'A_Road', role: '30-60-90 Day Upskill Milestone Engine', icon: Layers, color: '#f59e0b', status: 'Active' },
    { id: 5, name: 'Portfolio Agent', code: 'A_Port', role: 'Visual UX & Application Verification', icon: Globe, color: '#ec4899', status: 'Active' },
    { id: 6, name: 'GitHub Analysis Agent', code: 'A_Git', role: 'AST Code Complexity & Commit Velocity', icon: Code, color: '#a855f7', status: 'Active' },
    { id: 7, name: 'Video Interview Agent', code: 'A_Vid', role: 'Acoustic Pitch & Soft-Skill Sentiment', icon: Video, color: '#3b82f6', status: 'Active' },
    { id: 8, name: 'Explainability Agent', code: 'A_XAI', role: 'SHAP Attributions & Counterfactuals', icon: ShieldCheck, color: '#f43f5e', status: 'Active' },
    { id: 9, name: 'Candidate Ranking Agent', code: 'A_Rank', role: 'Cross-Attention Multimodal Fusion', icon: Network, color: '#8b5cf6', status: 'Active' },
    { id: 10, name: 'Recruiter Intelligence Agent', code: 'A_Rec', role: 'Bias Audit & Interview Prompts', icon: CheckCircle2, color: '#14b8a6', status: 'Active' },
  ];

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo">DAG Multi-Agent Protocol</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px' }}>
            10-Agent Autonomous Communication DAG
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px', marginTop: '4px' }}>
            Each agent operates asynchronously as a specialized node in a directed acyclic state graph, communicating latent vectors, compliance penalties, and counterfactuals to the fusion scoring engine.
          </p>
        </div>

        <button className="glass-btn" onClick={onTriggerEvaluation}>
          <Play style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
          Execute DAG Pipeline
        </button>
      </div>

      {/* DAG Node Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {agents.map((ag, idx) => {
          const Icon = ag.icon;
          const isSelected = activeAgentIndex === idx;
          const isExecuted = evaluationResult?.execution_dag_log ? true : false;
          
          return (
            <div
              key={ag.id}
              className={`glass-panel ${isExecuted ? 'node-active' : ''}`}
              onClick={() => setActiveAgentIndex(idx)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                borderLeft: `4px solid ${ag.color}`,
                background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'var(--bg-card)',
                transform: isSelected ? 'translateY(-4px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ag.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color: ag.color }} />
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{ag.code}</span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{ag.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', height: '36px' }}>{ag.role}</p>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>Status: <strong style={{ color: '#34d399' }}>READY</strong></span>
                <span>Latency: <strong style={{ color: 'var(--cyan)' }}>~12ms</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Inspector */}
      {activeAgentIndex !== null && (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: `6px solid ${agents[activeAgentIndex].color}` }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Agent Deep-Dive Inspector: {agents[activeAgentIndex].name} ({agents[activeAgentIndex].code})
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Mathematical Role: {agents[activeAgentIndex].role}. Integrated into DAG pipeline step {activeAgentIndex + 1} of 10.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--cyan)' }}>Inputs Accepted:</strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Candidate Document Entities, Structural Token Vectors, Job Context Ontology.</p>
            </div>
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--emerald)' }}>Emitted Artifacts:</strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Normalized Score Matrix S, Confidence Weights C_score, Local SHAP Attributions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
