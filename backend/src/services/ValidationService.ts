import { BeneficiaryInput } from './BeneficiaryService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  validate(data: BeneficiaryInput): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length < 2 || data.name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }

    // Aadhaar validation
    if (!data.aadhaarNumber) {
      errors.push('Aadhaar number is required');
    } else if (!/^\d{12}$/.test(data.aadhaarNumber)) {
      errors.push('Aadhaar number must be exactly 12 digits');
    }

    // Age validation
    if (data.age === undefined || data.age === null) {
      errors.push('Age is required');
    } else if (data.age < 0 || data.age > 150) {
      errors.push('Age must be between 0 and 150');
    }

    // Gender validation
    if (!data.gender) {
      errors.push('Gender is required');
    } else if (!['Male', 'Female', 'Other'].includes(data.gender)) {
      errors.push('Gender must be Male, Female, or Other');
    }

    // Address validation
    if (!data.address || data.address.trim().length === 0) {
      errors.push('Address is required');
    }

    // District validation
    if (!data.district || data.district.trim().length === 0) {
      errors.push('District is required');
    }

    // Income validation
    if (data.income === undefined || data.income === null) {
      errors.push('Income is required');
    } else if (data.income < 0) {
      errors.push('Income cannot be negative');
    }

    // Family size validation
    if (data.familySize === undefined || data.familySize === null) {
      errors.push('Family size is required');
    } else if (data.familySize < 1) {
      errors.push('Family size must be at least 1');
    }

    // Scheme type validation
    if (!data.schemeType || data.schemeType.trim().length === 0) {
      errors.push('Scheme type is required');
    }

    // Bank account validation
    if (!data.bankAccount) {
      errors.push('Bank account is required');
    } else if (!/^\d{9,18}$/.test(data.bankAccount)) {
      errors.push('Bank account must be 9-18 digits');
    }

    // IFSC validation
    if (!data.ifsc) {
      errors.push('IFSC code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc)) {
      errors.push('Invalid IFSC code format');
    }

    // Subsidy amount validation
    if (data.subsidyAmount === undefined || data.subsidyAmount === null) {
      errors.push('Subsidy amount is required');
    } else if (data.subsidyAmount < 0) {
      errors.push('Subsidy amount cannot be negative');
    }

    // Claim frequency validation
    if (data.claimFrequency === undefined || data.claimFrequency === null) {
      errors.push('Claim frequency is required');
    } else if (data.claimFrequency < 0) {
      errors.push('Claim frequency cannot be negative');
    }

    // Date validations
    if (!data.registrationDate) {
      errors.push('Registration date is required');
    }
    if (!data.lastClaimDate) {
      errors.push('Last claim date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  sanitize(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  sanitizeBeneficiaryInput(data: BeneficiaryInput): BeneficiaryInput {
    return {
      ...data,
      name: this.sanitize(data.name),
      address: this.sanitize(data.address),
      district: this.sanitize(data.district),
      schemeType: this.sanitize(data.schemeType),
      mobile: data.mobile ? this.sanitize(data.mobile) : undefined
    };
  }
}
