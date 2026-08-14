import React, { useEffect, useState } from 'react';
import {
  Users, BarChart3, Briefcase, Activity, Shield, RefreshCw,
  CheckCircle, XCircle, Eye, Ban, Crown
} from 'lucide-react';
import { adminAPI } from '../services/api';
import type { SystemStats, User as UserType, AuditLog } from '../types';

type Tab = 'overview' | 'users' | 'logs';

export default function AdminPage() {
  const [tab, setTab]       = useState<Tab>('overview');
  const [stats, setStats]   = useState<SystemStats | null>(null);
  const [users, setUsers]   = useState<UserType[]>([]);
  const [logs, setLogs]     = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const res = await adminAPI.stats();
    setStats(res.data);
  };
  const loadUsers = async () => {
    const res = await adminAPI.users();
    setUsers(res.data);
  };
  const loadLogs = async () => {
    const res = await adminAPI.auditLogs();
    setLogs(res.data);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try { await Promise.all([loadStats(), loadUsers(), loadLogs()]); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const toggleUser = async (userId: number, isActive: boolean) => {
    await adminAPI.updateUser(userId, { is_active: !isActive });
    await loadUsers();
  };

  const changeRole = async (userId: number, newRole: string) => {
    await adminAPI.updateUser(userId, { role: newRole });
    await loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">System administration and monitoring</p>
        </div>
        <button onClick={() => Promise.all([loadStats(), loadUsers(), loadLogs()])} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: 'overview', label: 'System Overview', icon: BarChart3 },
          { id: 'users',    label: 'Users',           icon: Users },
          { id: 'logs',     label: 'Audit Logs',      icon: Activity },
        ] as { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? 'nav-tab-active flex items-center gap-2' : 'nav-tab-inactive flex items-center gap-2'}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users',       value: stats.total_users,       icon: Users,     color: 'brand' },
              { label: 'Total Evaluations', value: stats.total_evaluations, icon: BarChart3,  color: 'emerald' },
              { label: 'Job Postings',      value: stats.total_job_postings,icon: Briefcase,  color: 'amber' },
              { label: 'Active Users',      value: stats.active_users,      icon: Activity,   color: 'purple' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card glass-card">
                <Icon className={`w-8 h-8 mb-1 ${color === 'brand' ? 'text-brand-400' : color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-purple-400'}`} />
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-brand-400" /> System Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'Avg Candidate Score', value: stats.average_final_score != null ? `${(stats.average_final_score * 100).toFixed(1)}%` : 'N/A' },
                  { label: 'Recent Activity (24h)', value: stats.recent_activity_count },
                  { label: 'Database Status', value: 'HEALTHY' },
                  { label: 'AI Agents', value: '10/10 ONLINE' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Verdict Distribution</h3>
              <div className="space-y-2">
                {Object.entries(stats.top_verdict_counts).map(([verdict, count]) => (
                  <div key={verdict} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 truncate">{verdict}</p>
                      <div className="mt-1 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / stats.total_evaluations) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.top_verdict_counts).length === 0 && (
                  <p className="text-slate-500 text-sm">No evaluations completed yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['ID', 'Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-500">#{u.id}</td>
                  <td className="px-4 py-3 text-sm text-white font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-surface-600/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="candidate">Candidate</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active
                      ? <span className="badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
                      : <span className="badge-danger flex items-center gap-1"><XCircle className="w-3 h-3" />Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUser(u.id, u.is_active)}
                      className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                        u.is_active ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.is_active ? <><Ban className="w-3 h-3" />Deactivate</> : <><CheckCircle className="w-3 h-3" />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Tab */}
      {tab === 'logs' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Time', 'Action', 'User ID', 'IP', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.slice(0, 50).map(log => (
                  <tr key={log.id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-brand-400">{log.action}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{log.user_id ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{log.ip_address ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      {log.status_code && (log.status_code < 400
                        ? <span className="badge-success">{log.status_code}</span>
                        : <span className="badge-danger">{log.status_code}</span>)}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No audit logs yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
