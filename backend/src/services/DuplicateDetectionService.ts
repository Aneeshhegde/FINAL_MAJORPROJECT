import { Beneficiary, IBeneficiary } from '../models/Beneficiary';
import { encrypt } from '../utils/encryption';

export interface DuplicateResult {
  hasDuplicates: boolean;
  aadhaarMatches: IBeneficiary[];
  bankAccountMatches: IBeneficiary[];
  mobileMatches: IBeneficiary[];
}

export class DuplicateDetectionService {
  async checkAadhaarDuplicate(aadhaarNumber: string, excludeId?: string): Promise<IBeneficiary[]> {
    const encryptedAadhaar = encrypt(aadhaarNumber);
    
    const query: any = { aadhaarNumber: encryptedAadhaar };
    if (excludeId) {
      query.beneficiaryId = { $ne: excludeId };
    }

    return Beneficiary.find(query);
  }

  async checkBankAccountDuplicate(bankAccount: string, ifsc: string, excludeId?: string): Promise<IBeneficiary[]> {
    const encryptedBankAccount = encrypt(bankAccount);
    
    const query: any = { 
      bankAccount: encryptedBankAccount,
      ifsc: ifsc
    };
    if (excludeId) {
      query.beneficiaryId = { $ne: excludeId };
    }

    return Beneficiary.find(query);
  }

  async checkMobileDuplicate(mobile: string, excludeId?: string): Promise<IBeneficiary[]> {
    if (!mobile) {
      return [];
    }

    const query: any = { mobile: mobile };
    if (excludeId) {
      query.beneficiaryId = { $ne: excludeId };
    }

    return Beneficiary.find(query);
  }

  async detectDuplicates(beneficiaryData: {
    aadhaarNumber: string;
    bankAccount: string;
    ifsc: string;
    mobile?: string;
  }, excludeId?: string): Promise<DuplicateResult> {
    const [aadhaarMatches, bankAccountMatches, mobileMatches] = await Promise.all([
      this.checkAadhaarDuplicate(beneficiaryData.aadhaarNumber, excludeId),
      this.checkBankAccountDuplicate(beneficiaryData.bankAccount, beneficiaryData.ifsc, excludeId),
      beneficiaryData.mobile ? this.checkMobileDuplicate(beneficiaryData.mobile, excludeId) : Promise.resolve([])
    ]);

    const hasDuplicates = aadhaarMatches.length > 0 || 
                         bankAccountMatches.length > 0 || 
                         mobileMatches.length > 0;

    return {
      hasDuplicates,
      aadhaarMatches,
      bankAccountMatches,
      mobileMatches
    };
  }

  async updateDuplicateFraudScores(beneficiaryIds: string[]): Promise<void> {
    const DUPLICATE_FRAUD_SCORE_INCREASE = 20;

    for (const id of beneficiaryIds) {
      const beneficiary = await Beneficiary.findOne({ beneficiaryId: id });
      
      if (beneficiary) {
        beneficiary.fraudScore = Math.min(100, beneficiary.fraudScore + DUPLICATE_FRAUD_SCORE_INCREASE);
        
        // Update risk classification based on new fraud score
        if (beneficiary.fraudScore > 70) {
          beneficiary.riskClassification = 'High';
        } else if (beneficiary.fraudScore >= 40) {
          beneficiary.riskClassification = 'Medium';
        } else {
          beneficiary.riskClassification = 'Low';
        }

        await beneficiary.save();
      }
    }
  }

  async flagDuplicates(beneficiaryId: string, duplicateResult: DuplicateResult): Promise<void> {
    const allDuplicateIds = new Set<string>();
    const duplicateMatches: Array<{
      matchType: 'Aadhaar' | 'BankAccount' | 'Mobile';
      matchedBeneficiaryId: string;
      detectedAt: Date;
    }> = [];

    // Process Aadhaar matches
    duplicateResult.aadhaarMatches.forEach(match => {
      allDuplicateIds.add(match.beneficiaryId);
      duplicateMatches.push({
        matchType: 'Aadhaar',
        matchedBeneficiaryId: match.beneficiaryId,
        detectedAt: new Date()
      });
    });

    // Process bank account matches
    duplicateResult.bankAccountMatches.forEach(match => {
      allDuplicateIds.add(match.beneficiaryId);
      duplicateMatches.push({
        matchType: 'BankAccount',
        matchedBeneficiaryId: match.beneficiaryId,
        detectedAt: new Date()
      });
    });

    // Process mobile matches
    duplicateResult.mobileMatches.forEach(match => {
      allDuplicateIds.add(match.beneficiaryId);
      duplicateMatches.push({
        matchType: 'Mobile',
        matchedBeneficiaryId: match.beneficiaryId,
        detectedAt: new Date()
      });
    });

    if (allDuplicateIds.size > 0) {
      // Flag current beneficiary
      await Beneficiary.updateOne(
        { beneficiaryId },
        { 
          $set: { 
            isDuplicate: true,
            duplicateMatches
          }
        }
      );

      // Flag all matched beneficiaries
      const idsToUpdate = Array.from(allDuplicateIds);
      idsToUpdate.push(beneficiaryId);

      await this.updateDuplicateFraudScores(idsToUpdate);
    }
  }
}
