import React from 'react';
import { 
  Scale, 
  AlertTriangle
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-[var(--color-navy)]" />
            <span>Auditing Methodology & Mathematical Foundations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] serif-title tracking-tight">
            How GovGuard AI Screens Expenditure
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A production-ready hybrid framework uniting statutory government accounting ceilings with unsupervised machine learning decision boundaries.
          </p>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-[var(--color-line)] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-saffron)]">
              Architecture Overview
            </span>
            <h2 className="text-xl font-bold text-[var(--color-ink)] mt-0.5">
              4-Stage Screening Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">STAGE 1</span>
              <h3 className="text-sm font-bold text-[var(--color-ink)] mt-1">Data Ingestion</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Ingests 389,831 cumulative district-month snapshots from data.gov.in. Filters zero-expenditure rows and groups by (district, financial year).
              </p>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">STAGE 2</span>
              <h3 className="text-sm font-bold text-[var(--color-ink)] mt-1">Ratio Extraction</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Computes 4 normalized ratios: Material share (x1), Admin overhead (x2), Wage component (x3), and Unit cost ₹ per personday (x4).
              </p>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">STAGE 3</span>
              <h3 className="text-sm font-bold text-[var(--color-ink)] mt-1">Hybrid Model</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Applies pre-trained 100-tree Isolation Forest decision function <code>d(x) &lt; τ</code> gated by Confident anomaly rules, or bypassed by Statutory Breaches.
              </p>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">STAGE 4</span>
              <h3 className="text-sm font-bold text-[var(--color-ink)] mt-1">Audit Queue</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Synthesizes a 0–100 risk score and generates transparent, plain-language audit dossiers with metric Z-scores for field auditors.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Thresholds Table */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-[var(--color-line)] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
              Operational Limits
            </span>
            <h2 className="text-xl font-bold text-[var(--color-ink)] mt-0.5">
              Screening Thresholds & Legal Basis
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every flag raised is traceable to either a statutory ceiling, an official ministry circular, or an empirical distribution norm.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Metric / Ratio</th>
                  <th className="py-3 px-3">Screening Limit</th>
                  <th className="py-3 px-3">Statutory Breach Limit</th>
                  <th className="py-3 px-3">Authority / Legal Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] text-slate-700">
                <tr>
                  <td className="py-3.5 px-3 font-bold text-[var(--color-ink)]">
                    Material Share (x1)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-700">
                    &gt; 0.40 (40.0%)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-red-700">
                    &gt; 0.55 (55.0%)
                  </td>
                  <td className="py-3.5 px-3">
                    <strong>Statutory 60:40 Rule:</strong> MGNREGA Act Section 16 mandates that at least 60% of expenditure must be on wages; material capped at 40%.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-bold text-[var(--color-ink)]">
                    Administrative Overhead (x2)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-700">
                    &gt; 0.06 (6.0%)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-red-700">
                    &gt; 0.084 (8.4%)
                  </td>
                  <td className="py-3.5 px-3">
                    <strong>Official MoRD Limit:</strong> Ministry of Rural Development operational guidelines cap administrative expenditure at 6%.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-bold text-[var(--color-ink)]">
                    Unit Cost per Personday (x4)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-700">
                    &gt; ₹450 / day
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-red-700">
                    &gt; ₹500 / day
                  </td>
                  <td className="py-3.5 px-3">
                    <strong>Author-Set Empirical Norm:</strong> Calibrated against national average daily notified wage rates + allowable material share per personday.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Empirical Evaluation Results (2025-26 Test Year) */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-[var(--color-line)] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-green)]">
              Model Performance
            </span>
            <h2 className="text-xl font-bold text-[var(--color-ink)] mt-0.5">
              Empirical Evaluation (FY 2025-26 Out-of-Time Test Set)
            </h2>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              <strong>Key Evaluation Finding:</strong> On the 2025-26 test year the hybrid's F1-score (<strong>92.26%</strong>) is on par with a simple rule (<strong>92.02%</strong>); it reduces false alerts (false positive rate <strong>10.95% → 6.15%</strong>) at a recall cost.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Test Set F1-Score</span>
              <div className="text-2xl font-black text-[var(--color-ink)] tabular-nums mt-1">92.26%</div>
              <span className="text-[10px] text-slate-500">Parity with simple heuristic (92.02%)</span>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">False Positive Rate</span>
              <div className="text-2xl font-black text-[var(--color-green)] tabular-nums mt-1">6.15%</div>
              <span className="text-[10px] text-slate-500">Substantial reduction from 10.95%</span>
            </div>

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trained Model Artifact</span>
              <div className="text-sm font-bold text-[var(--color-navy)] mt-2">IsolationForest</div>
              <span className="text-[10px] text-slate-500">100 trees · Contamination 0.07</span>
            </div>
          </div>
        </div>

        {/* Proxy-Label Caveat & Auditor Responsibility */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-[var(--color-ink)]">
              Proxy-Label Caveat & Auditor Responsibility
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            In government welfare administration, ground-truth labels of confirmed fraudulent transactions are rarely available at scale prior to forensic audits. Consequently, the ground truth proxy used during training and benchmarking relies on multi-norm rule breaches.
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            A flag generated by this platform represents a <strong>screening alert</strong> for targeted manual review. It identifies records where expenditure deviates significantly from legal limits or empirical cohort baselines. It does not constitute legal proof of corruption, fraud, or embezzlement. <strong>Final audit and administrative decisions stay entirely with human auditors.</strong>
          </p>

          <div className="pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-xs text-slate-500">
            <span>Research Implementation · GovGuard AI</span>
            <span className="font-mono text-slate-400">scikit-learn 1.6.1 · FastAPI · React 18</span>
          </div>
        </div>

      </div>
    </div>
  );
};
