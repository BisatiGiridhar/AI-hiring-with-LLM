import React, { useState } from 'react';
import { Award, Clock, BookOpen, ExternalLink, Target, CheckCircle2 } from 'lucide-react';

export default function CareerRoadmap({ roadmapData }) {
  const [activePhase, setActivePhase] = useState('30');

  const roadmap = roadmapData || {
    day_30_phase: {
      focus: "Foundational Skill Acquisition & Real Courses",
      tasks: [
        { skill: "Kubernetes", target: "Master container orchestration & kubectl CLI", est_hours: 15, milestone: "Week 1-2: Deploy microservice on minikube." },
        { skill: "AWS", target: "EC2, S3, IAM & CloudWatch fundamentals", est_hours: 18, milestone: "Week 3-4: Build serverless API trigger." }
      ]
    },
    day_60_phase: {
      focus: "System Integration & Practical Application",
      tasks: [
        { skill: "System Design", target: "Distributed caching, load balancing & sharding", est_hours: 24, milestone: "Week 5-7: Architect fault-tolerant streaming engine." }
      ]
    },
    day_90_phase: {
      focus: "Advanced Mastery, Production Readiness & Portfolio Proof",
      tasks: [
        { skill: "LLM Fine-tuning", target: "PEFT, LoRA & QLoRA model optimization", est_hours: 30, milestone: "Week 9-12: Deploy domain-adapted model endpoint." }
      ]
    },
    live_recommended_courses: [
      { skill: "Kubernetes", provider: "Coursera / Linux Foundation", course_title: "Architecting with Kubernetes", url: "https://www.coursera.org/search?query=kubernetes" },
      { skill: "AWS", provider: "AWS Skill Builder", course_title: "AWS Certified Solutions Architect Official Path", url: "https://explore.skillbuilder.aws/" },
      { skill: "PyTorch", provider: "PyTorch Official", course_title: "Deep Learning with PyTorch Tutorial", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html" }
    ]
  };

  const currentPhaseData = 
    activePhase === '30' ? roadmap.day_30_phase :
    activePhase === '60' ? roadmap.day_60_phase :
    roadmap.day_90_phase;

  const liveCourses = roadmap.live_recommended_courses || [];

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-amber">Real Learning Integration</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px' }}>
            Personalized Adaptive 30-60-90 Day Career Roadmap
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Dynamically generates milestone pathways paired with real, active courses on Coursera, edX, Udemy, freeCodeCamp, and AWS.
          </p>
        </div>

        {/* Phase Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(9, 13, 22, 0.6)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          {['30', '60', '90'].map((p) => (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              style={{
                background: activePhase === p ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                border: 'none',
                color: activePhase === p ? '#fff' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p}-Day Milestone
            </button>
          ))}
        </div>
      </div>

      {/* Milestone Tasks */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: '6px solid var(--amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target style={{ color: 'var(--amber)', width: '22px', height: '22px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            Phase Focus: {currentPhaseData.focus}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
          {currentPhaseData.tasks.map((task, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-amber">{task.skill}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {task.target}</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--emerald)' }} />
                  {task.milestone}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', fontSize: '0.9rem', fontWeight: 700 }}>
                <Clock style={{ width: '16px', height: '16px' }} />
                {task.est_hours} hrs
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Live Courses Recommendation Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen style={{ color: 'var(--cyan)', width: '20px', height: '20px' }} />
          Verified External Learning Courses (Clickable Real Links)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {liveCourses.map((c, idx) => (
            <a
              key={idx}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(9, 13, 22, 0.6)',
                border: '1px solid var(--border-glass)',
                padding: '16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#fff',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{c.provider}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '6px', color: '#fff' }}>{c.course_title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>Skill: {c.skill}</span>
              </div>
              <ExternalLink style={{ width: '18px', height: '18px', color: 'var(--cyan)', flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
