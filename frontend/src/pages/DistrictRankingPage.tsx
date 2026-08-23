import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  Search,
  AlertCircle,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';
import { apiService } from '../services/api';
import { DistrictRankingItem } from '../types';

export const DistrictRankingPage: React.FC = () => {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('KARNATAKA');
  const [selectedScheme, setSelectedScheme] = useState<string>('MGNREGA');
  const [rankings, setRankings] = useState<DistrictRankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const schemeOptions = [
    { id: 'MGNREGA', label: 'MGNREGA (Rural Employment)' },
    { id: 'PM-KISAN', label: 'PM-KISAN (Farmer Income)' },
    { id: 'PMAY', label: 'PMAY (Housing Assistance)' },
    { id: 'PDS', label: 'PDS (Food Security / Ration)' },
    { id: 'SCHOLARSHIPS', label: 'NSP Scholarships' }
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

    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getDistrictRankings(selectedState, selectedScheme);
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

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return '#ef4444';
    if (score >= 55) return '#f97316';
    if (score >= 30) return '#f59e0b';
    return '#10b981';
  };

  // Top 10 for bar chart
  const top10ChartData = rankings.slice(0, 10).map(r => ({
    name: r.district,
    score: r.risk_score,
    anomalies: r.anomalies
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & State/Scheme Filters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  State-Wide Risk Intelligence
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                District Anomaly Risk Rankings
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Ranked evaluation of all districts in the selected state based on ML anomaly rates and statutory violations.
              </p>
            </div>

            {/* Scheme & State Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Scheme Dropdown */}
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {schemeOptions.map((sc) => (
                    <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                      {sc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Dropdown */}
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {states.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Summary Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Districts Evaluated</span>
              <div className="text-2xl font-bold text-white mt-1">{rankings.length}</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Highest Risk District ({selectedScheme})</span>
              <div className="text-2xl font-bold text-red-400 mt-1">
                {rankings[0]?.district || 'N/A'} ({rankings[0]?.risk_score || 0}/100)
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Lowest Risk District ({selectedScheme})</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {rankings[rankings.length - 1]?.district || 'N/A'} ({rankings[rankings.length - 1]?.risk_score || 0}/100)
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start space-x-3 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-sm text-red-200">Error Loading Rankings</span>
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-sm font-medium">Calculating {selectedScheme} risk rankings across {selectedState}...</span>
          </div>
        )}

        {!loading && rankings.length > 0 && (
          <>
            {/* Top 10 High-Risk Districts Bar Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Top 10 Highest Risk Districts ({selectedScheme} - {selectedState})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated via scheme anomaly decision functions and statutory expenditure norms
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                  Priority Action List
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10ChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" name="Anomaly Risk Score" radius={[6, 6, 0, 0]}>
                      {top10ChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complete Ranking Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Complete State Ranking Table ({selectedScheme})
                  </h3>
                  <p className="text-xs text-slate-400">
                    All {rankings.length} districts in {selectedState}
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter district name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">Risk Classification</th>
                      <th className="py-3 px-4">Flagged Anomalies</th>
                      <th className="py-3 px-4">Anomaly Rate</th>
                      <th className="py-3 px-4">Total Audited Records</th>
                      <th className="py-3 px-4">Total Expenditure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRankings.map((dist) => (
                      <tr key={dist.district} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-white">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            dist.rank === 1 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            dist.rank === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            dist.rank === 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {dist.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {dist.district}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-sm">
                          <span className={dist.risk_score >= 60 ? 'text-red-400' : dist.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400'}>
                            {dist.risk_score}/100
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(dist.risk_level)}`}>
                            {dist.risk_level}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {dist.anomalies.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-300">
                          {dist.anomaly_rate}%
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {dist.total_records.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          ₹{(dist.total_expenditure_lakhs / 100).toFixed(2)} Cr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};
