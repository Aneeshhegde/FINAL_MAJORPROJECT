import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RefreshCw, 
  Search, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ZAxis
} from 'recharts';
import { apiService } from '../services/api';
import { DistrictRankingItem } from '../types';

export const DistrictRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('KARNATAKA');
  const [selectedScheme, setSelectedScheme] = useState<string>('MGNREGA');
  const [rankings, setRankings] = useState<DistrictRankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const schemeOptions = [
    { id: 'MGNREGA', label: 'MGNREGA (real data)' },
    { id: 'PM-KISAN', label: 'PM-KISAN (concept demo)' },
    { id: 'PMAY', label: 'PMAY (concept demo)' },
    { id: 'PDS', label: 'PDS (concept demo)' },
    { id: 'SCHOLARSHIPS', label: 'NSP Scholarships (concept demo)' }
  ];

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const stateList = await apiService.getStates();
        setStates(stateList);
        if (stateList.includes('KARNATAKA')) {
          setSelectedState('KARNATAKA');
        } else if (stateList.length > 0) {
          setSelectedState(stateList[0]);
        }
      } catch (err: any) {
        setError('Failed to fetch states from backend.');
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    if (selectedScheme !== 'MGNREGA') {
      navigate('/concepts');
      return;
    }

    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Default to the corrected district-year view (aggregation="district")
        const res = await apiService.getDistrictRankings(selectedState, 'MGNREGA', 'district');
        setRankings(res.rankings);
      } catch (err: any) {
        setError(`Failed to fetch rankings for ${selectedState}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [selectedState, selectedScheme]);

  const filteredRankings = rankings.filter(r => 
    r.district.toLowerCase().includes(search.toLowerCase())
  );

  const getTierColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#C8372D';
      case 'HIGH':
        return '#E8702B';
      case 'MEDIUM':
        return '#E0A526';
      default:
        return '#8A94A6';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Horizontal bar chart data (all districts, sorted by risk score)
  const sortedHorizontalData = [...rankings]
    .sort((a, b) => b.risk_score - a.risk_score)
    .map(r => ({
      name: r.district,
      score: Number(r.risk_score.toFixed(1)),
      level: r.risk_level,
      label: `${r.risk_score.toFixed(1)} · ${r.risk_level}`,
      topDriver: r.material_ratio && r.material_ratio > 0.40 
        ? `Material ${((r.material_ratio || 0) * 100).toFixed(1)}% > 40% ceiling`
        : r.cost_per_day && r.cost_per_day > 450
        ? `Cost ₹${r.cost_per_day.toFixed(0)}/day > ₹450 norm`
        : 'Statistical anomaly boundary'
    }));

  // Scatter plot data: Material share vs Cost per personday
  const scatterData = rankings.map(r => ({
    district: r.district,
    materialPct: Number(((r.material_ratio || 0) * 100).toFixed(1)),
    costPerDay: Number((r.cost_per_day || 0).toFixed(1)),
    riskScore: Number(r.risk_score.toFixed(1)),
    level: r.risk_level,
    fill: getTierColor(r.risk_level)
  }));

  const highestRisk = rankings[0];
  const lowestRisk = rankings[rankings.length - 1];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Controls Panel */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-line)] pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-saffron)]">
                  State-Wide Risk Prioritization
                </span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                  aggregation=district (corrected annual snapshots)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
                District Anomaly Risk Rankings
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Ranked evaluation of all districts in the selected state. Prioritizes audit inspection capacity based on statutory norm breaches and machine learning decision boundaries.
              </p>
            </div>

            {/* Scheme & State Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-slate-500">Scheme:</span>
                <select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-ink)] font-bold focus:outline-none cursor-pointer"
                >
                  {schemeOptions.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-slate-500">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent text-xs text-[var(--color-ink)] font-bold focus:outline-none cursor-pointer"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Headline Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl p-4">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Districts Evaluated</span>
              <div className="text-3xl font-black text-[var(--color-ink)] tabular-nums mt-1">
                {rankings.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">State-wide coverage</span>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4">
              <span className="text-xs text-red-700 font-bold uppercase tracking-wider">Highest Risk District</span>
              <div className="text-2xl font-black text-red-700 mt-1 truncate">
                {highestRisk?.district || 'N/A'}
              </div>
              <div className="text-xs font-bold text-red-600 mt-0.5">
                {highestRisk ? `${highestRisk.risk_score.toFixed(1)} · ${highestRisk.risk_level}` : ''}
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
              <span className="text-xs text-[var(--color-green)] font-bold uppercase tracking-wider">Lowest Risk District</span>
              <div className="text-2xl font-black text-emerald-800 mt-1 truncate">
                {lowestRisk?.district || 'N/A'}
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                {lowestRisk ? `${lowestRisk.risk_score.toFixed(1)} · ${lowestRisk.risk_level}` : ''}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 text-red-700 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="p-16 text-center text-slate-500 bg-white border border-[var(--color-line)] rounded-3xl shadow-xs">
            <RefreshCw className="w-8 h-8 text-[var(--color-navy)] animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--color-ink)]">
              Computing ratio-of-sums district rankings for {selectedState}...
            </p>
          </div>
        )}

        {!loading && rankings.length > 0 && (
          <>
            {/* Visual Section: Horizontal Ranked Bar Chart + Scatter Plot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Chart 1: Sorted Horizontal Bar Chart (Scrollable) */}
              <div className="lg:col-span-6 bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="border-b border-[var(--color-line)] pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[var(--color-ink)]">
                      Sorted Risk Hierarchy ({selectedState})
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      All {rankings.length} Districts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bar color represents risk tier: Critical, High, Medium, or Low.
                  </p>
                </div>

                {/* Scrollable Container for Horizontal Bar Chart */}
                <div className="h-[480px] overflow-y-auto pr-2">
                  <ResponsiveContainer width="100%" height={Math.max(480, sortedHorizontalData.length * 28)}>
                    <BarChart
                      layout="vertical"
                      data={sortedHorizontalData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} fontSize={10} stroke="#94A3B8" />
                      <YAxis type="category" dataKey="name" fontSize={10} stroke="#1E293B" width={150} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-[var(--color-line)] shadow-md text-xs space-y-1">
                                <div className="font-bold text-[var(--color-ink)]">{d.name}</div>
                                <div className="font-mono text-slate-700">Risk Score: <strong>{d.score} / 100</strong></div>
                                <div className="text-slate-500">Tier: <strong>{d.level}</strong></div>
                                <div className="text-[11px] text-[var(--color-saffron)] font-medium pt-1 border-t border-slate-100">
                                  Top Driver: {d.topDriver}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {sortedHorizontalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getTierColor(entry.level)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Hover bar to inspect top driver</span>
                  <span className="font-medium text-slate-700">Districts are ranked for audit priority, not judged.</span>
                </div>
              </div>

              {/* Chart 2: Material Share vs Cost Per Personday Scatter Plot */}
              <div className="lg:col-span-6 bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div className="border-b border-[var(--color-line)] pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[var(--color-ink)]">
                      Material Share vs. Cost per Personday
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      Cross-Norm Scatter
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Statutory reference lines: 40% material ceiling, ₹450 norm, and ₹500 breach.
                  </p>
                </div>

                <div className="h-[480px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        type="number" 
                        dataKey="materialPct" 
                        name="Material Share" 
                        unit="%" 
                        domain={[15, 55]}
                        fontSize={10} 
                        stroke="#94A3B8"
                        label={{ value: 'Material Share (%) → Limit 40%', position: 'bottom', offset: 5, fontSize: 10 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="costPerDay" 
                        name="Cost per Day" 
                        unit="₹" 
                        domain={[200, 700]}
                        fontSize={10} 
                        stroke="#94A3B8"
                        label={{ value: 'Cost ₹ / Personday → Norm ₹450 / ₹500', angle: -90, position: 'left', offset: 0, fontSize: 10 }}
                      />
                      <ZAxis range={[70, 70]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-[var(--color-line)] shadow-md text-xs space-y-1">
                                <div className="font-bold text-[var(--color-ink)]">{d.district}</div>
                                <div>Material Share: <strong className="tabular-nums">{d.materialPct}%</strong></div>
                                <div>Unit Cost: <strong className="tabular-nums">₹{d.costPerDay}</strong></div>
                                <div>Risk Score: <strong className="tabular-nums">{d.riskScore} ({d.level})</strong></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Statutory Norm Reference Lines */}
                      <ReferenceLine x={40} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '40% Material Ceiling', fill: '#DC2626', fontSize: 10, position: 'top' }} />
                      <ReferenceLine y={450} stroke="#E0A526" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '₹450 Norm', fill: '#E0A526', fontSize: 10, position: 'right' }} />
                      <ReferenceLine y={500} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '₹500 Breach', fill: '#DC2626', fontSize: 10, position: 'right' }} />

                      <Scatter data={scatterData}>
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Quadrants outside lines warrant priority review</span>
                  <span className="font-medium text-slate-700">Districts are ranked for audit priority, not judged.</span>
                </div>
              </div>

            </div>

            {/* Complete Ranking Table */}
            <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">
                    All Evaluated Districts ({selectedState})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sorted by composite anomaly score. Click "Analyze" to inspect district snapshots.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search district name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)] w-48"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 text-center">Rank</th>
                      <th className="py-3 px-3">District</th>
                      <th className="py-3 px-3">Risk Tier</th>
                      <th className="py-3 px-3 text-right">Anomaly Score</th>
                      <th className="py-3 px-3 text-right">Expenditure (₹ Cr)</th>
                      <th className="py-3 px-3 text-right">Persondays (M)</th>
                      <th className="py-3 px-3 text-right">Cost / Day</th>
                      <th className="py-3 px-3 text-right">Material %</th>
                      <th className="py-3 px-3 text-center">Audit Deep Dive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {filteredRankings.map((dist) => (
                      <tr key={dist.district} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                          #{dist.rank}
                        </td>
                        <td className="py-3 px-3 font-bold text-[var(--color-ink)]">
                          {dist.district}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(dist.risk_level)}`}>
                            {dist.risk_level}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[var(--color-ink)] tabular-nums">
                          {dist.risk_score.toFixed(1)} / 100
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                          ₹{(dist.total_expenditure_cr ?? dist.total_expenditure_lakhs / 100).toFixed(2)} Cr
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                          {((dist.total_persondays ?? 0) / 1000000).toFixed(2)} M
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                          ₹{(dist.cost_per_day ?? 0).toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right tabular-nums font-medium ${
                          (dist.material_ratio ?? 0) > 0.40 ? 'text-red-700 font-bold' : 'text-slate-700'
                        }`}>
                          {((dist.material_ratio ?? 0) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Link
                            to={`/analysis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(dist.district)}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[var(--color-navy)] hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            <span>Analyze</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[var(--color-line)] text-right">
                <span className="text-[11px] text-slate-400">
                  Districts are ranked for audit priority, not judged. Decisions stay with human auditors.
                </span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
