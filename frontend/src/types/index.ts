export interface SchemeInfo {
  id: string;
  name: string;
  status: 'Active' | 'Coming Soon';
  description: string;
  implemented: boolean;
}

export interface RiskSummary {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_records: number;
  anomalies_detected: number;
  anomaly_rate: number;
  rules_violated_count: number;
  high_risk_records: number;
}

export interface KPIs {
  total_expenditure_lakhs: number;
  total_wages_lakhs: number;
  total_material_lakhs: number;
  total_admin_lakhs: number;
  total_persondays: number;
  total_workers: number;
  active_job_cards: number;
  total_works: number;
  completed_works: number;
  ongoing_works: number;
}

export interface HistoricalTrend {
  year: string;
  total_records: number;
  anomalies: number;
  anomaly_rate: number;
  expenditure_in_lakhs: number;
  avg_risk_score: number;
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
  cost_per_day: number;
  ml_anomaly_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_anomaly: boolean;
  rule_violated: boolean;
  explanation: string;
  detailed_reasons: string[];
  key_drivers: KeyDriver[];
}

export interface AnalysisResponse {
  scheme: string;
  state: string;
  district: string;
  timestamp: string;
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
}

export interface DistrictRankingResponse {
  state: string;
  total_districts: number;
  rankings: DistrictRankingItem[];
}

export interface StateOverviewResponse {
  state: string;
  total_records: number;
  total_anomalies: number;
  state_risk_score: number;
  state_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_expenditure_lakhs: number;
  total_persondays: number;
  highest_risk_districts: DistrictRankingItem[];
  lowest_risk_districts: DistrictRankingItem[];
}
