import React, { useState, useEffect } from 'react';
import { Link, ChevronRight, Trash2, ExternalLink, FileText } from 'lucide-react';
import { hiringAPI } from '../services/api';
import type { EvaluationSummary, PaginatedEvaluations } from '../types';

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict.includes('STRONG')) return <span className="badge-success text-xs">{verdict}</span>;
  if (verdict.includes('MODERATE') || verdict.includes('SHORTLIST')) return <span className="badge-warning text-xs">{verdict}</span>;
  if (verdict.includes('BORDERLINE')) return <span className="badge-info text-xs">{verdict}</span>;
  return <span className="badge-danger text-xs">{verdict}</span>;
}

export default function EvaluationHistoryPage() {
  const [data, setData]     = useState<PaginatedEvaluations | null>(null);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await hiringAPI.getEvals(p, 10);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this evaluation record?')) return;
    await hiringAPI.deleteEval(id);
    load(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Evaluation History</h1>
        <p className="text-slate-400 text-sm mt-1">All your candidate evaluations · {data?.total ?? 0} total</p>
      </div>

      {(!data?.items?.length) ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No evaluations yet</p>
          <p className="text-slate-500 text-sm mt-1">Upload a candidate resume to start evaluating.</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Candidate', 'Job Title', 'Score', 'ATS', 'Verdict', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map((e: EvaluationSummary) => (
                  <tr key={e.id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-white">{e.candidate_name}</p>
                      {e.resume_file_name && <p className="text-xs text-slate-500 truncate max-w-[150px]">{e.resume_file_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-[120px] truncate">{e.job_title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${
                        e.final_score >= 0.75 ? 'text-emerald-400' :
                        e.final_score >= 0.55 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {(e.final_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{(e.ats_score * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <VerdictBadge verdict={e.verdict} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-rose-400/60 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > 10 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-slate-400 text-sm">
                Page {page} of {Math.ceil(data.total / 10)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / 10)}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
