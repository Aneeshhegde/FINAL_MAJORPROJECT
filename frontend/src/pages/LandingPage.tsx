import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart4, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  FileText,
  Sliders,
  Scale,
  AlertTriangle,
  Landmark,
  Building2,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { 
      num: '01', 
      title: 'Read Data', 
      desc: '389,831 cumulative district snapshots from data.gov.in, parsed and deduplicated by financial year.',
      icon: FileText
    },
    { 
      num: '02', 
      title: 'Compute 4 Ratios', 
      desc: 'Material share (x1), Admin share (x2), Wage share (x3), and Unit cost ₹ per personday (x4).',
      icon: Sliders
    },
    { 
      num: '03', 
      title: 'Rules + Anomaly Score', 
      desc: 'Checks the 40% material ceiling and the 6% administrative limit alongside Isolation Forest score.',
      icon: Scale
    },
    { 
      num: '04', 
      title: 'Ranked Flags with Reasons', 
      desc: 'Flags district spending that breaks expenditure norms or looks statistically unusual — for human review.',
      icon: AlertTriangle
    }
  ];

  const schemeConcepts = [
    {
      id: 'PM-KISAN',
      name: 'PM-KISAN',
      full: 'Pradhan Mantri Kisan Samman Nidhi',
      tag: 'Concept demo · simulated',
      desc: 'Detects multi-beneficiary fan-in to identical bank accounts and rapid disbursement clustering.',
      icon: Landmark
    },
    {
      id: 'PMAY',
      name: 'PMAY',
      full: 'Pradhan Mantri Awas Yojana',
      tag: 'Concept demo · simulated',
      desc: 'Tracks geo-tag coordinate spatial drift between construction milestones and severe inactivity stalls.',
      icon: Building2
    },
    {
      id: 'PDS',
      name: 'PDS',
      full: 'Public Distribution System',
      tag: 'Concept demo · simulated',
      desc: 'Screens for abrupt 48-hour quota off-take spikes and anomalous ePOS offline exemption rates.',
      icon: ShoppingBag
    },
    {
      id: 'NSP',
      name: 'NSP',
      full: 'National Scholarship Portal',
      tag: 'Concept demo · simulated',
      desc: 'Flags duplicate active biometric enrolments across universities and unverified institute rosters.',
      icon: GraduationCap
    }
  ];

  // Illustration tiles for animated grid
  const illustrationTiles = [
    { name: 'Kolar', score: 38, flagged: false },
    { name: 'Mysuru', score: 45, flagged: true, delay: 0.4 },
    { name: 'Mandya', score: 28, flagged: false },
    { name: 'Belagavi', score: 62, flagged: true, delay: 0.8 },
    { name: 'Ballari', score: 32, flagged: false },
    { name: 'Raichur', score: 71, flagged: true, delay: 1.2 },
    { name: 'Hassan', score: 24, flagged: false },
    { name: 'Tumakuru', score: 35, flagged: false },
    { name: 'Shivamogga', score: 29, flagged: false },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] selection:bg-[var(--color-saffron)] selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[var(--color-line)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Honest Scheme Status Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[var(--color-green)]"></span>
                <span>MGNREGA: real data analysed · PM-KISAN, PMAY, PDS, NSP: concept demos (simulated)</span>
              </div>

              {/* Serif Title & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--color-ink)] serif-title tracking-tight leading-tight">
                  Welfare Expenditure Anomaly Screening
                </h1>
                <p className="text-lg sm:text-xl text-[var(--color-saffron)] font-bold">
                  Helps auditors decide where to look first.
                </p>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                  Flags district spending that breaks expenditure norms or looks statistically unusual — for human review. Built on transparent statutory accounting limits and unsupervised machine learning.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/live-demo"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[var(--color-saffron)] hover:bg-[#D4781E] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-xs transition-colors"
                >
                  <span>Try the live demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/analysis"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[var(--color-navy)] font-bold text-sm border-2 border-[var(--color-navy)] flex items-center justify-center space-x-2 transition-colors"
                >
                  <BarChart4 className="w-4 h-4" />
                  <span>Explore MGNREGA districts</span>
                </Link>
              </div>

              {/* Micro Disclaimer */}
              <p className="text-[11px] text-slate-500 italic">
                * A flag indicates an anomaly for auditor review, not verified fraud. Decisions stay with human auditors.
              </p>
            </div>

            {/* Right Column: Mini District Tile Grid Preview (Illustration) */}
            <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-3xl p-6 shadow-xs relative">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-navy)]" />
                  <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
                    District Screening Grid
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded uppercase">
                  Illustration
                </span>
              </div>

              {/* 3x3 Tile Grid */}
              <div className="grid grid-cols-3 gap-3">
                {illustrationTiles.map((t) => (
                  <motion.div
                    key={t.name}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                      t.flagged 
                        ? 'bg-amber-50/80 border-amber-200' 
                        : 'bg-white border-slate-200'
                    }`}
                    initial={shouldReduceMotion ? {} : { scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: t.delay ?? 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--color-ink)] truncate">{t.name}</span>
                      {t.flagged && (
                        <motion.div
                          animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2.2, delay: t.delay ?? 0 }}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-saffron)]" />
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-[11px] font-mono font-bold tabular-nums text-slate-700">
                        {t.score}/100
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-[11px] text-slate-500">
                <span>Karnataka Sample View</span>
                <span className="text-amber-700 font-semibold">3 Flagged for review</span>
              </div>
            </div>

          </div>

          {/* Four Honest Stat Tiles */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tabular-nums">389,831</div>
              <div className="text-xs text-slate-500 font-medium mt-1">records analysed</div>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[var(--color-navy)] tabular-nums">741</div>
              <div className="text-xs text-slate-500 font-medium mt-1">districts</div>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tabular-nums">34</div>
              <div className="text-xs text-slate-500 font-medium mt-1">States/UTs</div>
            </div>
            <div className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-[var(--color-saffron)] mt-1">1 real · 4 concepts</div>
              <div className="text-xs text-slate-500 font-medium mt-1">1 real-data scheme + 4 concept demos</div>
            </div>
          </div>

        </div>
      </section>

      {/* "How It Works" 4-Step Animated Stepper */}
      <section className="py-16 sm:py-20 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-[var(--color-saffron)] uppercase tracking-wider">
              Auditor Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] serif-title mt-1">
              How the Screening Engine Works
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Statutory 40% material ceiling, 6% administrative limit, and machine learning anomaly scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div 
                  key={st.num} 
                  className="bg-white border border-[var(--color-line)] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[var(--color-navy)] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">
                        STEP {st.num}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[var(--color-navy)]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-ink)] mt-3">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* "What It Can and Cannot Do" Two-Column Card */}
      <section className="py-16 sm:py-20 border-b border-[var(--color-line)] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Transparency & Limits
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
              What GovGuard AI Can and Cannot Do
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* What it CAN do */}
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[var(--color-green)] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>What It Can Do</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[var(--color-green)]">✓</span>
                  <span><strong>Rank districts objectively:</strong> Sorts 741 districts so auditors allocate finite field inspection resources where anomalies are densest.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[var(--color-green)]">✓</span>
                  <span><strong>Explain top drivers:</strong> Details exactly why a flag was raised (e.g., material share &gt; 40%, admin &gt; 6%, or unit cost outlier).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[var(--color-green)]">✓</span>
                  <span><strong>Re-screen incoming data:</strong> Ingests new financial year reports and recomputes multi-year baseline drift automatically.</span>
                </li>
              </ul>
            </div>

            {/* What it CANNOT do */}
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <XCircle className="w-5 h-5 shrink-0 text-amber-700" />
                <span>What It Cannot Do</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-amber-700">✗</span>
                  <span><strong>Cannot prove fraud:</strong> A high anomaly score is screening evidence of statistical deviation, never conclusive legal proof.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-amber-700">✗</span>
                  <span><strong>Cannot catch ratio-invariant irregularities:</strong> Collusion that inflates wages and materials in perfect proportion will not violate ratios.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-amber-700">✗</span>
                  <span><strong>Cannot replace field investigation:</strong> Ground truth verification by certified human auditors remains strictly mandatory.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="text-center mt-6">
            <Link
              to="/about"
              className="text-xs font-bold text-[var(--color-navy)] hover:underline inline-flex items-center space-x-1"
            >
              <span>Read the complete technical methodology and evaluation metrics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Scheme Concepts Teaser Strip (Part C links) */}
      <section className="py-16 sm:py-20 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-saffron)]">
                Generalization Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
                Scheme Concept Demonstrations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Simulated animated walkthroughs illustrating how the screening architecture applies beyond MGNREGA.
              </p>
            </div>

            <Link
              to="/concepts"
              className="mt-4 md:mt-0 text-xs font-bold text-[var(--color-navy)] hover:text-[var(--color-saffron)] flex items-center space-x-1"
            >
              <span>Explore all 4 simulated scenarios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {schemeConcepts.map((sc) => {
              const Icon = sc.icon;
              return (
                <div 
                  key={sc.id} 
                  className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[var(--color-navy)] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {sc.tag}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>

                    <h4 className="text-lg font-bold text-[var(--color-ink)] mt-3">
                      {sc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mb-2">
                      {sc.full}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sc.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--color-line)]">
                    <Link
                      to={`/concepts`}
                      className="text-xs font-bold text-[var(--color-navy)] hover:text-[var(--color-saffron)] flex items-center space-x-1"
                    >
                      <span>Watch Concept Demo</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
