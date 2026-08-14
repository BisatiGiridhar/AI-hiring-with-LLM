import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Upload, GitBranch, Globe, FileText, Sparkles, CheckCircle, AlertCircle, Cpu, BriefcaseIcon } from 'lucide-react';
import { jobsAPI } from '../services/api';

export default function CandidateEvaluator({ evaluationResult, loading, onEvaluateUpload }) {
  const [candidateName, setCandidateName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredKeywords, setRequiredKeywords] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  // Load available job postings so user can select one
  useEffect(() => {
    jobsAPI.list(true)
      .then(res => setJobPostings(res.data || []))
      .catch(() => setJobPostings([]));
  }, []);

  // Auto-populate form fields when a saved job is selected
  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    if (!jobId) return;
    const job = jobPostings.find(j => String(j.id) === jobId);
    if (job) {
      setJobTitle(job.title);
      setJobDescription(job.description);
      setRequiredKeywords((job.required_keywords || []).join(', '));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('candidate_name', candidateName);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);
    
    // Convert comma-separated string to JSON array
    const kwArray = requiredKeywords.split(',').map(k => k.trim()).filter(Boolean);
    formData.append('required_keywords_json', JSON.stringify(kwArray));
    
    if (githubUrl) formData.append('github_url', githubUrl);
    if (portfolioUrl) formData.append('portfolio_url', portfolioUrl);
    if (selectedFile) {
      formData.append('resume_file', selectedFile);
    } else {
      formData.append('resume_text_override', resumeText);
    }

    onEvaluateUpload(formData);
  };

  // Radar chart data
  const radarData = evaluationResult ? [
    { subject: 'ATS Compliance', A: Math.round(evaluationResult.ats_optimization.s_ats * 100), fullMark: 100 },
    { subject: 'Skill Coverage', A: Math.round(evaluationResult.skill_gap_analysis.s_skill * 100), fullMark: 100 },
    { subject: 'Multimodal Fusion', A: Math.round(evaluationResult.multimodal_analysis.attention_weights.github_attention * 100 + 45), fullMark: 100 },
    { subject: 'Roadmap Progress', A: Math.round(evaluationResult.ranking_details.score_components.roadmap_score * 100), fullMark: 100 },
    { subject: 'Video & Soft Skills', A: Math.round(evaluationResult.multimodal_analysis.video.s_video * 100), fullMark: 100 },
  ] : [
    { subject: 'ATS Compliance', A: 0 },
    { subject: 'Skill Coverage', A: 0 },
    { subject: 'Multimodal Fusion', A: 0 },
    { subject: 'Roadmap Progress', A: 0 },
    { subject: 'Video & Soft Skills', A: 0 },
  ];

  return (
    <div style={{ padding: '24px 0', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
      
      {/* Left Column: Real Candidate Upload Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <span className="badge badge-emerald">Real-Time Data Pipeline</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
            Real Candidate Document & API Evaluator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Upload actual candidate resumes (PDF, DOCX, TXT), connect live GitHub REST API, and scrape portfolio URLs.
          </p>
        </div>

        {/* Optional: Load from saved Job Posting */}
        {jobPostings.length > 0 && (
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <FileText style={{ width: '14px', height: '14px' }} /> Load from Saved Job Posting (optional):
            </label>
            <select className="glass-input" value={selectedJobId} onChange={handleJobSelect} style={{ width: '100%' }}>
              <option value="">— Select a job posting or fill manually —</option>
              {jobPostings.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.experience_level || 'any'} level)</option>
              ))}
            </select>
          </div>
        )}

        {/* Candidate & Job Input */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Candidate Name *:</label>
            <input className="glass-input" placeholder="Enter candidate's full name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Job Title *:</label>
            <input className="glass-input" placeholder="e.g. Senior AI Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          </div>
        </div>

        {/* File Dropzone */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Upload Real Resume File (PDF, DOCX, TXT):
          </label>
          <div style={{ border: '2px dashed var(--border-glow)', borderRadius: '12px', padding: '16px', textAlign: 'center', background: 'rgba(9, 13, 22, 0.5)', cursor: 'pointer' }}>
            <Upload style={{ width: '24px', height: '24px', color: 'var(--cyan)', margin: '0 auto 6px' }} />
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} style={{ display: 'none' }} id="resume-upload" />
            <label htmlFor="resume-upload" style={{ cursor: 'pointer', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag PDF / DOCX resume file here'}
            </label>
          </div>
        </div>

        {/* Raw Text Fallback */}
        {!selectedFile && (
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Or Paste Raw Resume Content *:</label>
            <textarea className="glass-input" rows={3} placeholder="Paste the candidate's resume text here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
          </div>
        )}

        {/* Live GitHub & Portfolio Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <GitBranch style={{ width: '14px', height: '14px' }} /> Live GitHub URL / Username:
            </label>
            <input className="glass-input" placeholder="https://github.com/username" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Globe style={{ width: '14px', height: '14px' }} /> Live Portfolio URL:
            </label>
            <input className="glass-input" placeholder="https://..." value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
          </div>
        </div>

        {/* Required Keywords */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Core Keywords (Comma Separated):</label>
          <input className="glass-input" value={requiredKeywords} onChange={(e) => setRequiredKeywords(e.target.value)} />
        </div>

        <button type="submit" className="glass-btn" disabled={loading} style={{ justifyContent: 'center', marginTop: '8px' }}>
          <Sparkles style={{ width: '18px', height: '18px' }} />
          {loading ? 'Executing Real Data Multimodal Pipeline...' : 'Run Real Candidate Multimodal Assessment'}
        </button>

      </form>

      {/* Right Column: Score Breakdown & Competency Radar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {evaluationResult ? (
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '6px solid var(--emerald)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' }}>
            <span className="badge badge-emerald">Live Database Record #{evaluationResult.database_record_id || 'SAVED'}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                  {evaluationResult.summary_scores.final_percentage}%
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Calibrated Confidence Score: <strong>{evaluationResult.summary_scores.confidence_score}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ATS Pass Rate</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cyan)' }}>
                  {evaluationResult.summary_scores.ats_passing_probability}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Hiring Readiness</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald)' }}>
                  {evaluationResult.summary_scores.hiring_readiness_index}/100
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <Cpu style={{ width: '32px', height: '32px', color: 'var(--primary)', margin: '0 auto 8px' }} />
            <h3>Real-Time Processing Ready</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upload a resume file and click assessment to compute live scores.</p>
          </div>
        )}

        {/* Radar Chart */}
        <div className="glass-panel" style={{ padding: '20px', height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Real-Time Competency Radar
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
              <Radar name={candidateName} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}
