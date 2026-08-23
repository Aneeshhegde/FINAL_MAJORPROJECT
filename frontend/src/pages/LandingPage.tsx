import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart4, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const steps = [
    { num: '01', title: 'Data Ingestion', desc: '389k+ district monthly records from data.gov.in & central databases.' },
    { num: '02', title: 'Feature Engineering', desc: 'Computes material ratios, wage components, unit costs & persondays.' },
    { num: '03', title: 'ML Isolation Forest', desc: 'Unsupervised multi-dimensional decision boundary anomaly detection.' },
    { num: '04', title: 'Risk Scoring & Rules', desc: 'Statutory 60:40 norm audits synthesized into a 0–100 risk score.' },
    { num: '05', title: 'Explainability & Audit', desc: 'Statistical Z-score deviations & plain-language audit evidence.' }
  ];

  const schemes = [
    {
      id: 'MGNREGA',
      name: 'MGNREGA',
      full: 'Mahatma Gandhi National Rural Employment Guarantee Act',
      status: 'Active & Operational',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      active: true,
      desc: 'Wage vs. material expenditure skew, excessive unit costs, and administrative expense violation detection.'
    },
    {
      id: 'PM-KISAN',
      name: 'PM-KISAN',
      full: 'Pradhan Mantri Kisan Samman Nidhi',
      status: 'Active & Operational',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      active: true,
      desc: 'Direct cash benefit income transfer auditing, ineligible landholder exclusions, and duplicate disbursement flags.'
    },
    {
      id: 'PMAY',
      name: 'PMAY',
      full: 'Pradhan Mantri Awas Yojana (Rural/Urban)',
      status: 'Active & Operational',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      active: true,
      desc: 'Housing subsidy milestone validation, construction unit cost deviations, and geo-tag inspection audits.'
    },
    {
      id: 'PDS',
      name: 'PDS',
      full: 'Public Distribution System',
      status: 'Active & Operational',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      active: true,
      desc: 'Foodgrain offtake tracking, fair-price shop quota leakage, and ration card beneficiary anomalies.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Government Welfare Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Government Scheme <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Fraud & Anomaly</span> Detection Platform
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            AI-powered identification of suspicious expenditure patterns, statutory norm violations, and statistical anomalies across welfare schemes.
          </p>

          <div className="mt-3 text-sm text-emerald-400 font-semibold flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All Schemes Active: MGNREGA, PM-KISAN, PMAY, PDS, NSP Scholarships</span>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              <span>Start District Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/rankings"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center justify-center space-x-2 transition-all"
            >
              <BarChart4 className="w-4 h-4 text-slate-400" />
              <span>View State Rankings</span>
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-white">389,831</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Verified Records</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">34 States</div>
              <div className="text-xs text-slate-400 font-medium mt-1">All-India Coverage</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">700+ Districts</div>
              <div className="text-xs text-slate-400 font-medium mt-1">High-Resolution Data</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">5 Schemes</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Active & Operational</div>
            </div>
          </div>

        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 sm:py-24 border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Core Technical Pipeline
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              How the Anomaly Detection Engine Works
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Combining pre-trained unsupervised Machine Learning (Isolation Forest) with statutory government compliance rules.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div 
                key={i} 
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 relative group hover:border-blue-500/50 transition-colors"
              >
                <span className="text-2xl font-black text-slate-600 group-hover:text-blue-400 transition-colors">
                  {st.num}
                </span>
                <h4 className="text-base font-bold text-white mt-2">
                  {st.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Multi-Scheme Active Platform */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Modular Architecture
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                Multi-Scheme Welfare Platform
              </h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Unified analytics engine supporting multi-scheme detection across rural employment, agriculture, housing, and food security.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Schemes Operational</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schemes.map((sc, i) => (
              <div 
                key={i} 
                className="rounded-2xl p-6 border flex flex-col justify-between transition-all bg-slate-800/80 border-blue-500/40 glow-blue shadow-xl hover:border-blue-400 hover:scale-[1.02]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {sc.status}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <h4 className="text-xl font-bold text-white mt-4 tracking-tight">
                    {sc.name}
                  </h4>
                  <div className="text-xs text-slate-400 font-medium mb-3">
                    {sc.full}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sc.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60">
                  <Link
                    to={`/analyze?scheme=${sc.id}`}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>Launch Analysis Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
