import React from 'react';
import { ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
import { RiskSummary } from '../types';

interface RiskGaugeProps {
  summary: RiskSummary;
  district: string;
  state: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ summary, district, state }) => {
  const { risk_score, risk_level, total_records, anomalies_detected, anomaly_rate } = summary;

  // Determine color theme based on risk level
  const getTheme = () => {
    switch (risk_level) {
      case 'CRITICAL':
        return {
          bg: 'from-rose-500/20 to-red-600/10 border-red-500/30 glow-red',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          gaugeColor: '#ef4444',
          icon: Flame
        };
      case 'HIGH':
        return {
          bg: 'from-orange-500/20 to-amber-600/10 border-orange-500/30 glow-amber',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          gaugeColor: '#f97316',
          icon: AlertTriangle
        };
      case 'MEDIUM':
        return {
          bg: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30 glow-amber',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gaugeColor: '#f59e0b',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 glow-emerald',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          gaugeColor: '#10b981',
          icon: ShieldCheck
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  // SVG Gauge calculations (Semi-circle arc: r=65, length = pi*65 = 204.2)
  const arcLength = 204.2;
  const strokeDashoffset = Math.max(0, arcLength - (risk_score / 100) * arcLength);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} border p-6 sm:p-8 backdrop-blur-xl shadow-2xl`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              District Anomaly Assessment
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}>
              {risk_level} RISK
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {district} <span className="text-slate-400 font-normal text-lg">({state})</span>
          </h2>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
          <Icon className={`w-6 h-6 ${theme.text} shrink-0`} />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Model Anomaly Status</div>
            <div className={`text-sm font-bold ${theme.text}`}>
              {risk_level === 'LOW' ? 'Normal Activity Profile' : 'Suspicious Patterns Detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Semi-circular Gauge (Clean SVG, No Text Overlap) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
          <div className="relative w-64 h-36 flex items-center justify-center">
            <svg className="w-64 h-36" viewBox="0 0 160 95">
              {/* Background Arc */}
              <path
                d="M 15 85 A 65 65 0 0 1 145 85"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Active Risk Arc */}
              <path
                d="M 15 85 A 65 65 0 0 1 145 85"
                fill="none"
                stroke={theme.gaugeColor}
                strokeWidth="14"
                strokeDasharray="204.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute top-12 flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {risk_score}
                <span className="text-base text-slate-400 font-normal">/100</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Anomaly Risk Score
              </span>
            </div>
          </div>

          <div className="text-center mt-3 px-4">
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Derived from multi-variate Isolation Forest decision boundaries and statutory compliance rules.
            </p>
          </div>
        </div>

        {/* Key Indicators Summary Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Suspicious Records</span>
            <div className="text-2xl font-black text-white mt-1">
              {anomalies_detected.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Flagged by Isolation Forest</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Anomaly Rate</span>
            <div className={`text-2xl font-black mt-1 ${theme.text}`}>
              {anomaly_rate}%
            </div>
            <span className="text-[10px] text-slate-500">Of total district records</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Audited Rows</span>
            <div className="text-2xl font-black text-white mt-1">
              {total_records.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Monthly reporting cycles</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Statutory Rule Flags</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {summary.rules_violated_count.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Wage/material deviations</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">High Risk Severity</span>
            <div className="text-2xl font-black text-red-400 mt-1">
              {summary.high_risk_records.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Score &ge; 60/100</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Assessment Status</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ML Verified</span>
            </div>
            <span className="text-[10px] text-slate-500">Continuous Monitoring</span>
          </div>
        </div>

      </div>
    </div>
  );
};
