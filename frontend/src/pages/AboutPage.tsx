import React from 'react';
import { 
  Cpu, 
  Scale, 
  Layers, 
  FileText, 
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            AI-Based Welfare Scheme Anomaly Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A production-ready hybrid framework uniting unsupervised Machine Learning decision boundaries with statutory government compliance audits.
          </p>
        </div>

        {/* Section 1: The Problem & Vision */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-blue-400">
            <Scale className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              1. The Welfare Audit Challenge & Objectives
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Flagship government welfare initiatives like <strong>MGNREGA</strong> disburse thousands of crores annually to guarantee livelihood security for rural households. With hundreds of thousands of monthly operational entries, traditional manual auditing struggles to catch subtle systemic irregularities, localized material inflation, or sudden budget anomalies.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This platform solves this challenge by serving as an <strong>intelligent, automated audit assistant</strong>. It ingests historical and live data from official Open Government Data platforms (<code>data.gov.in</code>), executes pre-trained Machine Learning algorithms, and pinpoints suspicious records with transparent, plain-language explanations.
          </p>
        </div>

        {/* Section 2: Statutory Compliance Rules */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              2. MGNREGA Statutory Audit Norms
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                60:40 Wage to Material Ratio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                By statutory mandate under the MGNREGA Act, at least 60% of total expenditure at the district level must be disbursed as direct labor wages, with material and skilled wages capped at 40%. Breaches are automatically flagged.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                10% Administrative Expense Cap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Administrative overhead must remain strictly bounded relative to total program expenditure. Ratios exceeding 10% trigger priority compliance warnings.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Unit Cost per Person-Day
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates total expenditure against generated person-days of employment. Unusually high cost-per-day ratios (&gt; ₹450) indicate potential phantom expenditure.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Temporal Trend & Spike Detection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks year-over-year expenditure and person-day anomalies across 2018–2026 to catch sudden unseasonal surges or abrupt reporting deviations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: ML Model & Explainability */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-purple-400">
            <Cpu className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              3. Unsupervised ML & Explainability Pipeline
            </h2>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The platform utilizes an <strong>Isolation Forest</strong> algorithm pre-fitted on normalized operational ratios using a <strong>StandardScaler</strong>. Because welfare fraud patterns evolve dynamically, Isolation Forest isolates anomalous points by randomly selecting a feature and split value, generating decision scores based on path lengths in isolation trees.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Mathematical Explainability via Statistical Z-Scores
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every flagged record is benchmarked against its state baseline. Feature deviations are quantified using standard deviations ($\sigma$):
            </p>
            <div className="bg-slate-900 rounded-xl p-3 text-center my-3 font-mono text-xs text-blue-300 border border-slate-800">
              Z = (District_Record_Value - State_Baseline_Mean) / State_Standard_Deviation
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This ensures that every anomaly score is justified with clear mathematical facts (e.g. <em>"Material ratio is 54.4%, which is 2.0σ above the state median"</em>).
            </p>
          </div>
        </div>

        {/* Section 4: Multi-Scheme Architecture */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-amber-400">
            <Layers className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              4. Multi-Scheme Extensibility Roadmap
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The platform uses a <strong>Modular Scheme Registry</strong>. Adding subsequent national schemes (PM-KISAN, PMAY, PDS) requires zero UI rewrites:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
            <li className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <span className="font-bold text-white block mb-1">1. Scheme Dataset</span>
              Place raw scheme CSV or live OGD API resource mapping.
            </li>
            <li className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <span className="font-bold text-white block mb-1">2. Scheme ML Model</span>
              Load specialized pre-trained model (.pkl / ONNX).
            </li>
            <li className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <span className="font-bold text-white block mb-1">3. Compliance Rules</span>
              Define scheme statutory norms & eligibility thresholds.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
