import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { RiskSummary } from '../types';

interface RiskGaugeProps {
  summary: RiskSummary;
  district: string;
  state: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ summary, district, state }) => {
  const { risk_score, risk_level, total_records, anomalies_detected, anomaly_rate } = summary;

  // Determine calm institutional color theme based on risk tier
  const getTheme = () => {
    switch (risk_level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50/60 border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-300',
          gaugeColor: '#C8372D',
          statusText: 'Flagged for field verification',
          statusColor: 'text-red-700',
          icon: AlertTriangle,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50/60 border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-300',
          gaugeColor: '#E8702B',
          statusText: 'Flagged for field verification',
          statusColor: 'text-orange-700',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50/60 border-amber-200',
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          gaugeColor: '#E0A526',
          statusText: 'Flagged for field verification',
          statusColor: 'text-amber-800',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-700',
          badge: 'bg-slate-100 text-slate-700 border-slate-300',
          gaugeColor: '#2F7D5B',
          statusText: 'Expenditure within observed norms',
          statusColor: 'text-[var(--color-green)]',
          icon: ShieldCheck,
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  // SVG Gauge calculations (Semi-circle arc: r=65, length = pi*65 = 204.2)
  const arcLength = 204.2;
  const strokeDashoffset = Math.max(0, arcLength - (risk_score / 100) * arcLength);

  return (
    <div className={`relative overflow-hidden rounded-3xl ${theme.bg} border p-6 sm:p-8 shadow-xs`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-line)] pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              District Screening Dossier
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}>
              {risk_level} RISK
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
            {district} <span className="text-slate-500 font-sans font-normal text-base">({state})</span>
          </h2>
        </div>

        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-[var(--color-line)] shadow-xs">
          <Icon className={`w-5 h-5 ${theme.statusColor} shrink-0`} />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Screening Assessment</div>
            <div className={`text-xs font-bold ${theme.statusColor}`}>
              {theme.statusText}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Semi-circular Gauge (Clean SVG, No Text Overlap) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-[var(--color-line)] shadow-xs">
          <div className="relative w-64 h-36 flex items-center justify-center">
            <svg className="w-64 h-36" viewBox="0 0 160 95">
              {/* Background Arc */}
              <path
                d="M 15 85 A 65 65 0 0 1 145 85"
                fill="none"
                stroke="#E3E7ED"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Active Risk Arc */}
              <path
                d="M 15 85 A 65 65 0 0 1 145 85"
                fill="none"
                stroke={theme.gaugeColor}
                strokeWidth="12"
                strokeDasharray="204.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute top-11 flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] tabular-nums tracking-tight">
                {risk_score.toFixed(1)}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Composite Anomaly Score
              </span>
            </div>
          </div>

          <div className="text-center mt-2 px-2">
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
              Synthesized from statutory compliance rules (material ceiling & admin limits) and unsupervised Isolation Forest decision boundaries.
            </p>
          </div>
        </div>

        {/* Honest Indicators Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Flagged Snapshots</span>
            <div className="text-2xl font-black text-[var(--color-ink)] tabular-nums mt-1">
              {anomalies_detected.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Flagged by rules + anomaly score</span>
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Snapshot Flag Rate</span>
            <div className={`text-2xl font-black tabular-nums mt-1 ${theme.text}`}>
              {anomaly_rate}%
            </div>
            <span className="text-[10px] text-slate-400">Of cumulative district rows</span>
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Audited Snapshots</span>
            <div className="text-2xl font-black text-[var(--color-ink)] tabular-nums mt-1">
              {total_records.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">
              {summary.snapshot_count_label || '558 snapshots (8 financial years)'}
            </span>
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Norm Breach Count</span>
            <div className="text-2xl font-black text-[var(--color-saffron)] tabular-nums mt-1">
              {summary.rules_violated_count.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Material or admin ratio limits</span>
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">High Risk Snapshots</span>
            <div className="text-2xl font-black text-red-700 tabular-nums mt-1">
              {summary.high_risk_records.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Score ≥ 60 / 100</span>
          </div>

          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assessment Status</span>
            <div className="text-[11px] font-bold text-slate-800 mt-2 leading-tight">
              Assessment: screening result — field verification required
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Decision stays with auditor</span>
          </div>
        </div>

      </div>
    </div>
  );
};
