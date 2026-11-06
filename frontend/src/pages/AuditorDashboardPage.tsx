import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import { DistrictRankingItem } from '../types';

export const AuditorDashboardPage: React.FC = () => {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('KARNATAKA');
  const [rankings, setRankings] = useState<DistrictRankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const list = await apiService.getStates();
        setStates(list);
        if (list.includes('KARNATAKA')) {
          setSelectedState('KARNATAKA');
        } else if (list.length > 0) {
          setSelectedState(list[0]);
        }
      } catch (err: any) {
        console.error('Failed to load state list:', err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await apiService.getDistrictRankings(selectedState, 'MGNREGA', 'district');
        setRankings(res.rankings);
      } catch (err: any) {
        console.error(`Failed to load ranking for ${selectedState}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [selectedState]);

  const filtered = rankings.filter((d) => {
    const matchesSearch = d.district.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || d.risk_level === tierFilter;
    return matchesSearch && matchesTier;
  });

  const criticalCount = rankings.filter(r => r.risk_level === 'CRITICAL').length;
  const highCount = rankings.filter(r => r.risk_level === 'HIGH').length;
  const mediumCount = rankings.filter(r => r.risk_level === 'MEDIUM').length;
  const lowCount = rankings.filter(r => r.risk_level === 'LOW').length;

  const getTierBadge = (level: string) => {
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

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-saffron)]">
                Field Audit Management
              </span>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                FY 2018-19 to 2025-26
              </span>
            </div>
            <h1 className="text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
              Auditor Triage Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Screening queue ranked by combined statistical anomaly score and statutory norm violations. Use this view to prioritize districts for field inspection.
            </p>
          </div>

          {/* State Selector */}
          <div className="flex items-center space-x-3 bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-line)]">
            <span className="text-xs font-bold text-slate-500 pl-2">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-white text-xs font-bold text-[var(--color-ink)] px-3 py-2 rounded-xl border border-[var(--color-line)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
            >
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--color-line)] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Districts Evaluated</span>
            <div className="text-3xl font-black text-[var(--color-ink)] tabular-nums mt-1">
              {rankings.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">State annual snapshots aggregated</span>
          </div>

          <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs bg-red-50/30">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Critical Priority</span>
            <div className="text-3xl font-black text-red-700 tabular-nums mt-1">
              {criticalCount}
            </div>
            <span className="text-[11px] text-red-600 mt-0.5 block">Immediate inspection recommended</span>
          </div>

          <div className="bg-white border border-orange-200 rounded-2xl p-5 shadow-xs bg-orange-50/30">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">High Priority</span>
            <div className="text-3xl font-black text-orange-700 tabular-nums mt-1">
              {highCount}
            </div>
            <span className="text-[11px] text-orange-600 mt-0.5 block">Desk verification recommended</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medium / Low</span>
            <div className="text-3xl font-black text-slate-700 tabular-nums mt-1">
              {mediumCount + lowCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Standard cycle verification</span>
          </div>
        </div>

        {/* Triage Queue Table */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-ink)]">
                Audit Screening Priority Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filtered.length} of {rankings.length} districts in {selectedState}. Ranked from highest anomaly score.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search district..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)] w-44"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs font-bold bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Tiers</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-navy)] mx-auto mb-2" />
              <p className="text-xs text-slate-500">Ranking districts by anomaly priority...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Priority #</th>
                    <th className="py-3 px-3">District</th>
                    <th className="py-3 px-3">Risk Tier</th>
                    <th className="py-3 px-3 text-right">Anomaly Score</th>
                    <th className="py-3 px-3 text-right">Total Exp (₹ Cr)</th>
                    <th className="py-3 px-3 text-right">Persondays (M)</th>
                    <th className="py-3 px-3 text-right">Cost / Day</th>
                    <th className="py-3 px-3 text-right">Material %</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {filtered.map((item, idx) => (
                    <tr key={item.district} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[var(--color-ink)]">
                        {item.district}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(item.risk_level)}`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[var(--color-ink)] tabular-nums">
                        {item.risk_score.toFixed(1)} / 100
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">
                        ₹{(item.total_expenditure_cr ?? item.total_expenditure_lakhs / 100).toFixed(2)} Cr
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">
                        {((item.total_persondays ?? 0) / 1000000).toFixed(2)} M
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-slate-700">
                        ₹{(item.cost_per_day ?? 0).toFixed(1)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums font-medium text-slate-700">
                        {((item.material_ratio ?? 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Link
                          to={`/analysis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(item.district)}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[var(--color-navy)] hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          <span>Deep Dive</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--color-line)] text-right">
            <span className="text-[11px] text-slate-400">
              A flag is not proof of fraud. It means: check this first. Decisions stay with human auditors.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
