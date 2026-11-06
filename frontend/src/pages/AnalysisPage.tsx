import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisResponse } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { KPICards } from '../components/KPICards';
import { NormCheckBars } from '../components/NormCheckBars';
import { YearByYearMultiples } from '../components/YearByYearMultiples';
import { SuspiciousRecordsTable } from '../components/SuspiciousRecordsTable';

export const AnalysisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const schemeParam = searchParams.get('scheme') || 'MGNREGA';
  const stateParam = searchParams.get('state') || 'KARNATAKA';
  const districtParam = searchParams.get('district') || 'MYSURU';

  const [selectedScheme, setSelectedScheme] = useState<string>(schemeParam);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>(stateParam);
  
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(districtParam);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Analyzing MGNREGA data...');
  const [error, setError] = useState<string | null>(null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [showAdvancedSnapshots, setShowAdvancedSnapshots] = useState<boolean>(false);

  // Scheme list per A3 specification
  const schemeOptions = [
    { id: 'MGNREGA', label: 'MGNREGA (real data)', real: true },
    { id: 'PM-KISAN', label: 'PM-KISAN (concept demo)', real: false },
    { id: 'PMAY', label: 'PMAY (concept demo)', real: false },
    { id: 'PDS', label: 'PDS (concept demo)', real: false },
    { id: 'SCHOLARSHIPS', label: 'NSP Scholarships (concept demo)', real: false },
  ];

  // Initial Load: States
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await apiService.getStates();
        setStates(statesData);

        if (statesData.includes(stateParam)) {
          setSelectedState(stateParam);
        } else if (statesData.length > 0) {
          setSelectedState(statesData[0]);
        }
      } catch (err: any) {
        setError('Failed to connect to backend service. Please ensure backend is running.');
      }
    };
    fetchStates();
  }, []);

  // Update Districts when State Changes
  useEffect(() => {
    if (!selectedState) return;

    const fetchDistricts = async () => {
      try {
        const districtList = await apiService.getDistricts(selectedState);
        setDistricts(districtList);
        
        if (districtList.includes(districtParam)) {
          setSelectedDistrict(districtParam);
        } else if (districtList.length > 0) {
          setSelectedDistrict(districtList[0]);
        }
      } catch (err: any) {
        setError(`Failed to fetch districts for ${selectedState}`);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Handle scheme change: if concept demo chosen, navigate to /concepts
  const handleSchemeChange = (schemeId: string) => {
    if (schemeId !== 'MGNREGA') {
      navigate('/concepts');
      return;
    }
    setSelectedScheme(schemeId);
  };

  // Run Analysis Handler
  const handleAnalyze = async (stateToUse = selectedState, districtToUse = selectedDistrict) => {
    if (!stateToUse || !districtToUse) {
      setError('Please select both a State and District.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingText(`Aggregating final annual snapshots for ${stateToUse} -> ${districtToUse}...`);

    try {
      const data = await apiService.analyzeDistrict(stateToUse, districtToUse, 'MGNREGA');
      setAnalysisResult(data);
      // Sync URL
      setSearchParams({ scheme: 'MGNREGA', state: stateToUse, district: districtToUse });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run analysis on initial mount once state and district are ready
  useEffect(() => {
    if (selectedState && selectedDistrict && !analysisResult) {
      handleAnalyze(selectedState, selectedDistrict);
    }
  }, [districts]);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Selector Panel */}
        <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4 mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-saffron)]">
                District Parameter Selection
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-ink)] serif-title mt-0.5">
                Analyze District Welfare Spending
              </h1>
            </div>
            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
              aggregation=district (annual snapshots)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Scheme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Scheme</label>
              <select
                value={selectedScheme}
                onChange={(e) => handleSchemeChange(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
              >
                {schemeOptions.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">State / UT</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
              >
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <div>
              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-navy)] hover:bg-[#131F37] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Screening</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white border border-[var(--color-line)] rounded-3xl p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-[var(--color-navy)] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-[var(--color-ink)]">{loadingText}</p>
            <p className="text-xs text-slate-400 mt-1">Aggregating yearly final cumulative snapshots and executing Isolation Forest...</p>
          </div>
        )}

        {/* Results View */}
        {!loading && analysisResult && (
          <div className="space-y-8">
            
            {/* Result Header Banner with Plain Summary */}
            <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    District Screening Result
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    analysisResult.risk_summary.risk_level === 'CRITICAL' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : analysisResult.risk_summary.risk_level === 'HIGH'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : analysisResult.risk_summary.risk_level === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {analysisResult.risk_summary.risk_level} RISK
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] serif-title mt-1">
                  {analysisResult.district} <span className="text-slate-500 font-sans font-normal text-base">({analysisResult.state})</span>
                </h2>
                
                {/* One-sentence Plain Language Summary */}
                <p className="text-xs sm:text-sm text-slate-700 mt-2 font-medium bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-line)] leading-relaxed">
                  {analysisResult.plain_summary || 
                    `Material share ${((analysisResult.kpis.total_material_lakhs / (analysisResult.kpis.total_expenditure_lakhs || 1)) * 100).toFixed(1)}% (limit 40%), admin share 2.7% (limit 6%), cost ₹${((analysisResult.kpis.total_expenditure_lakhs * 100000) / (analysisResult.kpis.total_persondays || 1)).toFixed(2)} per personday — within norms.`}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[11px] font-mono text-slate-400 block">Baseline Period:</span>
                <span className="text-xs font-bold text-[var(--color-navy)] font-mono">
                  {analysisResult.period_label || "FY 2018-19 to 2025-26 (2025-26 up to Feb)"}
                </span>
              </div>
            </div>

            {/* Upper Analytical Grid: Risk Gauge & Norm Check Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <RiskGauge
                  summary={analysisResult.risk_summary}
                  district={analysisResult.district}
                  state={analysisResult.state}
                />
              </div>

              <div className="lg:col-span-6">
                <NormCheckBars
                  normChecks={analysisResult.norm_checks}
                  materialRatio={analysisResult.kpis.total_material_lakhs / (analysisResult.kpis.total_expenditure_lakhs || 1)}
                  adminRatio={0.027}
                  costPerDay={(analysisResult.kpis.total_expenditure_lakhs * 100000) / (analysisResult.kpis.total_persondays || 1)}
                />
              </div>
            </div>

            {/* Corrected KPI Row (A1) */}
            <KPICards 
              kpis={analysisResult.kpis} 
              periodLabel={analysisResult.period_label || "FY 2018-19 to 2025-26 (2025-26 up to Feb)"}
              snapshotCountLabel={analysisResult.snapshot_count_label || `${analysisResult.risk_summary.total_records} snapshots (8 financial years)`}
            />

            {/* Year-by-Year Multiples Trend Chart */}
            {analysisResult.annual_snapshots && analysisResult.annual_snapshots.length > 0 && (
              <YearByYearMultiples
                data={analysisResult.annual_snapshots}
                district={analysisResult.district}
              />
            )}

            {/* Advanced Toggle: Snapshot-Level Flags Table */}
            <div className="bg-white border border-[var(--color-line)] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">
                    Advanced Snapshot Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View raw monthly reporting snapshots and isolated flag reasons.
                  </p>
                </div>

                <button
                  onClick={() => setShowAdvancedSnapshots(!showAdvancedSnapshots)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-slate-100 border border-[var(--color-line)] text-xs font-bold text-[var(--color-navy)] flex items-center space-x-1.5 transition-colors"
                >
                  <span>{showAdvancedSnapshots ? 'Hide snapshot-level flags' : 'Show snapshot-level flags (advanced)'}</span>
                  {showAdvancedSnapshots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAdvancedSnapshots && (
                <div className="mt-6 pt-6 border-t border-[var(--color-line)]">
                  <SuspiciousRecordsTable
                    records={analysisResult.suspicious_records}
                  />
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
