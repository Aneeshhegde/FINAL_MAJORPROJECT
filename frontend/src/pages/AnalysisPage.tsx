import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Play, 
  RefreshCw, 
  MapPin, 
  Layers, 
  AlertCircle, 
  Database
} from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisResponse, SchemeInfo } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { KPICards } from '../components/KPICards';
import { AnomalyCharts } from '../components/AnomalyCharts';
import { SuspiciousRecordsTable } from '../components/SuspiciousRecordsTable';
import { ResponsibleAIDisclaimer } from '../components/ResponsibleAIDisclaimer';

export const AnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const schemeFromUrl = searchParams.get('scheme') || 'MGNREGA';

  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>(schemeFromUrl);
  
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('KARNATAKA');
  
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('MYSURU');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Analyzing MGNREGA data...');
  const [error, setError] = useState<string | null>(null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Initial Load: Schemes and States
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [schemesData, statesData] = await Promise.all([
          apiService.getSchemes(),
          apiService.getStates()
        ]);
        setSchemes(schemesData);
        setStates(statesData);

        if (statesData.includes('KARNATAKA')) {
          setSelectedState('KARNATAKA');
        } else if (statesData.length > 0) {
          setSelectedState(statesData[0]);
        }
      } catch (err: any) {
        setError('Failed to connect to backend service. Please ensure backend is running.');
      }
    };
    fetchInitialData();
  }, []);

  // Update Districts when State Changes
  useEffect(() => {
    if (!selectedState) return;

    const fetchDistricts = async () => {
      try {
        const districtList = await apiService.getDistricts(selectedState);
        setDistricts(districtList);
        
        if (districtList.includes('MYSURU')) {
          setSelectedDistrict('MYSURU');
        } else if (districtList.length > 0) {
          setSelectedDistrict(districtList[0]);
        }
      } catch (err: any) {
        setError(`Failed to fetch districts for ${selectedState}`);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Run Analysis Handler
  const handleAnalyze = async () => {
    if (!selectedState || !selectedDistrict) {
      setError('Please select both a State and District.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingText(`Filtering ${selectedState} -> ${selectedDistrict} records & executing Isolation Forest ML model...`);

    try {
      const data = await apiService.analyzeDistrict(selectedState, selectedDistrict, selectedScheme);
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run analysis on initial load once state and district are ready
  useEffect(() => {
    if (selectedState === 'KARNATAKA' && selectedDistrict === 'MYSURU' && !analysisResult && !loading) {
      handleAnalyze();
    }
  }, [districts]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Selection Control Panel Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Interactive Risk Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Welfare Scheme Anomaly Analysis
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Select an Indian State and District to run unsupervised Isolation Forest ML and statutory audits.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">
                389,831 All-India Records Indexed
              </span>
            </div>
          </div>

          {/* Form Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Scheme Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Select Scheme</span>
              </label>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {schemes.length > 0 ? (
                  schemes.map((sc) => (
                    <option key={sc.id} value={sc.id} disabled={!sc.implemented} className="bg-slate-900 text-white">
                      {sc.id} — {sc.status}
                    </option>
                  ))
                ) : (
                  <option value="MGNREGA">MGNREGA — Active</option>
                )}
              </select>
            </div>

            {/* 2. State Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Select State / UT ({states.length})</span>
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. District Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>3. Select District ({districts.length})</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={districts.length === 0}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {districts.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-900 text-white">
                    {dist}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Analyze Button CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Target: <span className="text-white font-bold">{selectedDistrict || 'None'}</span> in <span className="text-white font-bold">{selectedState || 'None'}</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedDistrict}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Data...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Anomaly Detection</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start space-x-3 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-sm text-red-200">Analysis Error</span>
              {error}
            </div>
          </div>
        )}

        {/* Loading Animation Overlay */}
        {loading && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-xl shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Analyzing MGNREGA Data...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {loadingText}
            </p>
          </div>
        )}

        {/* Dashboard Results Section */}
        {!loading && analysisResult && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 1. Main Risk Gauge Card */}
            <RiskGauge
              summary={analysisResult.risk_summary}
              district={analysisResult.district}
              state={analysisResult.state}
            />

            {/* 2. KPI Cards */}
            <KPICards kpis={analysisResult.kpis} />

            {/* 3. Anomaly & Distribution Charts */}
            <AnomalyCharts
              riskDistribution={analysisResult.risk_distribution}
              detectionMethods={analysisResult.detection_methods}
              historicalTrends={analysisResult.historical_trends}
              comparativeAnalytics={analysisResult.comparative_analytics}
            />

            {/* 4. Suspicious Records Table */}
            <SuspiciousRecordsTable
              records={analysisResult.suspicious_records}
              district={analysisResult.district}
              state={analysisResult.state}
            />

            {/* 5. Responsible AI Disclaimer Banner */}
            <ResponsibleAIDisclaimer />

          </div>
        )}

      </div>
    </div>
  );
};
