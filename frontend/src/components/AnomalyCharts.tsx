import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { HistoricalTrend, ComparativeMetric } from '../types';

interface AnomalyChartsProps {
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  detectionMethods: {
    ml_only: number;
    rules_only: number;
    both_flagged: number;
    clean_records: number;
  };
  historicalTrends: HistoricalTrend[];
  comparativeAnalytics: ComparativeMetric[];
}

export const AnomalyCharts: React.FC<AnomalyChartsProps> = ({
  riskDistribution,
  historicalTrends,
  comparativeAnalytics
}) => {
  
  // Data for Risk Distribution Donut
  const riskDonutData = [
    { name: 'Low Risk', value: riskDistribution.LOW, color: '#10b981' },
    { name: 'Medium Risk', value: riskDistribution.MEDIUM, color: '#f59e0b' },
    { name: 'High Risk', value: riskDistribution.HIGH, color: '#f97316' },
    { name: 'Critical Risk', value: riskDistribution.CRITICAL, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Multi-Year Historical Anomaly Trend (2018–2026) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Historical Anomaly Trend (2018–2026)
            </h3>
            <p className="text-xs text-slate-400">
              Annual anomaly detection volume & risk trajectory
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Temporal Analysis
          </span>
        </div>

        <div className="h-64 w-full">
          {historicalTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="anomalies" 
                  name="Flagged Anomalies"
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#anomalyGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No historical temporal data available
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Risk Level Distribution (Donut) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Risk Level Composition
            </h3>
            <p className="text-xs text-slate-400">
              Proportion of audited records by risk severity
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Segmentation
          </span>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDonutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {riskDonutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Comparative District vs State Average */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Comparative Benchmark (District vs. State Average)
            </h3>
            <p className="text-xs text-slate-400">
              Statistical deviation of key operational ratios against state-wide medians
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Statutory Norms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {comparativeAnalytics.map((item, idx) => {
            const isNegative = item.deviation_pct < 0;
            const isCritical = item.status === 'Violation' || item.status === 'Excessive';
            
            return (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <span className="text-xs font-medium text-slate-400 block truncate">
                  {item.metric}
                </span>
                
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-bold text-white">
                    {item.district_value}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    State: {item.state_average}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                  <span className={`text-xs font-bold ${
                    isCritical ? 'text-red-400' : isNegative ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {item.deviation_pct > 0 ? `+${item.deviation_pct}%` : `${item.deviation_pct}%`} dev.
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isCritical 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
