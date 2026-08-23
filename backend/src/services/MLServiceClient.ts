import axios from 'axios';
import { config } from '../config/env';
import { IBeneficiary } from '../models/Beneficiary';

export interface FraudAnalysisResult {
  beneficiaryId: string;
  fraudScore: number;
  riskClassification: 'Low' | 'Medium' | 'High';
  modelPredictions: {
    logisticRegression: number;
    randomForest: number;
    isolationForest: number;
  };
  featureImportance: Record<string, number>;
}

export class MLServiceClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.baseUrl = config.mlServiceUrl;
  }

  async analyzeFraud(beneficiary: IBeneficiary): Promise<FraudAnalysisResult> {
    try {
      const response = await this.makeRequest('/predict', {
        beneficiaryId: beneficiary.beneficiaryId,
        income: beneficiary.income,
        claimFrequency: beneficiary.claimFrequency,
        subsidyAmount: beneficiary.subsidyAmount,
        age: beneficiary.age,
        familySize: beneficiary.familySize,
        registrationDate: beneficiary.registrationDate.toISOString(),
        lastClaimDate: beneficiary.lastClaimDate.toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('ML Service unavailable, using fallback scoring:', error);
      return this.fallbackScoring(beneficiary);
    }
  }

  async batchAnalyze(beneficiaries: IBeneficiary[]): Promise<FraudAnalysisResult[]> {
    try {
      const payload = beneficiaries.map(b => ({
        beneficiaryId: b.beneficiaryId,
        income: b.income,
        claimFrequency: b.claimFrequency,
        subsidyAmount: b.subsidyAmount,
        age: b.age,
        familySize: b.familySize,
        registrationDate: b.registrationDate.toISOString(),
        lastClaimDate: b.lastClaimDate.toISOString()
      }));

      const response = await this.makeRequest('/batch-predict', payload);
      return response.data;
    } catch (error) {
      console.error('ML Service unavailable, using fallback scoring for batch:', error);
      return beneficiaries.map(b => this.fallbackScoring(b));
    }
  }

  private async makeRequest(endpoint: string, data: any, retryCount: number = 0): Promise<any> {
    try {
      return await axios.post(`${this.baseUrl}${endpoint}`, data, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest(endpoint, data, retryCount + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private fallbackScoring(beneficiary: IBeneficiary): FraudAnalysisResult {
    // Simple heuristic-based scoring when ML service is unavailable
    let score = 0;

    // High claim frequency
    if (beneficiary.claimFrequency > 5) score += 30;
    else if (beneficiary.claimFrequency > 3) score += 15;

    // High subsidy relative to income
    const subsidyToIncomeRatio = beneficiary.subsidyAmount / (beneficiary.income || 1);
    if (subsidyToIncomeRatio > 0.5) score += 25;
    else if (subsidyToIncomeRatio > 0.3) score += 15;

    // Duplicate flag
    if (beneficiary.isDuplicate) score += 20;

    // Ineligible status
    if (beneficiary.eligibilityStatus === 'Ineligible') score += 15;

    const fraudScore = Math.min(100, score);
    const riskClassification = fraudScore > 70 ? 'High' : fraudScore >= 40 ? 'Medium' : 'Low';

    return {
      beneficiaryId: beneficiary.beneficiaryId,
      fraudScore,
      riskClassification,
      modelPredictions: {
        logisticRegression: fraudScore / 100,
        randomForest: fraudScore / 100,
        isolationForest: fraudScore / 100
      },
      featureImportance: {
        claimFrequency: 0.25,
        subsidyAmount: 0.20,
        income: 0.15,
        isDuplicate: 0.20,
        eligibilityStatus: 0.20
      }
    };
  }
}
