import { Beneficiary, IBeneficiary } from '../models/Beneficiary';
import { AuditLog } from '../models/AuditLog';
import { encrypt, decrypt, maskAadhaar } from '../utils/encryption';
import { v4 as uuidv4 } from 'uuid';

export interface BeneficiaryInput {
  name: string;
  aadhaarNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  district: string;
  mobile?: string;
  income: number;
  familySize: number;
  schemeType: string;
  bankAccount: string;
  ifsc: string;
  subsidyAmount: number;
  claimFrequency: number;
  registrationDate: Date;
  lastClaimDate: Date;
}

export interface BeneficiaryFilters {
  district?: string;
  schemeType?: string;
  riskClassification?: 'Low' | 'Medium' | 'High';
  eligibilityStatus?: 'Eligible' | 'Ineligible';
  isDuplicate?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface BeneficiaryList {
  data: IBeneficiary[];
  total: number;
  page: number;
  totalPages: number;
}

export class BeneficiaryService {
  async create(data: BeneficiaryInput, adminId: string): Promise<IBeneficiary> {
    // Encrypt sensitive fields
    const encryptedAadhaar = encrypt(data.aadhaarNumber);
    const encryptedBankAccount = encrypt(data.bankAccount);

    const beneficiary = new Beneficiary({
      beneficiaryId: uuidv4(),
      ...data,
      aadhaarNumber: encryptedAadhaar,
      bankAccount: encryptedBankAccount,
      createdBy: adminId,
      updatedBy: adminId,
      eligibilityStatus: 'Eligible',
      eligibilityReasons: [],
      fraudScore: 0,
      riskClassification: 'Low',
      fraudLabel: false,
      isDuplicate: false,
      duplicateMatches: [],
      mlPredictions: {
        logisticRegression: 0,
        randomForest: 0,
        isolationForest: 0,
        lastAnalyzedAt: new Date()
      }
    });

    await beneficiary.save();

    return beneficiary;
  }

  async getById(id: string): Promise<IBeneficiary | null> {
    const beneficiary = await Beneficiary.findOne({ beneficiaryId: id });
    
    if (!beneficiary) {
      return null;
    }

    // Mask Aadhaar for display
    const decryptedAadhaar = decrypt(beneficiary.aadhaarNumber);
    beneficiary.aadhaarNumber = maskAadhaar(decryptedAadhaar);

    return beneficiary;
  }

  async update(id: string, data: Partial<BeneficiaryInput>, adminId: string): Promise<IBeneficiary> {
    const beneficiary = await Beneficiary.findOne({ beneficiaryId: id });
    
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    // Encrypt sensitive fields if provided
    if (data.aadhaarNumber) {
      data.aadhaarNumber = encrypt(data.aadhaarNumber);
    }
    if (data.bankAccount) {
      data.bankAccount = encrypt(data.bankAccount);
    }

    Object.assign(beneficiary, data);
    beneficiary.updatedBy = adminId;

    await beneficiary.save();

    return beneficiary;
  }

  async delete(id: string, adminId: string, ipAddress: string, userAgent: string): Promise<void> {
    const beneficiary = await Beneficiary.findOne({ beneficiaryId: id });
    
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    // Create audit log before deletion
    await AuditLog.create({
      adminId,
      action: 'DELETE_BENEFICIARY',
      resourceType: 'Beneficiary',
      resourceId: id,
      changes: { deleted: beneficiary.toObject() },
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    await Beneficiary.deleteOne({ beneficiaryId: id });
  }

  async list(filters: BeneficiaryFilters, pagination: Pagination): Promise<BeneficiaryList> {
    const query: any = {};

    if (filters.district) {
      query.district = filters.district;
    }
    if (filters.schemeType) {
      query.schemeType = filters.schemeType;
    }
    if (filters.riskClassification) {
      query.riskClassification = filters.riskClassification;
    }
    if (filters.eligibilityStatus) {
      query.eligibilityStatus = filters.eligibilityStatus;
    }
    if (filters.isDuplicate !== undefined) {
      query.isDuplicate = filters.isDuplicate;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      Beneficiary.find(query)
        .skip(skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 }),
      Beneficiary.countDocuments(query)
    ]);

    // Mask Aadhaar numbers
    data.forEach(beneficiary => {
      const decryptedAadhaar = decrypt(beneficiary.aadhaarNumber);
      beneficiary.aadhaarNumber = maskAadhaar(decryptedAadhaar);
    });

    return {
      data,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit)
    };
  }
}
