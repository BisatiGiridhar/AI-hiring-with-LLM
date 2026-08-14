import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Users, Briefcase, TrendingUp, Plus, ChevronRight,
  Trophy, Clock, Target, Brain, Activity, ArrowUp, FileText
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { hiringAPI, jobsAPI } from '../services/api';
import type { DashboardStats, EvaluationSummary, JobPosting } from '../types';

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em"
        fill="white" fontSize={size * 0.22} fontWeight={700}
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {score.toFixed(0)}%
      </text>
    </svg>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict.includes('STRONG')) return <span className="badge-success">{verdict}</span>;
  if (verdict.includes('MODERATE') || verdict.includes('SHORTLIST')) return <span className="badge-warning">{verdict}</span>;
  if (verdict.includes('BORDERLINE')) return <span className="badge-info">{verdict}</span>;
  return <span className="badge-danger">{verdict}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [evals, setEvals]       = useState<EvaluationSummary[]>([]);
  const [jobs, setJobs]         = useState<JobPosting[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, evalsRes] = await Promise.all([
          hiringAPI.dashboardStats(),
          hiringAPI.getEvals(1, 5),
        ]);
        setStats(statsRes.data);
        setEvals(evalsRes.data.items);
        if (user?.role === 'recruiter' || user?.role === 'admin') {
          const jobsRes = await jobsAPI.mine();
          setJobs(jobsRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.role === 'admin' ? 'System Administrator' : user?.role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <Link to="/evaluate" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Evaluation
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn-secondary flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Evaluations',
            value: stats?.total_evaluations ?? 0,
            icon: BarChart3,
            color: 'brand',
            sub: 'All time',
          },
          {
            label: 'Avg Match Score',
            value: stats?.average_score != null ? `${(stats.average_score * 100).toFixed(1)}%` : 'N/A',
            icon: Target,
            color: 'emerald',
            sub: 'Composite score',
          },
          {
            label: 'Top Candidates',
            value: stats?.top_candidates?.length ?? 0,
            icon: Trophy,
            color: 'amber',
            sub: 'High-scoring',
          },
          {
            label: 'AI Agents',
            value: 10,
            icon: Brain,
            color: 'purple',
            sub: 'Operational',
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="stat-card glass-card-hover">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
              color === 'brand'   ? 'bg-brand-600/20 text-brand-400' :
              color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
              color === 'amber'   ? 'bg-amber-500/20 text-amber-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs font-medium text-slate-300">{label}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Candidates */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title text-lg">Recent Evaluations</h2>
              <p className="text-slate-500 text-xs">Latest candidate analysis results</p>
            </div>
            <Link to="/evaluations" className="text-brand-400 text-sm flex items-center gap-1 hover:text-brand-300 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {evals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No evaluations yet</p>
              <p className="text-slate-500 text-sm mt-1">
                {user?.role === 'recruiter' ? 'Upload a resume to start evaluating candidates.' : 'Your evaluations will appear here.'}
              </p>
              {user?.role === 'recruiter' && (
                <Link to="/evaluate" className="btn-primary mt-4 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Start Evaluation
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {evals.map(e => (
                <div key={e.id} className="flex items-center gap-4 p-3 bg-surface-700/30 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <ScoreRing score={e.final_score * 100} size={56} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.candidate_name}</p>
                    <p className="text-xs text-slate-400 truncate">{e.job_title}</p>
                    <div className="mt-1">
                      <VerdictBadge verdict={e.verdict} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString()}</p>
                    <Link to={`/evaluations/${e.id}`} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 mt-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Top Candidates */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" /> Quick Actions
            </h3>
            <div className="space-y-2">
              {(user?.role === 'recruiter' || user?.role === 'admin') && (
                <>
                  <Link to="/evaluate" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-700/50 transition-colors group">
                    <div className="w-7 h-7 bg-brand-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <span className="text-sm text-slate-300">Evaluate Candidate</span>
                  </Link>
                  <Link to="/jobs" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-700/50 transition-colors group">
                    <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-300">Manage Job Postings</span>
                  </Link>
                </>
              )}
              <Link to="/benchmarks" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-700/50 transition-colors group">
                <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-sm text-slate-300">IEEE Benchmarks</span>
              </Link>
              <Link to="/evaluations" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-700/50 transition-colors group">
                <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-slate-300">Evaluation History</span>
              </Link>
            </div>
          </div>

          {/* Top Scored Candidates */}
          {(stats?.top_candidates?.length ?? 0) > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Top Candidates
              </h3>
              <div className="space-y-2.5">
                {stats!.top_candidates.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-slate-500/20 text-slate-400' :
                      'bg-amber-800/20 text-amber-700'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      {(c.score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
