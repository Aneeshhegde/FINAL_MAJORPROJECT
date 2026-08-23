import mongoose, { Schema, Document } from 'mongoose';

export interface IBeneficiary extends Document {
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  district: string;
  mobile?: string;
  income: number;
  familySize: number;
  bankAccount: string;
  ifsc: string;
  schemeType: string;
  subsidyAmount: number;
  claimFrequency: number;
  registrationDate: Date;
  lastClaimDate: Date;
  eligibilityStatus: 'Eligible' | 'Ineligible';
  eligibilityReasons: string[];
  fraudScore: number;
  riskClassification: 'Low' | 'Medium' | 'High';
  fraudLabel: boolean;
  isDuplicate: boolean;
  duplicateMatches: Array<{
    matchType: 'Aadhaar' | 'BankAccount' | 'Mobile';
    matchedBeneficiaryId: string;
    detectedAt: Date;
  }>;
  mlPredictions: {
    logisticRegression: number;
    randomForest: number;
    isolationForest: number;
    lastAnalyzedAt: Date;
  };
  createdBy: string;
  updatedBy: string;
}

const BeneficiarySchema = new Schema<IBeneficiary>(
  {
    beneficiaryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    aadhaarNumber: {
      type: String,
      required: true,
      index: true
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true,
      index: true
    },
    mobile: {
      type: String,
      index: true,
      sparse: true
    },
    income: {
      type: Number,
      required: true,
      min: 0
    },
    familySize: {
      type: Number,
      required: true,
      min: 1
    },
    bankAccount: {
      type: String,
      required: true
    },
    ifsc: {
      type: String,
      required: true
    },
    schemeType: {
      type: String,
      required: true,
      index: true
    },
    subsidyAmount: {
      type: Number,
      required: true,
      min: 0
    },
    claimFrequency: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    registrationDate: {
      type: Date,
      required: true,
      index: true
    },
    lastClaimDate: {
      type: Date,
      required: true
    },
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Ineligible'],
      default: 'Eligible'
    },
    eligibilityReasons: {
      type: [String],
      default: []
    },
    fraudScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: -1
    },
    riskClassification: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
      index: true
    },
    fraudLabel: {
      type: Boolean,
      default: false
    },
    isDuplicate: {
      type: Boolean,
      default: false
    },
    duplicateMatches: [{
      matchType: {
        type: String,
        enum: ['Aadhaar', 'BankAccount', 'Mobile']
      },
      matchedBeneficiaryId: String,
      detectedAt: Date
    }],
    mlPredictions: {
      logisticRegression: { type: Number, default: 0 },
      randomForest: { type: Number, default: 0 },
      isolationForest: { type: Number, default: 0 },
      lastAnalyzedAt: Date
    },
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
BeneficiarySchema.index({ bankAccount: 1, ifsc: 1 });

export const Beneficiary = mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
