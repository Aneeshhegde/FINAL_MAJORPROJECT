import { IBeneficiary } from '../models/Beneficiary';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  incomeCheck: boolean;
  criteriaChecks: CriteriaCheck[];
}

export interface CriteriaCheck {
  criterion: string;
  passed: boolean;
  message: string;
}

// Configurable income thresholds by scheme type
const INCOME_THRESHOLDS: Record<string, number> = {
  'Agricultural': 200000,
  'Housing': 300000,
  'Education': 250000,
  'Healthcare': 180000,
  'Pension': 150000,
  'LPG': 240000,
  'Food': 120000,
  'default': 200000
};

export class EligibilityVerificationService {
  getIncomeThreshold(schemeType: string): number {
    return INCOME_THRESHOLDS[schemeType] || INCOME_THRESHOLDS['default'];
  }

  async verifyEligibility(beneficiary: IBeneficiary): Promise<EligibilityResult> {
    const reasons: string[] = [];
    const criteriaChecks: CriteriaCheck[] = [];

    // Income threshold check
    const incomeThreshold = this.getIncomeThreshold(beneficiary.schemeType);
    const incomeCheck = beneficiary.income <= incomeThreshold;

    if (!incomeCheck) {
      reasons.push(`Income (${beneficiary.income}) exceeds threshold (${incomeThreshold}) for ${beneficiary.schemeType} scheme`);
    }

    criteriaChecks.push({
      criterion: 'Income Threshold',
      passed: incomeCheck,
      message: incomeCheck 
        ? `Income within threshold (${incomeThreshold})` 
        : `Income exceeds threshold (${incomeThreshold})`
    });

    // Scheme-specific criteria
    const schemeCriteria = await this.checkSchemeCriteria(beneficiary, beneficiary.schemeType);
    criteriaChecks.push(...schemeCriteria);

    schemeCriteria.forEach(check => {
      if (!check.passed) {
        reasons.push(check.message);
      }
    });

    const isEligible = incomeCheck && schemeCriteria.every(check => check.passed);

    return {
      isEligible,
      reasons,
      incomeCheck,
      criteriaChecks
    };
  }

  async checkSchemeCriteria(beneficiary: IBeneficiary, schemeType: string): Promise<CriteriaCheck[]> {
    const checks: CriteriaCheck[] = [];

    switch (schemeType) {
      case 'Agricultural':
        // Agricultural scheme criteria
        checks.push({
          criterion: 'Family Size',
          passed: beneficiary.familySize >= 2,
          message: beneficiary.familySize >= 2 
            ? 'Family size requirement met' 
            : 'Family size must be at least 2 for agricultural scheme'
        });
        break;

      case 'Pension':
        // Pension scheme criteria
        checks.push({
          criterion: 'Age Requirement',
          passed: beneficiary.age >= 60,
          message: beneficiary.age >= 60 
            ? 'Age requirement met for pension' 
            : 'Must be 60 years or older for pension scheme'
        });
        break;

      case 'Education':
        // Education scheme criteria
        checks.push({
          criterion: 'Age Requirement',
          passed: beneficiary.age >= 5 && beneficiary.age <= 25,
          message: (beneficiary.age >= 5 && beneficiary.age <= 25)
            ? 'Age requirement met for education' 
            : 'Age must be between 5 and 25 for education scheme'
        });
        break;

      case 'Housing':
        // Housing scheme criteria
        checks.push({
          criterion: 'Family Size',
          passed: beneficiary.familySize >= 3,
          message: beneficiary.familySize >= 3 
            ? 'Family size requirement met' 
            : 'Family size must be at least 3 for housing scheme'
        });
        break;

      case 'Healthcare':
        // Healthcare scheme - generally available to all
        checks.push({
          criterion: 'General Eligibility',
          passed: true,
          message: 'Healthcare scheme available to all income-eligible beneficiaries'
        });
        break;

      default:
        // Default criteria for other schemes
        checks.push({
          criterion: 'General Eligibility',
          passed: true,
          message: 'Standard eligibility criteria met'
        });
    }

    return checks;
  }

  setIncomeThreshold(schemeType: string, threshold: number): void {
    INCOME_THRESHOLDS[schemeType] = threshold;
  }
}
