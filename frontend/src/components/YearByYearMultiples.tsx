import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

interface YearTrendPoint {
  year: string;
  material_ratio: number;
  admin_ratio: number;
  cost_per_day: number;
}

interface YearByYearMultiplesProps {
  data: YearTrendPoint[];
  district: string;
}

export const YearByYearMultiples: React.FC<YearByYearMultiplesProps> = ({ data, district }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Format data for chart
  const formattedData = data.map(d => ({
    ...d,
    material_pct: Number((d.material_ratio * 100).toFixed(1)),
    admin_pct: Number((d.admin_ratio * 100).toFixed(1)),
    cost_per_day: Number(d.cost_per_day.toFixed(1))
  }));

  return (
    <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-line)] pb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)]">
            Year-by-Year Trend Multiples ({district})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Corrected annual final snapshots across FY 2018-19 to 2025-26 with statutory limits indicated.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase border border-slate-200">
          Annual Snapshots
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Material Share Multiples */}
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--color-ink)]">Material Share (%)</span>
            <span className="text-[10px] font-mono text-red-600 font-bold">Limit: 40%</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" fontSize={9} stroke="#94A3B8" />
                <YAxis domain={[0, 'auto']} fontSize={9} stroke="#94A3B8" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Material Share']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine y={40} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} />
                <Line 
                  type="monotone" 
                  dataKey="material_pct" 
                  stroke="#1B2A4A" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#1B2A4A' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Admin Share Multiples */}
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--color-ink)]">Admin Share (%)</span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">Limit: 6%</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" fontSize={9} stroke="#94A3B8" />
                <YAxis domain={[0, 'auto']} fontSize={9} stroke="#94A3B8" />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Admin Share']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine y={6} stroke="#E0A526" strokeDasharray="4 4" strokeWidth={1.5} />
                <Line 
                  type="monotone" 
                  dataKey="admin_pct" 
                  stroke="#E8892B" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#E8892B' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 3: Cost per Personday Multiples */}
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--color-ink)]">Unit Cost (₹ / Day)</span>
            <span className="text-[10px] font-mono text-red-600 font-bold">Norm: ₹450 / ₹500</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" fontSize={9} stroke="#94A3B8" />
                <YAxis domain={[0, 'auto']} fontSize={9} stroke="#94A3B8" />
                <Tooltip 
                  formatter={(val: any) => [`₹${val}`, 'Cost / Personday']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine y={450} stroke="#E0A526" strokeDasharray="4 4" strokeWidth={1.5} />
                <ReferenceLine y={500} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} />
                <Line 
                  type="monotone" 
                  dataKey="cost_per_day" 
                  stroke="#2F7D5B" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#2F7D5B' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

