import React, { useState, useMemo, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  HelpCircle, 
  Network, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Building2, 
  Landmark, 
  ShoppingBag, 
  GraduationCap, 
  Search,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  SCHEME_METADATA, 
  generatePMKisanDemo, 
  generatePMAYDemo, 
  generatePDSDemo, 
  generateNSPDemo 
} from '../data/otherSchemesDemo';

interface OtherSchemesLiveDemoProps {
  schemeId: 'PMKISAN' | 'PMAY' | 'PDS' | 'NSP';
}

// Simple count-up animation hook
function useCountUp(target: number, durationMs = 700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (time: number) => {
      const progress = Math.min((time - startTime) / durationMs, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(start + (target - start) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, durationMs]);
  return val;
}

export const OtherSchemesLiveDemo: React.FC<OtherSchemesLiveDemoProps> = ({ schemeId }) => {
  const meta = SCHEME_METADATA[schemeId];

  // Internal dataset state - starts NULL so NO flagged data appears automatically!
  const [dataset, setDataset] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Reset dataset whenever user changes scheme tab
  useEffect(() => {
    setDataset(null);
    setShowAnswerKey(false);
    setSelectedRecord(null);
    setFilterType('ALL');
    setSearchQuery('');
  }, [schemeId]);

  // Load simulated preset dataset for the scheme
  const handleLoadSimulatedData = () => {
    setLoading(true);
    setLoadingMsg(`Ingesting ${meta.shortName} records and verifying schema...`);
    
    setTimeout(() => {
      setLoadingMsg(`Running multi-entity correlation & norm violation screening...`);
      setTimeout(() => {
        let generated: any = null;
        if (schemeId === 'PMKISAN') generated = generatePMKisanDemo();
        else if (schemeId === 'PMAY') generated = generatePMAYDemo();
        else if (schemeId === 'PDS') generated = generatePDSDemo();
        else if (schemeId === 'NSP') generated = generateNSPDemo();

        setDataset(generated);
        setLoading(false);
        setLoadingMsg('');
      }, 700);
    }, 600);
  };

  // Drag and drop mock file handler
  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    handleLoadSimulatedData();
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!dataset || !dataset.records) return [];
    let list = dataset.records;
    if (filterType === 'FLAGGED') {
      list = list.filter((r: any) => r.flagged);
    } else if (filterType === 'CLEAN') {
      list = list.filter((r: any) => !r.flagged);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r: any) => 
        (r.beneficiary_id && r.beneficiary_id.toLowerCase().includes(q)) ||
        (r.beneficiary && r.beneficiary.toLowerCase().includes(q)) ||
        (r.shop_name && r.shop_name.toLowerCase().includes(q)) ||
        (r.fps_id && r.fps_id.toLowerCase().includes(q)) ||
        (r.institute_name && r.institute_name.toLowerCase().includes(q)) ||
        (r.district && r.district.toLowerCase().includes(q)) ||
        (r.trigger && r.trigger.toLowerCase().includes(q))
      );
    }
    return list;
  }, [dataset, filterType, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!dataset || !dataset.records) return;
    const flagged = dataset.records.filter((r: any) => r.flagged);
    if (flagged.length === 0) return;

    const keys = Object.keys(flagged[0]);
    const headers = keys.join(',');
    const rows = flagged.map((r: any) => keys.map(k => `"${r[k]}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `govguard_${schemeId.toLowerCase()}_flagged_leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Animated KPIs
  const totalItems = useCountUp(dataset?.records?.length || 0);
  const flaggedItems = useCountUp(dataset?.kpis?.flagged_records || 0);
  const cleanItems = useCountUp(dataset?.kpis?.clean_records || 0);

  return (
    <div className="space-y-8">

      {/* Scheme Watermark & Simulated Data Header */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {meta.shortName} Concept Demo · Simulated Data
              </span>
              <span className="text-[10px] bg-amber-200/90 text-amber-900 font-mono font-bold px-2 py-0.5 rounded">
                Simulated Engine
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Illustrates how GovGuard AI screening rules generalize to {meta.fullName}. All IDs, bank accounts, and coordinates are masked and simulated. Not connected to live systems.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-amber-900/80 italic font-medium">
            Decisions stay with human auditors.
          </span>
        </div>
      </div>

      {/* Upload & Dataset Ingestion Card (Always visible so user can load or reload) */}
      <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
          
          {/* Drag & Drop Target */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFile}
            onClick={handleLoadSimulatedData}
            className="flex-1 border-2 border-dashed border-slate-300 hover:border-[var(--color-navy)] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 group flex flex-col items-center justify-center min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-[var(--color-navy)] mb-3 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)]">
              Drop {meta.shortName} CSV dataset here, or <span className="text-[var(--color-saffron)] underline">click to simulate</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Accepts {meta.shortName} transaction batches. Expected schema: <span className="font-mono text-slate-700">{meta.expectedColumns.slice(0, 4).join(', ')}...</span>
            </p>
          </div>

          {/* Quick Preset Action Panel */}
          <div className="lg:w-88 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--color-line)] lg:pl-6 pt-4 lg:pt-0 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Exhibition Preset Action
              </span>
              <p className="text-xs text-slate-600 mt-1">
                Load realistic simulated data with planted anomalies to test detection accuracy.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleLoadSimulatedData}
                disabled={loading}
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-[var(--color-saffron)] bg-white hover:bg-amber-50/40 transition-colors flex items-center justify-between text-xs font-bold text-[var(--color-navy)] shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">🚀</span>
                  <div>
                    <div>Load {meta.shortName} Exhibition Dataset</div>
                    <span className="text-[11px] font-normal text-slate-500">Includes planted syndicates & normal records</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {dataset && (
                <button
                  onClick={() => setDataset(null)}
                  className="w-full text-center px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition-colors font-medium flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear Dataset & Reset View</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Audit rule: <strong>{meta.auditNorm}</strong></span>
            </div>
          </div>

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-xs text-[var(--color-navy)] font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-saffron)]" />
            <span>{loadingMsg}</span>
          </div>
        )}
      </section>

      {/* AWAITING DATASET STATE: Shown when dataset is NULL */}
      {!dataset && !loading && (
        <section className="bg-white rounded-2xl border border-[var(--color-line)] p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[var(--color-navy)]">
              {schemeId === 'PMKISAN' && <Landmark className="w-8 h-8" />}
              {schemeId === 'PMAY' && <Building2 className="w-8 h-8" />}
              {schemeId === 'PDS' && <ShoppingBag className="w-8 h-8" />}
              {schemeId === 'NSP' && <GraduationCap className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Awaiting {meta.shortName} Dataset Upload
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No records or anomalies are loaded yet. Click <strong>"Load {meta.shortName} Exhibition Dataset"</strong> above or drop a CSV file to begin automated screening.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleLoadSimulatedData}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs inline-flex items-center space-x-2"
              >
                <span>🚀 Load {meta.shortName} Exhibition Dataset</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
              Expected columns: <span className="font-mono text-slate-600">{meta.expectedColumns.join(', ')}</span>
            </div>
          </div>
        </section>
      )}

      {/* SCREENING RESULTS DASHBOARD: Shown only AFTER dataset is loaded */}
      {dataset && (
        <>
          {/* Key Metric Tiles */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Records Screened
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-[var(--color-navy)] font-mono">
                {totalItems}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {schemeId === 'PMKISAN' && 'Beneficiary Landholders'}
                {schemeId === 'PMAY' && 'Sanctioned House Milestones'}
                {schemeId === 'PDS' && 'Fair Price Shops Audited'}
                {schemeId === 'NSP' && 'Institutions Evaluated'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-xs">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Flagged for Audit
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-[var(--color-saffron)] font-mono">
                {flaggedItems}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">
                Breach of statutory scheme rules
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Compliant Records
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                {cleanItems}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Normal operational baseline
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-line)] p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Screening Engine Precision
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-[var(--color-ink)] font-mono">
                100%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Zero false alarms on compliant records
              </span>
            </div>
          </section>

          {/* SCHEME-SPECIFIC INTERACTIVE VISUALIZATIONS */}

          {/* 1. PM-KISAN: Fan-In Network & Account Cluster Visualizer */}
          {schemeId === 'PMKISAN' && (
            <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                    <Network className="w-5 h-5 text-[var(--color-navy)]" />
                    <span>Direct Benefit Transfer Fan-In Cluster Visualizer</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Detects bank accounts aggregating multiple distinct beneficiary landholder IDs.
                  </p>
                </div>
                <span className="text-xs font-mono bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                  4 High-Risk Syndicates Detected
                </span>
              </div>

              {/* Cluster Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Cluster 1 */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-red-900 bg-red-100 px-2.5 py-0.5 rounded">
                      Account: ACC-XXXX-77
                    </span>
                    <span className="text-xs font-bold text-red-700">6 Landholders (Fan-In: 6)</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Branch: State Bank of India (SBIN0004128) · Village V-17, State North
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['B-0013', 'B-0016', 'B-0019', 'B-0022', 'B-0025', 'B-0028'].map(id => (
                      <span key={id} className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-red-200 text-slate-800">
                        {id}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-red-800 font-medium pt-1 border-t border-red-100">
                    Screening result: Total ₹36,000 siphoned. Single beneficiary rule violated.
                  </div>
                </div>

                {/* Cluster 2 */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-red-900 bg-red-100 px-2.5 py-0.5 rounded">
                      Account: ACC-XXXX-42
                    </span>
                    <span className="text-xs font-bold text-red-700">8 Landholders (Fan-In: 8)</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Branch: Punjab National Bank (PUNB0021900) · Village V-09, State East
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['B-0122', 'B-0124', 'B-0126', 'B-0128', 'B-0130', 'B-0132', 'B-0134', 'B-0136'].map(id => (
                      <span key={id} className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-red-200 text-slate-800">
                        {id}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-red-800 font-medium pt-1 border-t border-red-100">
                    Screening result: Total ₹48,000 siphoned to intermediary broker.
                  </div>
                </div>

                {/* Cluster 3: Tax Payers */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                      Tax-Payer Ineligible Ring
                    </span>
                    <span className="text-xs font-bold text-amber-800">5 Beneficiaries</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    ITD Cross-Check: Active ITR filings detected for marginal landholder claims.
                  </p>
                  <div className="text-[11px] text-amber-900 font-medium">
                    Screening result: Mandatory statutory exclusion violated. Field tax verification queued.
                  </div>
                </div>

                {/* Cluster 4: Institutional Land */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                      Disproportionate Land Parcels
                    </span>
                    <span className="text-xs font-bold text-amber-800">7 Beneficiaries</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Declared Landholding: 38.5 Hectares (Limit for small & marginal farmers: 2 ha).
                  </p>
                  <div className="text-[11px] text-amber-900 font-medium">
                    Screening result: Commercial plantation parcel claimed as marginal landholding.
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* 2. PMAY: Spatial Coordinate Drift Scatter Plot */}
          {schemeId === 'PMAY' && (
            <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-[var(--color-navy)]" />
                    <span>Spatial GPS Coordinate Drift vs Inspection Interval</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plots distance drift (meters) between Foundation and Plinth inspection photos against elapsed days.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="text-slate-600">Compliant (&lt;50m drift)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                    <span className="text-red-700 font-bold">Flagged Spatial Anomaly</span>
                  </span>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      type="number" 
                      dataKey="drift_meters" 
                      name="GPS Drift" 
                      unit=" m" 
                      domain={[0, 9000]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'GPS Coordinate Drift (meters)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="days_elapsed" 
                      name="Elapsed Days" 
                      unit=" d" 
                      domain={[0, 400]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Days Elapsed between Milestones', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[var(--color-line)] shadow-md text-xs space-y-1">
                              <div className="font-bold text-[var(--color-ink)]">{d.sanction_id} · {d.beneficiary}</div>
                              <div>GPS Drift: <strong>{d.drift_meters} meters</strong> (Norm: &lt;50m)</div>
                              <div>Elapsed Time: <strong>{d.days_elapsed} days</strong> (Norm: &le;90d)</div>
                              <div className={`font-bold mt-1 ${d.flagged ? 'text-red-700' : 'text-emerald-700'}`}>
                                {d.trigger}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={50} stroke="#E8702B" strokeDasharray="3 3" label={{ value: '50m GPS Norm', fill: '#E8702B', fontSize: 10 }} />
                    <ReferenceLine y={90} stroke="#E8702B" strokeDasharray="3 3" label={{ value: '90d Progress Norm', fill: '#E8702B', fontSize: 10 }} />
                    <Scatter 
                      data={dataset.records} 
                      onClick={(entry) => setSelectedRecord(entry)}
                    >
                      {dataset.records.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.flagged ? '#C8372D' : '#94A3B8'} 
                          opacity={entry.flagged ? 0.9 : 0.6}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 italic text-center">
                Outliers on the far right represent inspection photos taken &gt;8 km away from the foundation site.
              </div>
            </section>
          )}

          {/* 3. PDS: 24-Hour Off-take Velocity & Nocturnal Offload Bar Chart */}
          {schemeId === 'PDS' && (
            <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-[var(--color-navy)]" />
                    <span>Fair Price Shop Off-Hours Distribution vs Biometric Bypass</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nocturnal transactions (1:00 AM – 4:30 AM) and manual supervisor override rates across 50 outlets.
                  </p>
                </div>
                <span className="text-xs font-mono bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                  7 Outlets Flagged for Flying Squad
                </span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataset.records.slice(0, 20)}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="fps_id" tick={{ fontSize: 10 }} />
                    <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        `${val}%`, 
                        name === 'off_hours_pct' ? 'Nocturnal Transactions' : 'Manual Exemption Bypass'
                      ]}
                    />
                    <ReferenceLine y={20} stroke="#E8702B" strokeDasharray="3 3" label={{ value: '20% Offline Ceiling', fill: '#E8702B', fontSize: 10 }} />
                    <Bar dataKey="off_hours_pct" name="off_hours_pct" radius={[4, 4, 0, 0]}>
                      {dataset.records.slice(0, 20).map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.off_hours_pct > 50 ? '#C8372D' : entry.manual_bypass_pct > 40 ? '#E0A526' : '#94A3B8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                  <span><strong>FPS-08 & FPS-14:</strong> Over 75% quota distributed between 1:00 AM – 4:30 AM with 84% manual override bypass.</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  Audit priority: High diversion risk
                </span>
              </div>
            </section>
          )}

          {/* 4. NSP: Student Concentration vs Stipend Claim Bubble Chart */}
          {schemeId === 'NSP' && (
            <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-[var(--color-navy)]" />
                    <span>Educational Institute Claim Density vs Mobile Number Clustering</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cross-references student applicant volume against identical mobile phone concentrations.
                  </p>
                </div>
                <span className="text-xs font-mono bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                  4 Shell / Siphon Rings Detected
                </span>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      type="number" 
                      dataKey="student_count" 
                      name="Students" 
                      unit=" students" 
                      domain={[0, 150]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Registered Student Count', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="shared_phone_count" 
                      name="Shared Phones" 
                      unit=" profiles" 
                      domain={[0, 90]}
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Profiles Sharing Identical Mobile #', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-[var(--color-line)] shadow-md text-xs space-y-1">
                              <div className="font-bold text-[var(--color-ink)]">{d.institute_name} ({d.institute_id})</div>
                              <div>Total Claimed: <strong>₹{d.total_stipend_lakh} Lakh</strong></div>
                              <div>Shared Mobile Count: <strong>{d.shared_phone_count} students</strong></div>
                              <div>Campus Status: <strong>{d.campus_accredited ? 'Accredited' : 'Unaccredited Shell'}</strong></div>
                              <div className={`font-bold mt-1 ${d.flagged ? 'text-red-700' : 'text-emerald-700'}`}>
                                {d.trigger}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={10} stroke="#E8702B" strokeDasharray="3 3" label={{ value: '10 Phone Cluster Ceiling', fill: '#E8702B', fontSize: 10 }} />
                    <Scatter data={dataset.records}>
                      {dataset.records.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.flagged ? '#C8372D' : '#94A3B8'} 
                          opacity={entry.flagged ? 0.9 : 0.6}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 italic text-center">
                INST-03 maps 82 applicants to one contact phone number (+91-98765-XXXX1) from an unverified physical address.
              </div>
            </section>
          )}

          {/* Records Table & Screening Queue */}
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-ink)]">
                  {meta.shortName} Screening Queue ({filteredRecords.length} Records)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter, inspect plain-language screening explanations, and export flagged audit leads.
                </p>
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records or triggers..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-[var(--color-navy)] w-48"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${filterType === 'ALL' ? 'bg-white text-[var(--color-navy)] shadow-xs' : 'text-slate-600'}`}
                  >
                    All ({dataset.records.length})
                  </button>
                  <button
                    onClick={() => setFilterType('FLAGGED')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${filterType === 'FLAGGED' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600'}`}
                  >
                    Flagged ({dataset.kpis.flagged_records})
                  </button>
                  <button
                    onClick={() => setFilterType('CLEAN')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${filterType === 'CLEAN' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                  >
                    Compliant ({dataset.kpis.clean_records})
                  </button>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Record ID</th>
                    <th className="py-3 px-3">Entity / Location</th>
                    <th className="py-3 px-3">Primary Signal</th>
                    <th className="py-3 px-3">Screening Status</th>
                    <th className="py-3 px-3">Plain-Language Explanation</th>
                    <th className="py-3 px-3 text-right">Drill Down</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRecords.slice(0, 15).map((r: any) => (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-50 transition-colors ${r.flagged ? 'bg-red-50/20' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[var(--color-navy)]">
                        {r.id || r.sanction_id || r.fps_id || r.institute_id}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">
                        {r.beneficiary_id ? `${r.beneficiary_id} (${r.village})` : ''}
                        {r.beneficiary ? `${r.beneficiary} (${r.district})` : ''}
                        {r.shop_name ? `${r.shop_name}` : ''}
                        {r.institute_name ? `${r.institute_name}` : ''}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {schemeId === 'PMKISAN' && `${r.account_no} · ${r.land_ha} ha`}
                        {schemeId === 'PMAY' && `${r.drift_meters}m drift · ${r.days_elapsed}d`}
                        {schemeId === 'PDS' && `${r.off_hours_pct}% night · ${r.manual_bypass_pct}% bypass`}
                        {schemeId === 'NSP' && `${r.student_count} students · ${r.shared_phone_count} phones`}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {r.flagged ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Flagged for Field Check
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Compliant
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 max-w-md">
                        {r.explanation}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="text-[var(--color-navy)] hover:text-[var(--color-saffron)] font-bold text-[11px] underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length > 15 && (
              <p className="text-xs text-slate-400 text-center italic">
                Showing top 15 of {filteredRecords.length} records. Export CSV to inspect full dataset.
              </p>
            )}

          </section>

          {/* Ground-Truth Answer Key Verification Accordion */}
          <section className="bg-white rounded-2xl border border-[var(--color-line)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Ground-Truth Verification Benchmark (Answer Key)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluate detection precision against pre-planted syndicates and subtle edge cases.
                </p>
              </div>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {showAnswerKey ? 'Hide Evaluation Key' : 'Reveal Answer Key Matrix'}
              </button>
            </div>

            {showAnswerKey && dataset.answer_key && (
              <div className="pt-4 border-t border-[var(--color-line)] space-y-4">
                
                {/* 2x2 Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">True Positives (TP)</span>
                    <div className="text-xl font-bold font-mono text-emerald-900 mt-1">{dataset.answer_key.tp}</div>
                    <span className="text-[10px] text-emerald-700">Planted rings caught</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-600">False Positives (FP)</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">{dataset.answer_key.fp}</div>
                    <span className="text-[10px] text-slate-500">Zero false alarms</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-800">False Negatives (FN)</span>
                    <div className="text-xl font-bold font-mono text-amber-900 mt-1">{dataset.answer_key.fn}</div>
                    <span className="text-[10px] text-amber-700">Subtle / unflagged cases</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-600">True Negatives (TN)</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">{dataset.answer_key.tn}</div>
                    <span className="text-[10px] text-slate-500">Compliant records passed</span>
                  </div>
                </div>

                {/* Pattern Breakdown */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Detection Breakdown by Pattern
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(dataset.answer_key.patterns).map(([pat, stat]: [string, any]) => (
                      <div key={pat} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                        <span className="font-mono text-slate-800 capitalize">{pat.replace(/_/g, ' ')}</span>
                        <span className={`font-bold font-mono ${stat.caught === stat.total ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {stat.caught} / {stat.total} caught
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong>Educational Insight:</strong> False negatives correspond to borderline cases designed to demonstrate why human field audits remain mandatory.
                  </span>
                </div>

              </div>
            )}
          </section>
        </>
      )}

      {/* Drill-down Drawer for Other Schemes */}
      {selectedRecord && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[var(--color-line)] flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[var(--color-line)] bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {meta.shortName} Audit Lead Inspection
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedRecord.village || selectedRecord.district || 'Simulated Batch'}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-ink)] mt-1">
                {selectedRecord.id || selectedRecord.sanction_id || selectedRecord.fps_id || selectedRecord.institute_id}
              </h3>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Status Card */}
            <div className={`p-4 rounded-xl border ${selectedRecord.flagged ? 'bg-red-50/70 border-red-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Screening Assessment
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                  selectedRecord.flagged ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {selectedRecord.flagged ? 'FLAGGED FOR FIELD CHECK' : 'COMPLIANT / WITHIN NORMS'}
                </span>
              </div>
              <p className="mt-2 text-slate-800 leading-relaxed font-medium">
                {selectedRecord.explanation}
              </p>
            </div>

            {/* Scheme Parameters Grid */}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                Ingested Entity Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {Object.entries(selectedRecord).filter(([k]) => !['explanation', 'flagged', 'reason'].includes(k)).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-sans uppercase block">
                      {k.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-slate-800 break-all">
                      {typeof v === 'number' ? v : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Guidance Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Field Auditor Protocol:</span>
              </span>
              <p className="text-amber-950 text-[11px] leading-relaxed">
                A flag does not establish fraudulent intent. Proceed with standard verification: check physically on the ground, verify KYC passbooks, and corroborate with field registers before issuing any recovery citation.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[var(--color-line)] bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 italic">
              Simulated demonstration scenario.
            </span>
            <button
              onClick={() => setSelectedRecord(null)}
              className="px-4 py-2 rounded-xl bg-[var(--color-navy)] text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
