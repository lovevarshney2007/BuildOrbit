import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// Ensure we have a 32-byte key for AES-256. In production, this should be properly generated and rotated.
// For now, we hash the JWT_SECRET to ensure a consistent 32-byte key length.
const ENCRYPTION_KEY = crypto.createHash("sha256").update(process.env.JWT_SECRET || "default_fallback_secret_key_123").digest();

export function encryptBiometricData(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptBiometricData(encryptedData: string): string {
  if (!encryptedData.includes(':')) {
    // Fallback for legacy unencrypted data during transition
    return encryptedData; 
  }
  
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error("Invalid encrypted data format");
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
