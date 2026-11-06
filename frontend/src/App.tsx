import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { DistrictRankingPage } from './pages/DistrictRankingPage';
import { AboutPage } from './pages/AboutPage';
import { AuditorDashboardPage } from './pages/AuditorDashboardPage';
import { SchemeConceptsPage } from './pages/SchemeConceptsPage';
import { LiveDemoPage } from './pages/LiveDemoPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-saffron)] selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/live-demo" element={<LiveDemoPage />} />
            <Route path="/demo" element={<LiveDemoPage />} />
            <Route path="/dashboard" element={<AuditorDashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/analyze" element={<AnalysisPage />} />
            <Route path="/rankings" element={<DistrictRankingPage />} />
            <Route path="/concepts" element={<SchemeConceptsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Persistent Auditor Responsibility Footer */}
        <footer className="border-t border-[var(--color-line)] bg-white py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">GovGuard AI</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">Welfare Expenditure Anomaly Screening</span>
            </div>
            <div className="text-slate-600 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              A flag is not proof of fraud. It means: check this first. Decisions stay with human auditors.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
