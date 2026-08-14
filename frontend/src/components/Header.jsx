import React from 'react';
import { Cpu, Award, FileText, Network, CheckCircle, BarChart3, HelpCircle, UserCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dag', label: '10-Agent DAG Network', icon: Network },
    { id: 'evaluator', label: 'Multimodal Evaluator', icon: Cpu },
    { id: 'ats', label: 'ATS Optimizer', icon: CheckCircle },
    { id: 'roadmap', label: '30-60-90 Roadmap', icon: Award },
    { id: 'xai', label: 'XAI Recruiter Room', icon: UserCheck },
    { id: 'benchmarks', label: 'IEEE Benchmarks', icon: BarChart3 },
    { id: 'paper', label: 'IEEE Paper Viewer', icon: FileText },
  ];

  return (
    <header style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', sticky: 'top', zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Title branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
            <Cpu style={{ color: '#fff', width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                X-MMHF Intelligence System
              </h1>
              <span className="badge badge-indigo">IEEE Manuscript</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Context-Aware & Explainable Multi-Agent Hiring Framework
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{ width: '16px', height: '16px', color: isActive ? 'var(--cyan)' : 'inherit' }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
