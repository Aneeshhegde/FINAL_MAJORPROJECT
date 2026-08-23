import { parse } from 'csv-parse/sync';
import { BeneficiaryService, BeneficiaryInput } from './BeneficiaryService';
import { ValidationService } from './ValidationService';
import { DuplicateDetectionService } from './DuplicateDetectionService';
import { EligibilityVerificationService } from './EligibilityVerificationService';

export interface UploadResult {
  totalRecords: number;
  successfulImports: number;
  failedRecords: FailedRecord[];
}

export interface FailedRecord {
  rowNumber: number;
  data: any;
  errors: string[];
}

export class CSVUploadService {
  private beneficiaryService: BeneficiaryService;
  private validationService: ValidationService;
  private duplicateDetectionService: DuplicateDetectionService;
  private eligibilityService: EligibilityVerificationService;

  constructor() {
    this.beneficiaryService = new BeneficiaryService();
    this.validationService = new ValidationService();
    this.duplicateDetectionService = new DuplicateDetectionService();
    this.eligibilityService = new EligibilityVerificationService();
  }

  async uploadCSV(fileBuffer: Buffer, adminId: string): Promise<UploadResult> {
    let records: any[];

    // Parse CSV
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (error) {
      throw new Error('Invalid CSV format: ' + (error as Error).message);
    }

    // Validate CSV headers
    const requiredHeaders = [
      'Name', 'Aadhaar_Number', 'Age', 'Gender', 'Address', 'District',
      'Income', 'Family_Size', 'Scheme_Type', 'Bank_Account', 'IFSC',
      'Subsidy_Amount', 'Claim_Frequency', 'Registration_Date', 'Last_Claim_Date'
    ];

    if (records.length > 0) {
      const headers = Object.keys(records[0]);
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
    }

    const failedRecords: FailedRecord[] = [];
    let successfulImports = 0;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because row 1 is headers and arrays are 0-indexed

      try {
        // Map CSV columns to BeneficiaryInput
        const beneficiaryData: BeneficiaryInput = {
          name: row.Name,
          aadhaarNumber: row.Aadhaar_Number,
          age: parseInt(row.Age),
          gender: row.Gender as 'Male' | 'Female' | 'Other',
          address: row.Address,
          district: row.District,
          mobile: row.Mobile || undefined,
          income: parseFloat(row.Income),
          familySize: parseInt(row.Family_Size),
          schemeType: row.Scheme_Type,
          bankAccount: row.Bank_Account,
          ifsc: row.IFSC,
          subsidyAmount: parseFloat(row.Subsidy_Amount),
          claimFrequency: parseInt(row.Claim_Frequency),
          registrationDate: new Date(row.Registration_Date),
          lastClaimDate: new Date(row.Last_Claim_Date)
        };

        // Sanitize input
        const sanitizedData = this.validationService.sanitizeBeneficiaryInput(beneficiaryData);

        // Validate
        const validationResult = this.validationService.validate(sanitizedData);
        if (!validationResult.isValid) {
          failedRecords.push({
            rowNumber,
            data: row,
            errors: validationResult.errors
          });
          continue;
        }

        // Create beneficiary
        const beneficiary = await this.beneficiaryService.create(sanitizedData, adminId);

        // Check for duplicates
        const duplicateResult = await this.duplicateDetectionService.detectDuplicates({
          aadhaarNumber: sanitizedData.aadhaarNumber,
          bankAccount: sanitizedData.bankAccount,
          ifsc: sanitizedData.ifsc,
          mobile: sanitizedData.mobile
        }, beneficiary.beneficiaryId);

        if (duplicateResult.hasDuplicates) {
          await this.duplicateDetectionService.flagDuplicates(beneficiary.beneficiaryId, duplicateResult);
        }

        // Verify eligibility
        const eligibilityResult = await this.eligibilityService.verifyEligibility(beneficiary);
        beneficiary.eligibilityStatus = eligibilityResult.isEligible ? 'Eligible' : 'Ineligible';
        beneficiary.eligibilityReasons = eligibilityResult.reasons;
        await beneficiary.save();

        successfulImports++;
      } catch (error) {
        failedRecords.push({
          rowNumber,
          data: row,
          errors: [(error as Error).message]
        });
      }
    }

    return {
      totalRecords: records.length,
      successfulImports,
      failedRecords
    };
  }
}
