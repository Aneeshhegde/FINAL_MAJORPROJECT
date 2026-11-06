import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { SuspiciousRecord } from '../types';

interface SuspiciousRecordsTableProps {
  records: SuspiciousRecord[];
  district?: string;
  state?: string;
}

export const SuspiciousRecordsTable: React.FC<SuspiciousRecordsTableProps> = ({ 
  records
}) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter records
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.record_id.toLowerCase().includes(search.toLowerCase()) ||
      rec.financial_year.toLowerCase().includes(search.toLowerCase()) ||
      rec.month.toLowerCase().includes(search.toLowerCase()) ||
      rec.explanation.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || rec.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs space-y-4">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-[var(--color-ink)]">
              Flagged Snapshots (Snapshot-Level Screening)
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {filteredRecords.length} flagged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual cumulative snapshots flagged by statutory rule breaches or machine learning anomaly scores.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search snapshots..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)] w-44"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-[var(--color-surface)] px-2.5 py-1.5 rounded-xl border border-[var(--color-line)] text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      {paginatedRecords.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No snapshots match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Snapshot ID</th>
                <th className="py-3 px-3">Financial Year</th>
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3">Risk Tier</th>
                <th className="py-3 px-3 text-right">Anomaly Score</th>
                <th className="py-3 px-3 text-right">Material %</th>
                <th className="py-3 px-3 text-right">Admin %</th>
                <th className="py-3 px-3 text-right">Cost / Day</th>
                <th className="py-3 px-3 text-center">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {paginatedRecords.map((rec) => {
                const isExpanded = expandedId === rec.record_id;
                const score = rec.anomaly_score ?? rec.ml_anomaly_score ?? 0;
                const adminRatio = rec.admin_ratio ?? (rec.admin_exp && rec.total_exp ? rec.admin_exp / rec.total_exp : 0);

                return (
                  <React.Fragment key={rec.record_id}>
                    <tr 
                      onClick={() => toggleExpand(rec.record_id)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {rec.record_id}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {rec.financial_year}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {rec.month}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(rec.risk_level)}`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[var(--color-ink)] tabular-nums">
                        {score.toFixed(1)} / 100
                      </td>
                      <td className={`py-3 px-3 text-right tabular-nums font-medium ${rec.material_ratio > 0.40 ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                        {(rec.material_ratio * 100).toFixed(1)}%
                      </td>
                      <td className={`py-3 px-3 text-right tabular-nums font-medium ${adminRatio > 0.06 ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
                        {(adminRatio * 100).toFixed(1)}%
                      </td>
                      <td className={`py-3 px-3 text-right tabular-nums font-medium ${rec.cost_per_day > 450 ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                        ₹{rec.cost_per_day.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className="text-slate-400 hover:text-[var(--color-navy)] transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explanation Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={9} className="p-4 border-b border-[var(--color-line)]">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-[var(--color-saffron)] mt-0.5 shrink-0" />
                              <div>
                                <span className="font-bold text-[var(--color-ink)]">Screening Explanation:</span>
                                <p className="text-slate-700 mt-0.5 leading-relaxed">
                                  {rec.explanation}
                                </p>
                              </div>
                            </div>

                            {/* Key drivers or reasons */}
                            {rec.key_drivers && rec.key_drivers.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Metric Deviations:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-2">
                                  {rec.key_drivers.map((c, ci) => (
                                    <div key={ci} className="bg-white p-2.5 rounded-xl border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-medium text-slate-600 truncate">{c.label || c.feature}</span>
                                        <span className="font-mono font-bold text-[var(--color-navy)]">
                                          {c.z_score > 0 ? `+${c.z_score.toFixed(2)}σ` : `${c.z_score.toFixed(2)}σ`}
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${Math.abs(c.z_score) > 2 ? 'bg-red-500' : 'bg-[var(--color-navy)]'}`}
                                          style={{ width: `${Math.min(100, Math.abs(c.z_score) * 25)}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-line)] text-xs text-slate-500">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[var(--color-line)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[var(--color-line)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
