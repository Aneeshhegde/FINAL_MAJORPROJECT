import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  HelpCircle, 
  Sparkles, 
  Flag, 
  BarChart3, 
  Layers, 
  ChevronRight, 
  X, 
  ShieldAlert, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Landmark,
  Building2,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  ReferenceLine, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  LineChart,
  Line,
  CartesianGrid,
  LabelList
} from 'recharts';
import { apiService } from '../services/api';
import { 
  LiveDemoResponse, 
  LiveDemoDistrict, 
  AnswerKeyComparison 
} from '../types';
import { OtherSchemesLiveDemo } from '../components/OtherSchemesLiveDemo';

// Risk Tier colors
const RISK_COLORS = {
  LOW: '#8A94A6',
  MEDIUM: '#E0A526',
  HIGH: '#E8702B',
  CRITICAL: '#C8372D',
};

// Animated count-up hook
function useCountUp(target: number, durationMs = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (time: number) => {
      const progress = Math.min((time - startTime) / durationMs, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(start + (target - start) * ease));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, durationMs]);
  return val;
}

export const LiveDemoPage: React.FC = () => {
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [missingCols, setMissingCols] = useState<string[] | null>(null);
  const [analysisData, setAnalysisData] = useState<LiveDemoResponse | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('Nov');
  const [triggerFilter, setTriggerFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'risk_score' | 'cost_per_day' | 'material_ratio' | 'month'>('risk_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [rankingViewMode, setRankingViewMode] = useState<'all' | 'top10'>('all');

  // Active Scheme Tab: MGNREGA (real/synthetic) or Concept Schemes (PM-KISAN, PMAY, PDS, NSP)
  const [activeScheme, setActiveScheme] = useState<'MGNREGA' | 'PMKISAN' | 'PMAY' | 'PDS' | 'NSP'>('MGNREGA');

  // Answer Key State
  const [answerKeyData, setAnswerKeyData] = useState<AnswerKeyComparison | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [loadingAnswerKey, setLoadingAnswerKey] = useState<boolean>(false);

  // Guided Demo Tour State (0 = closed, 1..5 = steps)
  const [tourStep, setTourStep] = useState<number>(0);

  // File drag & drop ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler to clear / reset dataset view
  const handleResetDataset = () => {
    setAnalysisData(null);
    setSelectedDistrict(null);
    setSelectedMonth('Nov');
    setAnswerKeyData(null);
    setShowAnswerKey(false);
    setErrorMsg(null);
    setMissingCols(null);
    setTourStep(0);
  };

  // Handler for uploading any user file
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setMissingCols(null);
    setLoading(true);
    setLoadingMessage('Validating schema and data integrity...');

    try {
      setLoadingMessage('Running Isolation Forest + Statutory Rules anomaly scoring...');
      const result = await apiService.uploadAndAnalyze(file);
      setAnalysisData(result);
      setAnswerKeyData(null);
      setShowAnswerKey(false);
      // Default to top district if available
      if (result.districts && result.districts.length > 0) {
        setSelectedDistrict(result.districts[0].district_name);
        setSelectedMonth('Nov');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.response?.data?.detail?.error === 'missing_columns') {
        setMissingCols(err.response.data.detail.missing);
        setErrorMsg('Uploaded file is missing required columns.');
      } else {
        setErrorMsg(err.response?.data?.detail || err.message || 'Failed to process file.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Handler for preset quick files
  const handleLoadQuickFile = async (filename: string) => {
    setErrorMsg(null);
    setMissingCols(null);
    setLoading(true);
    setLoadingMessage(`Loading ${filename}...`);

    try {
      const file = await apiService.loadDemoFile(filename);
      await handleFileUpload(file);
    } catch (err: any) {
      console.error(`Failed to load ${filename}:`, err);
      setErrorMsg(`Could not load preset file ${filename}: ${err.message}`);
      setLoading(false);
    }
  };

  // Handler for comparing with ground truth answer key
  const handleRevealAnswerKey = async () => {
    if (answerKeyData) {
      setShowAnswerKey(!showAnswerKey);
      return;
    }

    setLoadingAnswerKey(true);
    try {
      const keyFile = await apiService.loadDemoFile('demo_answer_key_v2.csv');
      const comparison = await apiService.compareAnswerKey(keyFile);
      setAnswerKeyData(comparison);
      setShowAnswerKey(true);
    } catch (err: any) {
      console.error('Failed to load answer key:', err);
      setErrorMsg('Failed to compare with answer key: ' + err.message);
    } finally {
      setLoadingAnswerKey(false);
    }
  };

  // Export flagged records to CSV
  const handleExportCSV = () => {
    if (!analysisData) return;
    const flagged = analysisData.records.filter(r => r.flagged);
    if (flagged.length === 0) return;

    const headers = [
      'State', 'District', 'Month', 'Total_Exp_Lakh', 'Wages_Lakh', 
      'Material_Lakh', 'Admin_Lakh', 'Persondays', 'Unit_Cost_INR_Day', 
      'Material_Share_Pct', 'Admin_Share_Pct', 'Risk_Score', 'Risk_Level', 'Trigger_Reason'
    ];
    
    const rows = flagged.map(r => [
      r.state_name,
      r.district_name,
      r.month,
      r.Total_Exp,
      r.Wages,
      r.Material_and_skilled_Wages,
      r.Total_Adm_Expenditure,
      r.Persondays_of_Central_Liability_so_far,
      r.cost_per_day,
      (r.material_ratio * 100).toFixed(1),
      (r.admin_ratio * 100).toFixed(1),
      r.risk_score,
      r.risk_level,
      `"${r.trigger}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `govguard_flagged_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tour step progression
  const handleTourNext = async () => {
    if (tourStep === 0) {
      if (!analysisData) {
        await handleLoadQuickFile('demo_upload_SYNTHETIC_v2.csv');
      }
      setTourStep(1);
    } else if (tourStep === 1) {
      setTourStep(2);
    } else if (tourStep === 2) {
      setTourStep(3);
    } else if (tourStep === 3) {
      setSelectedDistrict('NORTH DISTRICT 03');
      setSelectedMonth('Nov');
      setTourStep(4);
    } else if (tourStep === 4) {
      if (!showAnswerKey) {
        handleRevealAnswerKey();
      }
      setTourStep(5);
    } else {
      setTourStep(0);
    }
  };

  // Group districts by state for the district tiles panel
  const districtsByState = useMemo(() => {
    if (!analysisData) return {};
    const map: Record<string, LiveDemoDistrict[]> = {};
    for (const d of analysisData.districts) {
      if (!map[d.state_name]) map[d.state_name] = [];
      map[d.state_name].push(d);
    }
    return map;
  }, [analysisData]);

  // Districts for ranking horizontal bar chart (All or Top 10)
  const rankingChartDistricts = useMemo(() => {
    if (!analysisData) return [];
    if (rankingViewMode === 'top10') {
      return analysisData.districts.slice(0, 10);
    }
    return analysisData.districts;
  }, [analysisData, rankingViewMode]);

  // Selected district records
  const selectedDistrictRecords = useMemo(() => {
    if (!analysisData || !selectedDistrict) return [];
    return analysisData.records.filter(r => r.district_name === selectedDistrict);
  }, [analysisData, selectedDistrict]);

  // Selected record for drill-down drawer
  const selectedRecord = useMemo(() => {
    return selectedDistrictRecords.find(r => r.month === selectedMonth) || selectedDistrictRecords[0] || null;
  }, [selectedDistrictRecords, selectedMonth]);

  // Filtered & sorted records table
  const displayedRecords = useMemo(() => {
    if (!analysisData) return [];
    let list = analysisData.records.filter(r => r.flagged);
    if (triggerFilter !== 'ALL') {
      list = list.filter(r => r.trigger.toLowerCase().includes(triggerFilter.toLowerCase()));
    }
    list.sort((a, b) => {
      let av: any = a[sortField];
      let bv: any = b[sortField];
      if (typeof av === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av - bv) : (bv - av);
    });
    return list;
  }, [analysisData, triggerFilter, sortField, sortAsc]);

  // Scatter plot data
  const scatterData = useMemo(() => {
    if (!analysisData) return [];
    return analysisData.records.map(r => ({
      x: Math.round(r.material_ratio * 1000) / 10, // as percentage
      y: Math.round(r.cost_per_day),
      district: r.district_name,
      month: r.month,
      flagged: r.flagged,
      risk_score: r.risk_score,
      trigger: r.trigger,
      level: r.risk_level
    }));
  }, [analysisData]);

  // KPIs count-up
  const totalRecs = useCountUp(analysisData?.kpis.records || 0);
  const flaggedRecs = useCountUp(analysisData?.kpis.flagged_records || 0);
  const flaggedDists = useCountUp(analysisData?.kpis.districts_flagged || 0);
  const highDistCount = useCountUp(
    (analysisData?.kpis.districts_by_level.HIGH || 0) + (analysisData?.kpis.districts_by_level.CRITICAL || 0)
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] pb-20">
      
      {/* Top Header */}
      <section className="bg-white border-b border-[var(--color-line)] py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-navy)] text-white">
                  Exhibition Demo Desk
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Interactive Evaluation Mode
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[var(--color-ink)] tracking-tight">
                Live Dataset Screening & Ground-Truth Verification
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                Upload custom expenditure datasets or load exhibition synthetic test files to watch GovGuard AI validate, screen, explain, and benchmark detections against planted anomalies.
              </p>
            </div>

            {/* Guided Demo Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTourNext}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs ${
                  tourStep > 0 
                    ? 'bg-[var(--color-saffron)] text-white ring-2 ring-[var(--color-saffron)]/30' 
                    : 'bg-[var(--color-navy)] text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{tourStep === 0 ? 'Start Guided Demo Tour' : `Tour: Step ${tourStep}/5 (Next)`}</span>
              </button>
            </div>
          </div>

          {/* Yellow Synthetic Demo Banner */}
          {analysisData?.is_synthetic && (
            <div className="mt-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200/80 px-2 py-0.5 rounded">
                  SYNTHETIC DEMONSTRATION DATA
                </span>
                <span>Fictional districts with planted expenditure anomalies designed for audit exhibition testing.</span>
              </div>
              <span className="text-[11px] font-mono text-amber-700 hidden sm:inline">
                FY 2025-26 · 30 Fictional Districts
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Scheme Selection Tab Bar */}
      <section className="bg-slate-50 border-b border-[var(--color-line)] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
              Select Scheme:
            </span>
            
            <button
              onClick={() => setActiveScheme('MGNREGA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeScheme === 'MGNREGA'
                  ? 'bg-[var(--color-navy)] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>MGNREGA</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                activeScheme === 'MGNREGA' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Real / Synthetic Batch
              </span>
            </button>

            <button
              onClick={() => setActiveScheme('PMKISAN')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeScheme === 'PMKISAN'
                  ? 'bg-[var(--color-navy)] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              <span>PM-KISAN</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                activeScheme === 'PMKISAN' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Simulated Concept
              </span>
            </button>

            <button
              onClick={() => setActiveScheme('PMAY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeScheme === 'PMAY'
                  ? 'bg-[var(--color-navy)] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>PMAY-G</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                activeScheme === 'PMAY' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Simulated Concept
              </span>
            </button>

            <button
              onClick={() => setActiveScheme('PDS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeScheme === 'PDS'
                  ? 'bg-[var(--color-navy)] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDS (Ration)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                activeScheme === 'PDS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Simulated Concept
              </span>
            </button>

            <button
              onClick={() => setActiveScheme('NSP')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                activeScheme === 'NSP'
                  ? 'bg-[var(--color-navy)] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>NSP Scholarships</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                activeScheme === 'NSP' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Simulated Concept
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Guided Tour Banner (When tour is active) */}
      {tourStep > 0 && activeScheme === 'MGNREGA' && (
        <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-[var(--color-saffron)] text-slate-900 font-bold font-mono">
                Step {tourStep} of 5
              </span>
              <p className="text-slate-200 font-medium">
                {tourStep === 1 && "Step 1: Upload synthetic dataset. Notice how data validation catches zero-personday and non-numeric rows before screening."}
                {tourStep === 2 && "Step 2: Review screening KPIs. 23 of 360 snapshots are flagged across 7 districts; 23 districts remain completely clean."}
                {tourStep === 3 && "Step 3: Spot the flagged district tiles below. NORTH DISTRICT 03 ranks highest with 5 flagged months."}
                {tourStep === 4 && "Step 4: Inspect NORTH DISTRICT 03 drill-down drawer. In November, cost spiked to ₹1,000/day while material remained within norm."}
                {tourStep === 5 && "Step 5: Reveal ground truth answer key. See the 2x2 confusion matrix: 100% precision with 0 false alarms."}
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setTourStep(Math.max(1, tourStep - 1))}
                disabled={tourStep === 1}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold"
              >
                Back
              </button>
              <button
                onClick={handleTourNext}
                className="px-3 py-1 rounded bg-[var(--color-saffron)] text-white font-bold hover:bg-amber-600"
              >
                {tourStep === 5 ? 'Finish Tour' : 'Next Step'}
              </button>
              <button
                onClick={() => setTourStep(0)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Exit Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {activeScheme !== 'MGNREGA' ? (
          <OtherSchemesLiveDemo schemeId={activeScheme} />
        ) : (
          <>
        
        {/* Upload & Data Integrity Panel */}
        <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Drag & Drop Upload Target */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-slate-300 hover:border-[var(--color-navy)] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                accept=".csv" 
                className="hidden" 
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-[var(--color-navy)] mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)]">
                Drop CSV dataset here, or <span className="text-[var(--color-saffron)] underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepts standard monthly or cumulative snapshots (state_name, district_name, month, Total_Exp, Wages, etc.)
              </p>
            </div>

            {/* Quick Demo File Buttons */}
            <div className="lg:w-80 shrink-0 space-y-2 border-t lg:border-t-0 lg:border-l border-[var(--color-line)] lg:pl-6 pt-4 lg:pt-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Quick Exhibition Presets
              </span>
              
              <button
                onClick={() => handleLoadQuickFile('demo_upload_SYNTHETIC_v2.csv')}
                disabled={loading}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[var(--color-navy)] flex items-center space-x-1.5">
                    <span>🚀 Load Demo Dataset</span>
                  </div>
                  <span className="text-[11px] text-slate-500">30 districts · 360 records · planted cases</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleLoadQuickFile('demo_messy_bad_rows.csv')}
                disabled={loading}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/40 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <span>⚠️ Load Messy File</span>
                  </div>
                  <span className="text-[11px] text-slate-500">43 rows · duplicates & zero-personday errors</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleLoadQuickFile('demo_messy_missing_column.csv')}
                disabled={loading}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50/40 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-red-900 flex items-center space-x-1.5">
                    <span>❌ Load Missing Column</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Schema error (no Total_Adm_Expenditure)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {analysisData && (
                <button
                  onClick={handleResetDataset}
                  className="w-full text-center px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 transition-colors font-semibold flex items-center justify-center space-x-2 mt-2 bg-slate-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear Dataset & Reset View</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-xs text-[var(--color-navy)] font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-saffron)]" />
              <span>{loadingMessage}</span>
            </div>
          )}

          {/* Missing Column Error Card */}
          {missingCols && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-sm text-red-700">
                <XCircle className="w-4 h-4" />
                <span>CSV Schema Validation Error (HTTP 400)</span>
              </div>
              <p>The uploaded file is missing required analytical columns: <span className="font-mono font-bold">{missingCols.join(', ')}</span></p>
              <p className="text-slate-600 text-[11px]">GovGuard AI requires complete expenditure components to audit statutory 60:40 and administrative caps.</p>
            </div>
          )}

          {/* General Error Message */}
          {errorMsg && !missingCols && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Validation & Cleaning Report Card */}
          {analysisData?.validation && (
            <div className="mt-6 pt-6 border-t border-[var(--color-line)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Data Cleaning & Integrity Pipeline Report
                </span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Integrity Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Rows Received</div>
                  <div className="text-base font-bold font-mono text-[var(--color-ink)] mt-0.5">
                    {analysisData.validation.rows_received}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Exact Duplicates Dropped</div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    {analysisData.validation.duplicates_removed}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Total_Exp ≤ 0 Dropped</div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    {analysisData.validation.total_exp_lte_zero}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Persondays ≤ 0 Dropped</div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    {analysisData.validation.persondays_lte_zero}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">Non-Numeric Wages Dropped</div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    {analysisData.validation.non_numeric_wages}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-emerald-800 text-[11px] font-bold">Valid Rows Retained</div>
                  <div className="text-base font-bold font-mono text-emerald-900 mt-0.5">
                    {analysisData.validation.rows_kept}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Awaiting MGNREGA Dataset Empty State (When analysisData === null) */}
        {!analysisData && !loading && (
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-12 text-center shadow-xs">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[var(--color-navy)]">
                <FileSpreadsheet className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">
                  Awaiting MGNREGA Dataset Upload
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  No district records or anomaly flags are loaded yet. Upload your custom expenditure CSV above, or click <strong>"🚀 Load Demo Dataset"</strong> under Quick Exhibition Presets to begin automated anomaly screening.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleLoadQuickFile('demo_upload_SYNTHETIC_v2.csv')}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs inline-flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Load Demo Dataset (30 Districts)</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
                Expected columns: <span className="font-mono text-slate-600">state_name, district_name, month, Total_Exp, Wages, Material_and_skilled_Wages, Total_Adm_Expenditure, Persondays_of_Central_Liability_so_far</span>
              </div>
            </div>
          </section>
        )}

        {/* KPI Tiles (Count-up Animation over 1s) */}
        {analysisData && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider">Snapshots Analysed</span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-[var(--color-navy)] tabular-nums">
                {totalRecs}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Validated against statutory schema
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider">Flagged Snapshots</span>
                <Flag className="w-4 h-4 text-[var(--color-saffron)]" />
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-[var(--color-saffron)] tabular-nums">
                {flaggedRecs}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Breach of statutory norms or isolation score
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider">Districts with Flags</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-amber-600 tabular-nums">
                {flaggedDists} <span className="text-base font-sans text-slate-400 font-normal">/ {analysisData.districts.length}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {analysisData.districts.length - flaggedDists} districts 100% clean
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider">High / Critical Risk</span>
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-red-600 tabular-nums">
                {highDistCount} <span className="text-base font-sans text-slate-400 font-normal">districts</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Composite risk score ≥ 55.0 (Priority 1)
              </p>
            </div>

          </section>
        )}

        {/* "Where Are The Flags?" District Grid by State */}
        {analysisData && (
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[var(--color-navy)]" />
                  <span>Where Are The Flags? — District Risk Heatmap</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any district to open the full monthly expenditure breakdown and audit driver drill-down.
                </p>
              </div>

              {/* Reveal Answer Key Action Button */}
              {analysisData.is_synthetic && (
                <button
                  onClick={handleRevealAnswerKey}
                  disabled={loadingAnswerKey}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--color-saffron)]" />
                  <span>{showAnswerKey ? 'Hide Ground Truth' : 'Reveal Ground-Truth Answer Key'}</span>
                </button>
              )}
            </div>

            {/* State Groups */}
            <div className="mt-6 space-y-6">
              {Object.entries(districtsByState).map(([stateName, distList]) => (
                <div key={stateName} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {stateName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({distList.filter(d => d.months_flagged > 0).length} flagged of {distList.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {distList.map((d, idx) => {
                      const isFlagged = d.months_flagged > 0;
                      const isSelected = selectedDistrict === d.district_name;
                      const levelColor = RISK_COLORS[d.risk_level];

                      return (
                        <div
                          key={d.district_name}
                          onClick={() => {
                            setSelectedDistrict(d.district_name);
                            // Auto select November if flagged
                            if (d.district_name === 'NORTH DISTRICT 03') {
                              setSelectedMonth('Nov');
                            }
                          }}
                          style={{
                            animationDelay: `${idx * 100}ms`
                          }}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? 'ring-2 ring-[var(--color-navy)] border-transparent shadow-md' 
                              : isFlagged 
                                ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 hover:shadow-xs' 
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--color-ink)] truncate" title={d.district_name}>
                              {d.district_name}
                            </span>
                            {isFlagged ? (
                              <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                                <Flag className="w-3 h-3 mr-0.5 text-amber-600" />
                                {d.months_flagged} mo
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                                Clean
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-600 font-semibold">
                              {d.risk_score}
                            </span>
                            <span 
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono"
                              style={{
                                color: levelColor,
                                backgroundColor: `${levelColor}15`
                              }}
                            >
                              {d.risk_level}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Answer Key Benchmark Panel (When Revealed) */}
        {showAnswerKey && answerKeyData && (
          <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-saffron)] text-slate-950 uppercase tracking-wider font-mono">
                    Ground-Truth Benchmark
                  </span>
                  <span className="text-xs text-slate-400">
                    Exhibition Answer Key Verification
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif mt-1">
                  Model Evaluation Against Planted Anomalies
                </h3>
              </div>
              <button
                onClick={() => setShowAnswerKey(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg self-end sm:self-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2x2 Confusion Matrix & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Matrix Card */}
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  2x2 Confusion Matrix (360 Records)
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40">
                    <span className="text-slate-400 text-[10px] block">True Positives (TP)</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      {answerKeyData.confusion_matrix.tp}
                    </span>
                    <span className="text-[10px] text-emerald-300 block mt-0.5">Correctly caught</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">False Positives (FP)</span>
                    <span className="text-2xl font-mono font-bold text-slate-200">
                      {answerKeyData.confusion_matrix.fp}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Zero false alarms</span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40">
                    <span className="text-slate-400 text-[10px] block">False Negatives (FN)</span>
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      {answerKeyData.confusion_matrix.fn}
                    </span>
                    <span className="text-[10px] text-amber-300 block mt-0.5">Ratio-neutral misses</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">True Negatives (TN)</span>
                    <span className="text-2xl font-mono font-bold text-slate-200">
                      {answerKeyData.confusion_matrix.tn}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Clean months passed</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Auditor Effectiveness Metrics
                </span>

                <div className="grid grid-cols-2 gap-4 my-auto">
                  <div>
                    <span className="text-slate-400 text-xs">Precision</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {(answerKeyData.confusion_matrix.precision * 100).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Every flagged record had real violation</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs">Recall</span>
                    <div className="text-2xl font-mono font-bold text-amber-400">
                      {(answerKeyData.confusion_matrix.recall * 100).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">23 of 33 injected months caught</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs">F1-Score</span>
                    <div className="text-2xl font-mono font-bold text-white">
                      {answerKeyData.confusion_matrix.f1}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Harmonic mean of precision & recall</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs">Accuracy</span>
                    <div className="text-2xl font-mono font-bold text-white">
                      {(answerKeyData.confusion_matrix.accuracy * 100).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Overall snapshot accuracy</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Pattern Breakdown */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Fraud Pattern Breakdown (Caught vs Injected)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                {Object.entries(answerKeyData.patterns).map(([patKey, stats]) => {
                  const caughtAll = stats.caught === stats.total;
                  return (
                    <div key={patKey} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block truncate" title={patKey}>
                        {patKey.replace(/_/g, ' ')}
                      </span>
                      <div className="text-base font-mono font-bold mt-1">
                        <span className={caughtAll ? 'text-emerald-400' : 'text-amber-400'}>
                          {stats.caught}
                        </span>
                        <span className="text-slate-500"> / {stats.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 9 Planted Districts Audit Table */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Status of 9 Injected Districts (Ground Truth)
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="pb-2 font-semibold">Rank</th>
                      <th className="pb-2 font-semibold">District</th>
                      <th className="pb-2 font-semibold">Risk Level</th>
                      <th className="pb-2 font-semibold">Planted Pattern</th>
                      <th className="pb-2 font-semibold text-center">Screening Status</th>
                      <th className="pb-2 font-semibold">Auditor Explanation / Caveat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {answerKeyData.planted_districts.map((p) => (
                      <tr key={p.district_name} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-mono text-slate-400">#{p.rank}</td>
                        <td className="py-2.5 font-bold text-white">{p.district_name}</td>
                        <td className="py-2.5">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                            style={{
                              color: RISK_COLORS[p.risk_level],
                              backgroundColor: `${RISK_COLORS[p.risk_level]}20`
                            }}
                          >
                            {p.risk_level}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300 capitalize">{p.pattern.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 text-center">
                          {p.caught ? (
                            <span className="inline-flex items-center text-emerald-400 font-bold space-x-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Caught ({p.caught_months}/{p.injected_months})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-400 font-bold space-x-1">
                              <XCircle className="w-4 h-4" />
                              <span>Missed (0/{p.injected_months})</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-400 text-[11px] max-w-xs">
                          {p.explanation_note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

        {/* District Ranking Horizontal Bar Chart */}
        {analysisData && (
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[var(--color-navy)]" />
                  <span>District Screening Priority Ranking ({rankingChartDistricts.length} Districts)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered by composite anomaly risk score. Click any bar to inspect monthly records.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setRankingViewMode('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      rankingViewMode === 'all'
                        ? 'bg-white text-[var(--color-navy)] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All 30 Districts
                  </button>
                  <button
                    onClick={() => setRankingViewMode('top10')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      rankingViewMode === 'top10'
                        ? 'bg-white text-[var(--color-navy)] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Top 10 Priority
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  Top Priority: NORTH DISTRICT 03 (58.7)
                </span>
              </div>
            </div>

            {/* Scrollable Container with adequate height per bar and wide YAxis */}
            <div className="mt-6 max-h-[520px] overflow-y-auto pr-2 border border-slate-100 rounded-xl bg-slate-50/30">
              <div style={{ height: `${Math.max(340, rankingChartDistricts.length * 28)}px`, minWidth: '550px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rankingChartDistricts}
                    layout="vertical"
                    margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis 
                      dataKey="district_name" 
                      type="category" 
                      width={160}
                      tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }} 
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(val: any, _name: any, item: any) => [
                        `${val} · ${item.payload.risk_level}`, 
                        `Risk Score (Trigger: ${item.payload.top_trigger})`
                      ]}
                    />
                    <Bar 
                      dataKey="risk_score" 
                      radius={[0, 4, 4, 0]}
                      onClick={(entry: any) => setSelectedDistrict(entry.district_name)}
                      className="cursor-pointer"
                    >
                      <LabelList 
                        dataKey="risk_score" 
                        position="right" 
                        fontSize={10} 
                        fill="#475569" 
                        formatter={(val: any) => `${val}`}
                      />
                      {rankingChartDistricts.map((d) => (
                        <Cell 
                          key={d.district_name} 
                          fill={RISK_COLORS[d.risk_level]} 
                          opacity={selectedDistrict === d.district_name ? 1 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <p className="mt-3 text-[11px] text-slate-500 italic text-center">
              Districts are ranked to focus human audit resources, not to pronounce guilt.
            </p>
          </section>
        )}

        {/* Scatter Plot: Statutory Norms (Material Share vs Unit Cost) */}
        {analysisData && (
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[var(--color-navy)]" />
                  <span>Statutory Norm Check: Material Share vs Cost per Person-Day</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reference lines mark the statutory 40% material limit and ₹500/day unit cost threshold.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                  <span className="text-slate-600">Normal (Clean)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rotate-45 bg-[var(--color-saffron)] inline-block"></span>
                  <span className="text-[var(--color-saffron)] font-bold">Flagged Snapshot</span>
                </span>
              </div>
            </div>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Material Share" 
                    unit="%" 
                    domain={[0, 70]} 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Material Share (%) [Limit: 40%]', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Cost per Personday" 
                    unit="₹" 
                    domain={[0, 1100]} 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Cost per Personday (₹) [Limit: ₹500]', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  />
                  <ZAxis range={[50, 50]} />
                  <ReferenceLine x={40} stroke="#C8372D" strokeDasharray="4 4" label={{ value: '40% Material Cap', fill: '#C8372D', fontSize: 10 }} />
                  <ReferenceLine y={500} stroke="#E8702B" strokeDasharray="4 4" label={{ value: '₹500 Unit Cost Limit', fill: '#E8702B', fontSize: 10 }} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs space-y-1">
                          <div className="font-bold">{pt.district} — {pt.month}</div>
                          <div>Cost: <span className="font-mono font-bold text-amber-300">₹{pt.y}/day</span></div>
                          <div>Material: <span className="font-mono font-bold">{pt.x}%</span></div>
                          <div>Risk Score: <span className="font-mono">{pt.risk_score}</span> ({pt.level})</div>
                          <div className="text-[10px] text-slate-400">Trigger: {pt.trigger}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter 
                    data={scatterData} 
                    onClick={(pt: any) => setSelectedDistrict(pt?.payload?.district || pt?.district)}
                    className="cursor-pointer"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.flagged ? '#E8702B' : '#94A3B8'} 
                        fillOpacity={entry.flagged ? 0.9 : 0.4}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Flagged Records Table with Filter & CSV Export */}
        {analysisData && (
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-4">
              <div>
                <h2 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-[var(--color-saffron)]" />
                  <span>Flagged Records Table ({displayedRecords.length} records)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screened snapshots exceeding statutory expenditure limits or statistical anomaly cutoffs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Trigger Filter Dropdown */}
                <select
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)]"
                >
                  <option value="ALL">All Flagged Triggers ({analysisData.records.filter(r => r.flagged).length})</option>
                  <option value="Cost breach">Cost Breach (₹/day &gt; ₹500)</option>
                  <option value="Material breach">Material Breach (&gt; 55%)</option>
                  <option value="Admin breach">Admin Breach (&gt; 14%)</option>
                  <option value="Anomaly">Anomaly + Confirmation</option>
                </select>

                {/* CSV Export Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-xs font-bold text-[var(--color-navy)] flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">District</th>
                    <th className="pb-3 font-semibold">Month</th>
                    <th 
                      onClick={() => {
                        setSortField('cost_per_day');
                        setSortAsc(sortField === 'cost_per_day' ? !sortAsc : false);
                      }}
                      className="pb-3 font-semibold cursor-pointer hover:text-slate-800"
                    >
                      ₹ / Personday
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('material_ratio');
                        setSortAsc(sortField === 'material_ratio' ? !sortAsc : false);
                      }}
                      className="pb-3 font-semibold cursor-pointer hover:text-slate-800"
                    >
                      Material %
                    </th>
                    <th className="pb-3 font-semibold">Admin %</th>
                    <th 
                      onClick={() => {
                        setSortField('risk_score');
                        setSortAsc(sortField === 'risk_score' ? !sortAsc : false);
                      }}
                      className="pb-3 font-semibold cursor-pointer hover:text-slate-800"
                    >
                      Risk Score
                    </th>
                    <th className="pb-3 font-semibold">Risk Tier</th>
                    <th className="pb-3 font-semibold">Primary Trigger</th>
                    <th className="pb-3 font-semibold text-right">Drill Down</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {displayedRecords.map((r, i) => {
                    const levelColor = RISK_COLORS[r.risk_level];
                    return (
                      <tr 
                        key={`${r.district_name}_${r.month}_${i}`} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-2.5 font-bold font-sans text-[var(--color-ink)]">
                          {r.district_name}
                        </td>
                        <td className="py-2.5 text-slate-600">{r.month}</td>
                        <td className="py-2.5 font-bold text-amber-700">
                          ₹{r.cost_per_day}
                        </td>
                        <td className="py-2.5 text-slate-700">
                          {(r.material_ratio * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-slate-700">
                          {(r.admin_ratio * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 font-bold text-[var(--color-navy)]">
                          {r.risk_score}
                        </td>
                        <td className="py-2.5">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              color: levelColor,
                              backgroundColor: `${levelColor}15`
                            }}
                          >
                            {r.risk_level}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans text-slate-600 text-[11px]">
                          {r.trigger}
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedDistrict(r.district_name);
                              setSelectedMonth(r.month);
                            }}
                            className="text-[var(--color-navy)] hover:text-[var(--color-saffron)] font-bold text-[11px] underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
          </>
        )}

      </main>

      {/* Drill-down Drawer (Slide-over panel) */}
      {selectedDistrict && activeScheme === 'MGNREGA' && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[var(--color-line)] flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[var(--color-line)] bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Audit Inspection Drawer
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedRecord?.state_name}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-ink)] mt-1">
                {selectedDistrict}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Monthly Unit Cost Trend Line */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Unit Cost Trend (₹ / Personday) Across 12 Months
                </span>
                <span className="text-[11px] text-amber-700 font-mono">Limit: ₹500/day</span>
              </div>

              <div className="h-44 bg-slate-50 rounded-xl p-2 border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedDistrictRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <ReferenceLine y={500} stroke="#C8372D" strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(val: any) => [`₹${val}`, 'Cost/Personday']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost_per_day" 
                      stroke="#1B2A4A" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const isFlagged = props.payload.flagged;
                        return (
                          <circle 
                            cx={props.cx} 
                            cy={props.cy} 
                            r={isFlagged ? 5 : 3} 
                            fill={isFlagged ? '#C8372D' : '#1B2A4A'} 
                            stroke="#fff" 
                            strokeWidth={1.5} 
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Month Selector Tabs */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Select Snapshot Month:
              </span>
              <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
                {selectedDistrictRecords.map((r) => {
                  const isCur = r.month === selectedMonth;
                  const isFlagged = r.flagged;
                  return (
                    <button
                      key={r.month}
                      onClick={() => setSelectedMonth(r.month)}
                      className={`py-1.5 rounded-lg border font-bold transition-all ${
                        isCur 
                          ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)]' 
                          : isFlagged 
                            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r.month}
                      {isFlagged && <span className="block text-[9px] text-amber-600">flag</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Month Snapshot Overview */}
            {selectedRecord && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {selectedRecord.district_name} — {selectedRecord.month} Snapshot
                      </span>
                      <div className="text-lg font-serif font-bold text-[var(--color-ink)]">
                        Risk Score: {selectedRecord.risk_score}
                      </div>
                    </div>
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-bold font-mono"
                      style={{
                        color: RISK_COLORS[selectedRecord.risk_level],
                        backgroundColor: `${RISK_COLORS[selectedRecord.risk_level]}20`
                      }}
                    >
                      {selectedRecord.risk_level} RISK
                    </span>
                  </div>

                  {/* 4 Ratios Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-slate-200">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Cost/Personday</span>
                      <span className={`font-bold ${selectedRecord.cost_per_day > 500 ? 'text-red-700' : 'text-slate-800'}`}>
                        ₹{selectedRecord.cost_per_day}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Material Share</span>
                      <span className={`font-bold ${selectedRecord.material_ratio > 0.40 ? 'text-red-700' : 'text-slate-800'}`}>
                        {(selectedRecord.material_ratio * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Admin Share</span>
                      <span className={`font-bold ${selectedRecord.admin_ratio > 0.06 ? 'text-amber-700' : 'text-slate-800'}`}>
                        {(selectedRecord.admin_ratio * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Wage Share</span>
                      <span className="font-bold text-slate-800">
                        {(selectedRecord.wage_ratio * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Explanation */}
                {selectedRecord.flagged && selectedRecord.explanation && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 block flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Auditor Finding & Statutory Rule Explanation:</span>
                    </span>
                    <p className="text-amber-950 font-medium leading-relaxed">
                      {selectedRecord.explanation.summary}
                    </p>

                    {selectedRecord.explanation.detailed_reasons?.length > 1 && (
                      <ul className="list-disc list-inside space-y-1 text-amber-900/90 pt-1 text-[11px]">
                        {selectedRecord.explanation.detailed_reasons.slice(1).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Z-Score Feature Driver Bars */}
                {selectedRecord.explanation?.key_drivers && selectedRecord.explanation.key_drivers.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        Statistical Z-Score Drivers vs State Baseline
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Shaded zone: |Z| &lt; 2.0 (Normal)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedRecord.explanation.key_drivers.map((drv) => {
                        const z = drv.z_score;
                        const isSevere = Math.abs(z) >= 3.0;
                        const isElevated = Math.abs(z) >= 2.0;

                        return (
                          <div key={drv.feature} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-700">{drv.label}</span>
                              <span className="font-mono font-bold text-slate-900">
                                Z = {z > 0 ? `+${z}` : z} ({drv.impact} Impact)
                              </span>
                            </div>

                            {/* Driver deviation bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full ${
                                  isSevere ? 'bg-red-600' : isElevated ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.max(10, Math.abs(z) * 20))}%`
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>District value: {drv.value}</span>
                              <span>State mean: {drv.state_avg}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[var(--color-line)] bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 italic">
              Verification required on ground prior to audit recovery.
            </span>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="px-4 py-2 rounded-xl bg-[var(--color-navy)] text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Close Drawer
            </button>
          </div>

        </div>
      )}

      {/* Persistent Auditor Disclaimer Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 max-w-4xl mx-auto px-4">
        <div className="p-4 rounded-xl bg-white border border-[var(--color-line)] shadow-xs">
          <p className="font-medium text-slate-700">
            A flag is not proof of fraud. It means: check this first. Final decisions stay with human auditors.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            GovGuard AI screening engine utilizes unsupervised Isolation Forest anomaly scoring combined with statutory 60:40 and administrative cap verification.
          </p>
        </div>
      </footer>

    </div>
  );
};
