import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { SuspiciousRecord } from '../types';

interface SuspiciousRecordsTableProps {
  records: SuspiciousRecord[];
  district: string;
  state: string;
}

export const SuspiciousRecordsTable: React.FC<SuspiciousRecordsTableProps> = ({ 
  records, 
  district, 
  state 
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
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // CSV Export
  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      "Record ID", "Financial Year", "Month", "State", "District", 
      "Total Exp (₹ Lakhs)", "Wages (₹ Lakhs)", "Material Exp (₹ Lakhs)", 
      "Persondays", "Cost/Day (₹)", "Material Ratio", "Wage Ratio", 
      "Anomaly Score", "Risk Level", "Explanation"
    ];
    
    const rows = records.map(r => [
      r.record_id, r.financial_year, r.month, r.state, r.district,
      r.total_exp, r.wages, r.material_exp, r.persondays, r.cost_per_day,
      r.material_ratio, r.wage_ratio, r.ml_anomaly_score, r.risk_level,
      `"${r.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mgnrega_anomalies_${state}_${district}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Suspicious Records & Anomaly Audit Log
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredRecords.length} Flagged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Records flagged by Isolation Forest decision scores and statutory compliance rules with plain-language explanations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, year, reason..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Severities</option>
              <option value="CRITICAL" className="bg-slate-900 text-red-400">Critical Risk</option>
              <option value="HIGH" className="bg-slate-900 text-orange-400">High Risk</option>
              <option value="MEDIUM" className="bg-slate-900 text-amber-400">Medium Risk</option>
              <option value="LOW" className="bg-slate-900 text-emerald-400">Low Risk</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Record ID</th>
              <th className="py-3 px-3">Period</th>
              <th className="py-3 px-3">Expenditure</th>
              <th className="py-3 px-3">Wages vs Material</th>
              <th className="py-3 px-3">Cost / Day</th>
              <th className="py-3 px-3">Anomaly Score</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-4 text-center">Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((rec) => {
                const isExpanded = expandedId === rec.record_id;
                return (
                  <React.Fragment key={rec.record_id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">
                        {rec.record_id}
                      </td>
                      <td className="py-3 px-3 font-medium text-white">
                        {rec.month} {rec.financial_year}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        ₹{rec.total_exp.toLocaleString()} L
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px]">
                          <span className="text-emerald-400">Wage: {(rec.wage_ratio * 100).toFixed(0)}%</span>
                          <span className="text-slate-500 mx-1">|</span>
                          <span className={rec.material_ratio > 0.40 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                            Mat: {(rec.material_ratio * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        <span className={rec.cost_per_day > 450 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          ₹{rec.cost_per_day.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{rec.ml_anomaly_score}</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                rec.ml_anomaly_score >= 80 ? 'bg-red-500' :
                                rec.ml_anomaly_score >= 60 ? 'bg-orange-500' :
                                rec.ml_anomaly_score >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${rec.ml_anomaly_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(rec.risk_level)}`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleExpand(rec.record_id)}
                          className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide' : 'Explain'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explanation Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-800/60 border-y border-slate-700/80">
                        <td colSpan={8} className="p-4 sm:p-5">
                          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
                                  <span>Statistical & Rule-Based Rationales</span>
                                  <span className="text-[11px] font-normal text-slate-400">
                                    (Why was this record flagged?)
                                  </span>
                                </h4>
                                
                                <p className="text-xs text-slate-300 font-medium mt-1">
                                  {rec.explanation}
                                </p>

                                {/* Detailed Reasons List */}
                                {rec.detailed_reasons.length > 1 && (
                                  <div className="mt-3 space-y-1">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                      Supporting Evidence:
                                    </span>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                                      {rec.detailed_reasons.slice(1).map((r, i) => (
                                        <li key={i}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Key Feature Drivers */}
                                {rec.key_drivers && rec.key_drivers.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-slate-800">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                      Feature Drivers & Standard Deviation Deviations (Z-Scores):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {rec.key_drivers.map((drv, i) => (
                                        <div key={i} className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-slate-300">{drv.label}</span>
                                            <span className={`font-bold ${drv.impact === 'High' ? 'text-red-400' : 'text-amber-400'}`}>
                                              {drv.z_score > 0 ? `+${drv.z_score}σ` : `${drv.z_score}σ`}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-1">
                                            Value: {drv.feature === 'cost_per_day' ? `₹${drv.value.toLocaleString()}` : `${(drv.value * 100).toFixed(1)}%`} | State Avg: {drv.feature === 'cost_per_day' ? `₹${drv.state_avg.toLocaleString()}` : `${(drv.state_avg * 100).toFixed(1)}%`}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                  No records match the current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
        <div>
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
