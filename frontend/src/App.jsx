import React, { useState } from 'react';
import Header from './components/Header';
import NetworkVisualizer from './components/NetworkVisualizer';
import CandidateEvaluator from './components/CandidateEvaluator';
import ATSOptimizer from './components/ATSOptimizer';
import CareerRoadmap from './components/CareerRoadmap';
import XAIAuditRoom from './components/XAIAuditRoom';
import IEEEBenchmarks from './components/IEEEBenchmarks';
import PaperViewer from './components/PaperViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator');
  const [loading, setLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const API_BASE = "http://127.0.0.1:8000";

  // Trigger real candidate upload evaluation via backend API
  const handleEvaluateUpload = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/hiring/evaluate-upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setEvaluationResult(data);
    } catch (err) {
      console.error("Backend Error or API offline:", err);
      alert("Note: Connecting to backend server on 127.0.0.1:8000. Please ensure python uvicorn process is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px' }}>
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

        {activeTab === 'benchmarks' && (
          <IEEEBenchmarks />
        )}

        {activeTab === 'paper' && (
          <PaperViewer />
        )}
      </main>
    </div>
  );
}
