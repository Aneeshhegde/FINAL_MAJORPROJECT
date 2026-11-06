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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Historical Anomaly Trend (2018–2026)
            </h3>
            <p className="text-xs text-slate-500">
              Annual anomaly detection volume & risk trajectory
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            Temporal Analysis
          </span>
        </div>

        <div className="h-64 w-full">
          {historicalTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
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
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No historical temporal data available
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Risk Level Distribution (Donut) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Risk Level Composition
            </h3>
            <p className="text-xs text-slate-500">
              Proportion of audited records by risk severity
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
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
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Comparative District vs State Average */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Comparative Benchmark (District vs. State Average)
            </h3>
            <p className="text-xs text-slate-500">
              Statistical deviation of key operational ratios against state-wide medians
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
            Statutory Norms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {comparativeAnalytics.map((item, idx) => {
            const isNegative = item.deviation_pct < 0;
            const isCritical = item.status === 'Violation' || item.status === 'Excessive';
            
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-medium text-slate-500 block truncate">
                  {item.metric}
                </span>
                
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-bold text-slate-900">
                    {item.district_value}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    State: {item.state_average}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <span className={`text-xs font-bold ${
                    isCritical ? 'text-red-600' : isNegative ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {item.deviation_pct > 0 ? `+${item.deviation_pct}%` : `${item.deviation_pct}%`} dev.
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isCritical 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
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
