import crypto from 'crypto';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (text: string): string => {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const maskAadhaar = (aadhaarNumber: string): string => {
  if (!aadhaarNumber || aadhaarNumber.length < 4) {
    return '****';
  }
  const lastFour = aadhaarNumber.slice(-4);
  return 'XXXX-XXXX-' + lastFour;
};
