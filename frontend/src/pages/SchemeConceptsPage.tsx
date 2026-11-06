import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  Building2, 
  Landmark, 
  ShoppingBag, 
  GraduationCap
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CONCEPT_SCENARIOS, ConceptScenario } from '../data/conceptScenarios';

export const SchemeConceptsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pmkisan' | 'pmay' | 'pds' | 'nsp'>('pmkisan');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const shouldReduceMotion = useReducedMotion();

  const scenario: ConceptScenario = CONCEPT_SCENARIOS[activeTab];

  // Auto-play timer for steps 1..5
  useEffect(() => {
    setCurrentStep(1);
    setIsPlaying(true);
  }, [activeTab]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 5) {
          setIsPlaying(false);
          return 5;
        }
        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isPlaying, activeTab]);

  const handleReplay = () => {
    setCurrentStep(1);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Disclaimer Watermark Header */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Concept Demos — Simulated Data Only
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                This page demonstrates how the 4-step anomaly engine can generalize to other welfare schemes.
                All records, names, coordinates, and account numbers are fictitious. Not connected to any live government system.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-mono font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
            Simulated Scenarios
          </span>
        </div>

        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-line)] pb-6">
          <div>
            <span className="text-xs font-bold text-[var(--color-saffron)] uppercase tracking-wider">
              Extension Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] serif-title mt-1">
              Cross-Scheme Screening Concepts
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explore how automated anomaly screening applies across direct cash transfers, rural housing, food grains, and national scholarships.
            </p>
          </div>

          {/* Scheme Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pmkisan', label: 'PM-KISAN', icon: Landmark, tag: 'Cash Transfers' },
              { id: 'pmay', label: 'PMAY', icon: Building2, tag: 'Housing Subsidies' },
              { id: 'pds', label: 'PDS', icon: ShoppingBag, tag: 'Ration Offtake' },
              { id: 'nsp', label: 'NSP', icon: GraduationCap, tag: 'Scholarships' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[var(--color-navy)] text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-[var(--color-line)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Animation Canvas (Watermarked) */}
          <div className="lg:col-span-8 bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs relative overflow-hidden">
            
            {/* Watermark Diagonal Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden opacity-8">
              <span className="text-5xl sm:text-7xl font-black tracking-widest text-slate-800 -rotate-24 select-none whitespace-nowrap">
                SIMULATED SCENARIO
              </span>
            </div>

            {/* Canvas Header & Controls */}
            <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4 mb-4 relative z-20">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {scenario.scheme}
                  </span>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{scenario.subtitle}</p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleReplay}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Replay"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-500 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                  Step {currentStep} / 5
                </span>
              </div>
            </div>

            {/* Visual Canvas Area */}
            <div className="relative h-80 sm:h-96 w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] flex items-center justify-center p-4 overflow-hidden">
              {activeTab === 'pmkisan' && (
                <PMKisanVisual step={currentStep} reduceMotion={!!shouldReduceMotion} />
              )}
              {activeTab === 'pmay' && (
                <PMAYVisual step={currentStep} />
              )}
              {activeTab === 'pds' && (
                <PDSVisual step={currentStep} reduceMotion={!!shouldReduceMotion} />
              )}
              {activeTab === 'nsp' && (
                <NSPVisual step={currentStep} />
              )}
            </div>

            {/* Step Caption Track */}
            <div className="mt-5 space-y-3 relative z-20">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Simulation Timeline</span>
                <span className="text-[var(--color-saffron)] font-bold">
                  {currentStep === 5 ? 'Result Ready' : 'Analyzing In Flight'}
                </span>
              </div>

              {/* Step Progress Dots */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setCurrentStep(s);
                      setIsPlaying(false);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      s <= currentStep
                        ? s === 5 && currentStep === 5
                          ? 'bg-[var(--color-saffron)]'
                          : 'bg-[var(--color-navy)]'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Active Step Card */}
              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[var(--color-navy)] bg-white px-2 py-0.5 rounded border border-slate-200">
                    Step {currentStep}: {scenario.captions[currentStep - 1]?.title}
                  </span>
                  {currentStep === 5 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      FLAGGED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {scenario.captions[currentStep - 1]?.text}
                </p>
              </div>

              {/* Persistent Rule Callout at Step 5 */}
              {currentStep === 5 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 font-medium">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span><strong>Screening conclusion:</strong> Flag → reason captured → human field verification required.</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Signals & Architecture Context */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Signals Card */}
            <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[var(--color-ink)]">
                <Layers className="w-4 h-4 text-[var(--color-navy)]" />
                <h4 className="text-sm font-bold tracking-tight">Signals this demo illustrates</h4>
              </div>

              <ul className="space-y-3">
                {scenario.signals.map((sig, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-saffron)] mt-1.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-[var(--color-line)]">
                <p className="text-[11px] text-slate-400 italic">
                  Example signals; exact eligibility rules must be taken from the scheme's official guidelines.
                </p>
              </div>
            </div>

            {/* Scheme Metadata Card */}
            <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheme Implementation Scope
              </h4>
              <div className="text-sm font-bold text-[var(--color-ink)]">
                {scenario.fullName}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In a full rollout, this module interfaces with the central database export or API gateway, parses beneficiary records through scheme-tailored decision rules, and generates prioritized audit dossiers.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--color-navy)]">
                  <span>Auditor Workflow Integrated</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Section C5: Shared Screening Engine Strip at Bottom */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-8 shadow-xs">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">
              Unified Algorithmic Backbone
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--color-ink)] serif-title mt-1">
              Same 4-step architecture applies across all schemes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Whether detecting material ratio breaches in MGNREGA or multi-account clustering in PM-KISAN, GovGuard AI uses the identical four-stage screening pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Read Transactions',
                desc: 'Ingests transaction/snapshot rows with strict deduplication and schema normalization.'
              },
              {
                step: '02',
                title: 'Scheme-Specific Ratios',
                desc: 'Computes domain metrics: material shares, per-unit costs, offtake velocity, or beneficiary clustering.'
              },
              {
                step: '03',
                title: 'Rules + Anomaly Scoring',
                desc: 'Applies statutory regulatory limits alongside unsupervised Isolation Forest decision functions.'
              },
              {
                step: '04',
                title: 'Prioritized Audit Queue',
                desc: 'Ranks entities by composite risk score with transparent plain-language audit reasons for human inspectors.'
              }
            ].map((st, i) => (
              <div key={i} className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl relative">
                <span className="text-xs font-mono font-bold text-[var(--color-saffron)]">{st.step}</span>
                <h5 className="text-sm font-bold text-[var(--color-ink)] mt-1">{st.title}</h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Visual Animations for the 4 Schemes (SVG + Framer Motion)                  */
/* -------------------------------------------------------------------------- */

// C1: PM-KISAN Shared Bank Account Visual
const PMKisanVisual: React.FC<{ step: number; reduceMotion: boolean }> = ({ step, reduceMotion }) => {
  // 6 clustered beneficiaries + 3 normal beneficiaries
  const beneficiaries = [
    { id: 'B-0012', x: 120, y: 70, flagged: true },
    { id: 'B-0015', x: 80, y: 130, flagged: true },
    { id: 'B-0018', x: 100, y: 210, flagged: true },
    { id: 'B-0023', x: 150, y: 270, flagged: true },
    { id: 'B-0027', x: 220, y: 290, flagged: true },
    { id: 'B-0034', x: 220, y: 50, flagged: true },
    // Normal 1-to-1 accounts
    { id: 'B-0001', x: 420, y: 60, flagged: false },
    { id: 'B-0004', x: 490, y: 130, flagged: false },
    { id: 'B-0009', x: 450, y: 230, flagged: false },
  ];

  const targetAccount = { id: 'ACC-XXXX-77', x: 200, y: 170 };
  const normalAccounts = [
    { id: 'ACC-XXXX-01', x: 500, y: 70 },
    { id: 'ACC-XXXX-04', x: 560, y: 150 },
    { id: 'ACC-XXXX-09', x: 530, y: 240 },
  ];

  return (
    <svg className="w-full h-full max-w-2xl" viewBox="0 0 620 340">
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E3E7ED" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="620" height="340" fill="url(#grid)" />

      {/* Connection Lines (Step >= 2) */}
      {step >= 2 && (
        <g>
          {/* Normal links */}
          <line x1="420" y1="60" x2="500" y2="70" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="490" y1="130" x2="560" y2="150" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="450" y1="230" x2="530" y2="240" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Clustered links to ACC-XXXX-77 */}
          {beneficiaries.filter(b => b.flagged).map((b, i) => (
            <motion.line
              key={i}
              x1={b.x}
              y1={b.y}
              x2={targetAccount.x}
              y2={targetAccount.y}
              stroke={step >= 4 ? '#E8892B' : '#64748B'}
              strokeWidth={step >= 4 ? 2.5 : 1.5}
              initial={reduceMotion ? { opacity: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          ))}
        </g>
      )}

      {/* Normal Bank Accounts */}
      {normalAccounts.map((acc, i) => (
        <g key={i}>
          <rect x={acc.x - 30} y={acc.y - 14} width="60" height="28" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x={acc.x} y={acc.y + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748B">
            {acc.id}
          </text>
        </g>
      ))}

      {/* Target Fan-in Account (ACC-XXXX-77) */}
      <g>
        <motion.rect
          x={targetAccount.x - 45}
          y={targetAccount.y - 18}
          width="90"
          height="36"
          rx="8"
          fill={step >= 4 ? '#FEF3C7' : '#FFFFFF'}
          stroke={step >= 4 ? '#E8892B' : '#94A3B8'}
          strokeWidth={step >= 4 ? 2.5 : 1.5}
          animate={step >= 4 && !reduceMotion ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <text
          x={targetAccount.x}
          y={targetAccount.y + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill={step >= 4 ? '#92400E' : '#1E293B'}
        >
          {targetAccount.id}
        </text>
        {step >= 4 && (
          <text x={targetAccount.x} y={targetAccount.y + 30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B45309">
            ⚠️ Fan-in: 6 Beneficiaries
          </text>
        )}
      </g>

      {/* Beneficiary Nodes */}
      {beneficiaries.map((b, i) => (
        <g key={i}>
          <circle
            cx={b.x}
            cy={b.y}
            r={b.flagged && step >= 3 ? 14 : 11}
            fill={b.flagged && step >= 4 ? '#FDE68A' : '#FFFFFF'}
            stroke={b.flagged && step >= 3 ? '#E8892B' : '#94A3B8'}
            strokeWidth="2"
          />
          <text x={b.x} y={b.y + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1E293B">
            {b.id}
          </text>
        </g>
      ))}
    </svg>
  );
};

// C2: PMAY Geo-tag Drift Visual
const PMAYVisual: React.FC<{ step: number }> = ({ step }) => {
  return (
    <svg className="w-full h-full max-w-2xl" viewBox="0 0 620 340">
      <defs>
        <pattern id="grid-pmay" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E3E7ED" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="620" height="340" fill="url(#grid-pmay)" />

      {/* Simulated Map Contour / Terrain */}
      <path
        d="M 50 120 Q 200 40 350 160 T 580 180"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Foundation Pin (Stage 1) */}
      <g>
        <circle cx="160" cy="200" r="28" fill="#E0F2FE" opacity="0.4" />
        <circle cx="160" cy="200" r="14" fill="#0284C7" />
        <text x="160" y="204" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">S1</text>
        
        <rect x="100" y="225" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
        <text x="160" y="240" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0369A1">
          Stage 1: Foundation
        </text>
        <text x="160" y="254" textAnchor="middle" fontSize="8" fill="#64748B">
          (Lat 12.912, Lng 77.581)
        </text>
      </g>

      {/* Plinth Pin (Stage 2) with drift */}
      {step >= 3 && (
        <g>
          {/* Drift Vector Line */}
          <line
            x1="160"
            y1="200"
            x2="460"
            y2="100"
            stroke="#DC2626"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          <circle cx="460" cy="100" r="28" fill="#FEE2E2" opacity="0.4" />
          <circle cx="460" cy="100" r="14" fill="#DC2626" />
          <text x="460" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">S2</text>

          <rect x="400" y="125" width="120" height="40" rx="6" fill="#FFFFFF" stroke="#FECACA" strokeWidth="1" />
          <text x="460" y="140" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B91C1C">
            Stage 2: Plinth
          </text>
          <text x="460" y="154" textAnchor="middle" fontSize="8" fill="#64748B">
            (Lat 12.973, Lng 77.625)
          </text>

          {/* Drift Distance Badge */}
          <rect x="260" y="135" width="120" height="26" rx="13" fill="#DC2626" />
          <text x="320" y="152" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">
            ⚠️ 8.4 km Drift (Limit: 50m)
          </text>
        </g>
      )}

      {/* Timeline Stall Warning */}
      {step >= 2 && (
        <g>
          <rect x="220" y="30" width="200" height="32" rx="8" fill="#FEF3C7" stroke="#FDE68A" />
          <text x="320" y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400E">
            ⏳ Inactivity: 340 Days (Norm: 90 Days)
          </text>
        </g>
      )}
    </svg>
  );
};

// C3: PDS Offtake Spike & ePOS Visual
const PDSVisual: React.FC<{ step: number; reduceMotion: boolean }> = ({ step, reduceMotion }) => {
  return (
    <svg className="w-full h-full max-w-2xl" viewBox="0 0 620 340">
      <pattern id="grid-pds" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E3E7ED" strokeWidth="0.8" />
      </pattern>
      <rect width="620" height="340" fill="url(#grid-pds)" />

      {/* Quota Container Bar (25 MT) */}
      <g>
        <text x="60" y="50" fontSize="12" fontWeight="bold" fill="#1E293B">
          FPS-08 Monthly Grain Quota Consumption (25 Metric Tons)
        </text>

        {/* Outer Bar */}
        <rect x="60" y="70" width="500" height="36" rx="8" fill="#E2E8F0" />
        
        {/* Filled Portion */}
        <motion.rect
          x="60"
          y="70"
          width={step <= 2 ? 80 : step === 3 ? 380 : 490}
          height="36"
          rx="8"
          fill={step >= 4 ? '#E8892B' : '#2F7D5B'}
          animate={reduceMotion ? {} : { width: step <= 2 ? 80 : step === 3 ? 380 : 490 }}
          transition={{ duration: 0.8 }}
        />

        <text x="75" y="93" fontSize="11" fontWeight="bold" fill="#FFFFFF">
          {step <= 2 ? '16% Consumed (Days 1–14)' : '98% Consumed in 36 Hours'}
        </text>
      </g>

      {/* Authentication Breakdown */}
      {step >= 4 && (
        <g>
          <rect x="60" y="140" width="500" height="150" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          
          <text x="90" y="175" fontSize="13" fontWeight="bold" fill="#1E293B">
            Authentication Channel Breakdown (Surge Window)
          </text>

          {/* Biometric Bar */}
          <text x="90" y="210" fontSize="10" fontWeight="bold" fill="#64748B">Biometric ePOS Verified (16%)</text>
          <rect x="90" y="218" width="440" height="12" rx="6" fill="#F1F5F9" />
          <rect x="90" y="218" width="70" height="12" rx="6" fill="#2F7D5B" />

          {/* Manual Exemption Bar */}
          <text x="90" y="255" fontSize="10" fontWeight="bold" fill="#DC2626">
            Manual Exemption Override — Biometrics Bypassed (84%)
          </text>
          <rect x="90" y="263" width="440" height="12" rx="6" fill="#F1F5F9" />
          <rect x="90" y="263" width="370" height="12" rx="6" fill="#DC2626" />
        </g>
      )}
    </svg>
  );
};

// C4: NSP Dual Enrollment Visual
const NSPVisual: React.FC<{ step: number }> = ({ step }) => {
  return (
    <svg className="w-full h-full max-w-2xl" viewBox="0 0 620 340">
      <pattern id="grid-nsp" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E3E7ED" strokeWidth="0.8" />
      </pattern>
      <rect width="620" height="340" fill="url(#grid-nsp)" />

      {/* Institute A Column */}
      <g>
        <rect x="50" y="40" width="220" height="250" rx="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="50" y="40" width="220" height="42" rx="16" fill="#1B2A4A" />
        <text x="160" y="66" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">
          INST-3 (Polytechnic College)
        </text>

        {/* Student Record Card 1 */}
        <rect x="70" y="105" width="180" height="75" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="85" y="128" fontSize="11" fontWeight="bold" fill="#0F1B2D">Student: B-0104</text>
        <text x="85" y="145" fontSize="9" fill="#64748B">Course: Diploma Civil</text>
        <text x="85" y="162" fontSize="9" fontWeight="bold" fill="#2F7D5B">Disbursed: ₹25,000</text>
      </g>

      {/* Institute B Column */}
      <g>
        <rect x="350" y="40" width="220" height="250" rx="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="350" y="40" width="220" height="42" rx="16" fill="#1B2A4A" />
        <text x="460" y="66" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">
          INST-7 (Tech Institute)
        </text>

        {/* Student Record Card 2 */}
        <rect x="370" y="105" width="180" height="75" rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="385" y="128" fontSize="11" fontWeight="bold" fill="#0F1B2D">Student: B-0104</text>
        <text x="385" y="145" fontSize="9" fill="#64748B">Course: Degree IT</text>
        <text x="385" y="162" fontSize="9" fontWeight="bold" fill="#2F7D5B">Disbursed: ₹25,000</text>
      </g>

      {/* Duplicate Matching Hash Bar (Step >= 3) */}
      {step >= 3 && (
        <g>
          <line x1="250" y1="142" x2="370" y2="142" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="4 4" />
          <rect x="250" y="128" width="120" height="28" rx="14" fill="#DC2626" />
          <text x="310" y="145" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">
            Aadhaar Hash Match
          </text>
        </g>
      )}

      {/* Step 4/5 Callout */}
      {step >= 4 && (
        <g>
          <rect x="110" y="210" width="400" height="60" rx="12" fill="#FEF2F2" stroke="#FECACA" />
          <text x="310" y="235" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#991B1B">
            ⚠️ Dual Active Enrollment Flagged
          </text>
          <text x="310" y="254" textAnchor="middle" fontSize="9" fill="#7F1D1D">
            Simultaneous full-time scholarship claimed across two distant universities.
          </text>
        </g>
      )}
    </svg>
  );
};
