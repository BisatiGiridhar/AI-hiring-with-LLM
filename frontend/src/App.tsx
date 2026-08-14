import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Brain } from 'lucide-react';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));

// ── Existing components (migrated to be used as pages) ────────────────────
import Header from './components/Header';
import CandidateEvaluator from './components/CandidateEvaluator';
import ATSOptimizer from './components/ATSOptimizer';
import CareerRoadmap from './components/CareerRoadmap';
import XAIAuditRoom from './components/XAIAuditRoom';
import IEEEBenchmarks from './components/IEEEBenchmarks';
import PaperViewer from './components/PaperViewer';
import NetworkVisualizer from './components/NetworkVisualizer';
import EvaluationHistory from './pages/EvaluationHistoryPage';

// ── Global state for evaluation result (lifted up) ────────────────────────
import type { EvaluationResult } from './types';

// ── Loading spinner ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ── Protected Route: requires authentication ───────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// ── Admin Route: requires admin role ──────────────────────────────────────
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── Main application layout (authenticated area) ──────────────────────────
function AppLayout() {
  const [evaluationResult, setEvaluationResult] = React.useState<EvaluationResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('evaluator');

  const handleEvaluateUpload = async (formData: FormData) => {
    setLoading(true);
    try {
      const { hiringAPI } = await import('./services/api');
      const response = await hiringAPI.evaluate(formData);
      setEvaluationResult(response.data);
      setActiveTab('evaluator'); // Stay on evaluator to show results
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Evaluation failed. Please try again.';
      alert(`Evaluation Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16 pt-2">
        {activeTab === 'dashboard' && (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        )}
        {activeTab === 'dag' && (
          <NetworkVisualizer
            evaluationResult={evaluationResult}
            onTriggerEvaluation={() => setActiveTab('evaluator')}
          />
        )}
        {activeTab === 'evaluator' && (
          <CandidateEvaluator
            evaluationResult={evaluationResult}
            loading={loading}
            onEvaluateUpload={handleEvaluateUpload}
          />
        )}
        {activeTab === 'ats' && (
          <ATSOptimizer atsData={evaluationResult?.ats_optimization} />
        )}
        {activeTab === 'roadmap' && (
          <CareerRoadmap roadmapData={evaluationResult?.career_roadmap} />
        )}
        {activeTab === 'xai' && (
          <XAIAuditRoom
            xaiData={evaluationResult?.explainability}
            recruiterData={evaluationResult?.recruiter_intelligence}
          />
        )}
        {activeTab === 'benchmarks' && <IEEEBenchmarks />}
        {activeTab === 'paper'      && <PaperViewer />}
        {activeTab === 'history'    && <EvaluationHistory />}
        {activeTab === 'profile'    && (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        )}
        {activeTab === 'admin'      && (
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        )}
      </main>
    </div>
  );
}

// ── Root Application ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected App Layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
