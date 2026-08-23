import { Beneficiary } from '../models/Beneficiary';

export interface DashboardStatistics {
  totalBeneficiaries: number;
  fraudulentCount: number;
  leakagePercentage: number;
  totalSubsidyAmount: number;
  fraudulentSubsidyAmount: number;
  duplicateCount: number;
  ineligibleCount: number;
}

export interface SchemeAnalysis {
  schemeType: string;
  totalBeneficiaries: number;
  fraudCount: number;
  leakagePercentage: number;
}

export interface DistrictAnalysis {
  district: string;
  totalBeneficiaries: number;
  fraudCount: number;
  leakagePercentage: number;
}

export interface TrendData {
  date: string;
  fraudCount: number;
  totalCount: number;
  leakagePercentage: number;
}

export class DashboardService {
  async getStatistics(): Promise<DashboardStatistics> {
    const [
      totalBeneficiaries,
      fraudulentCount,
      duplicateCount,
      ineligibleCount,
      subsidyData
    ] = await Promise.all([
      Beneficiary.countDocuments(),
      Beneficiary.countDocuments({ riskClassification: 'High' }),
      Beneficiary.countDocuments({ isDuplicate: true }),
      Beneficiary.cou