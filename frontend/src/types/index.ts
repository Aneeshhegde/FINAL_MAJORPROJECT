export interface SchemeInfo {
  id: string;
  name: string;
  status: string;
  description: string;
  implemented: boolean;
  badge?: string;
}

export interface RiskSummary {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_records: number;
  anomalies_detected: number;
  anomaly_rate: number;
  rules_violated_count: number;
  high_risk_records: number;
  snapshot_count_label?: string;
  raw_total_snapshots?: number;
  raw_anomalies_detected?: number;
  raw_anomaly_rate?: number;
}

export interface KPIs {
  total_expenditure_lakhs: number;
  total_expenditure_cr?: number;
  total_wages_lakhs: number;
  total_material_lakhs: number;
  total_admin_lakhs: number;
  total_persondays: number;
  total_workers: number;
  active_job_cards: number;
  total_works: number;
  completed_works: number;
  ongoing_works: number;
  cost_per_day?: number;
  material_ratio?: number;
  admin_ratio?: number;
  wage_ratio?: number;
  period?: string;
  reporting_cycles?: number;
}

export interface HistoricalTrend {
  year: string;
  total_records: number;
  anomalies: number;
  anomaly_rate: number;
  expenditure_in_lakhs: number;
  avg_risk_score: number;
  persondays?: number;
  cost_per_day?: number;
  material_ratio?: number;
  admin_ratio?: number;
  wage_ratio?: number;
  risk_level?: string;
  is_anomaly?: boolean;
  rule_violated?: boolean;
}

export interface ComparativeMetric {
  metric: string;
  district_value: string | number;
  state_average: string | number;
  deviation_pct: number;
  status: string;
}

export interface KeyDriver {
  feature: string;
  label: string;
  value: number;
  state_avg: number;
  z_score: number;
  impact: 'High' | 'Medium' | 'Low';
}

export interface SuspiciousRecord {
  record_id: string;
  financial_year: string;
  month: string;
  state: string;
  district: string;
  total_exp: number;
  wages: number;
  material_exp: number;
  admin_exp: number;
  persondays: number;
  material_ratio: number;
  wage_ratio: number;
  admin_ratio?: number;
  cost_per_day: number;
  ml_anomaly_score: number;
  anomaly_score?: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_anomaly: boolean;
  rule_violated: boolean;
  explanation: string;
  detailed_reasons: string[];
  key_drivers: KeyDriver[];
  top_contributors?: any[];
}

export interface NormCheckItem {
  label: string;
  value?: number;
  limit?: number;
  breach_limit?: number;
  value_pct?: number;
  value_rs?: number;
  limit_pct?: number;
  limit_rs?: number;
  breach_rs?: number;
  status: 'within' | 'near' | 'over' | 'OK' | 'NEAR' | 'OVER';
}

export interface NormChecks {
  material: NormCheckItem;
  admin: NormCheckItem;
  cost_per_day: NormCheckItem;
}

export interface AnalysisResponse {
  scheme: string;
  state: string;
  district: string;
  timestamp: string;
  period_label?: string;
  snapshot_count_label?: string;
  assessment?: string;
  plain_summary?: string;
  norm_checks?: NormChecks;
  annual_snapshots?: any[];
  risk_summary: RiskSummary;
  kpis: KPIs;
  risk_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  detection_methods: {
    ml_only: number;
    rules_only: number;
    both_flagged: number;
    clean_records: number;
  };
  historical_trends: HistoricalTrend[];
  comparative_analytics: ComparativeMetric[];
  suspicious_records: SuspiciousRecord[];
  flagged_snapshots?: SuspiciousRecord[];
  disclaimer: string;
}

export interface DistrictRankingItem {
  rank: number;
  district: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_records: number;
  anomalies: number;
  anomaly_rate: number;
  total_expenditure_lakhs: number;
  total_expenditure_cr?: number;
  total_persondays?: number;
  material_ratio?: number;
  admin_ratio?: number;
  cost_per_day?: number;
  top_driver?: string;
  period?: string;
}

export interface DistrictRankingResponse {
  state: string;
  scheme?: string;
  total_districts: number;
  rankings: DistrictRankingItem[];
}

export interface StateOverviewResponse {
  state: string;
  scheme?: string;
  total_records: number;
  total_anomalies: number;
  state_risk_score: number;
  state_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_expenditure_lakhs: number;
  total_expenditure_cr?: number;
  total_persondays?: number;
  highest_risk_districts: DistrictRankingItem[];
  lowest_risk_districts: DistrictRankingItem[];
}

// Live Exhibition Demo Types
export interface UploadValidationReport {
  rows_received: number;
  duplicates_removed: number;
  exact_duplicates: number;
  total_exp_lte_zero: number;
  total_exp_invalid: number;
  persondays_lte_zero: number;
  persondays_invalid: number;
  non_numeric_wages: number;
  non_numeric_columns: Record<string, number>;
  rows_kept: number;
}

export interface LiveDemoDistrict {
  state_name: string;
  district_name: string;
  district: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  months_flagged: number;
  top_trigger: string;
  rank: number;
}

export interface LiveDemoDriver {
  feature: string;
  label: string;
  value: number;
  state_avg: number;
  z_score: number;
  impact: string;
}

export interface LiveDemoExplanation {
  summary: string;
  detailed_reasons: string[];
  key_drivers: LiveDemoDriver[];
}

export interface LiveDemoRecord {
  record_id?: string;
  state_name: string;
  district_name: string;
  district?: string;
  month: string;
  cost_per_day: number;
  cost_per_personday?: number;
  material_ratio: number;
  admin_ratio: number;
  wage_ratio: number;
  Total_Exp: number;
  Material_and_skilled_Wages: number;
  Total_Adm_Expenditure: number;
  Wages: number;
  Persondays_of_Central_Liability_so_far: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flagged: boolean;
  trigger: string;
  explanation?: LiveDemoExplanation | null;
}

export interface LiveDemoKPIs {
  records: number;
  flagged_records: number;
  districts_flagged: number;
  districts_by_level: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface LiveDemoResponse {
  is_synthetic: boolean;
  validation: UploadValidationReport;
  kpis: LiveDemoKPIs;
  districts: LiveDemoDistrict[];
  records: LiveDemoRecord[];
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
}

export interface PatternStats {
  caught: number;
  total: number;
}

export interface PlantedDistrict {
  district: string;
  district_name: string;
  pattern: string;
  rank: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  caught: boolean;
  caught_months: number;
  injected_months: number;
  explanation_note: string;
}

export interface AnswerKeyComparison {
  confusion_matrix: ConfusionMatrix;
  patterns: Record<string, PatternStats>;
  planted_districts: PlantedDistrict[];
}

