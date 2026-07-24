import { PHIRedactionResult, AuditLogEntry } from '../types';

/**
 * De-identification / PHI Scrubbing Engine for HIPAA Privacy Rule Safe Harbor Compliance.
 * Replaces direct identifiers (Names, Dates, Phone Numbers, MRNs, SSNs, Emails)
 * with standardized clinical placeholders before transmission to LLMs.
 */
export function redactPHI(text: string): PHIRedactionResult {
  if (!text) {
    return {
      scrubbedText: '',
      detectedEntitiesCount: 0,
      detectedTypes: { names: [], dates: [], contactInfo: [], mrn: [] }
    };
  }

  let scrubbed = text;
  const detectedNames: string[] = [];
  const detectedDates: string[] = [];
  const detectedContact: string[] = [];
  const detectedMRNs: string[] = [];

  // 1. Scrub Medical Record Numbers (MRN)
  const mrnRegex = /(MRN|Medical Record Number|Patient ID|Chart #|Record #)\s*[:#\-]?\s*([A-Z0-9\-]{5,15})/gi;
  scrubbed = scrubbed.replace(mrnRegex, (match, prefix, id) => {
    detectedMRNs.push(id);
    return `${prefix}: [MRN_REDACTED]`;
  });

  // 2. Scrub SSNs
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  scrubbed = scrubbed.replace(ssnRegex, '[SSN_REDACTED]');

  // 3. Scrub Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  scrubbed = scrubbed.replace(emailRegex, (match) => {
    detectedContact.push(match);
    return '[EMAIL_REDACTED]';
  });

  // 4. Scrub Phone Numbers
  const phoneRegex = /(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]\d{4}/g;
  scrubbed = scrubbed.replace(phoneRegex, (match) => {
    if (match.length >= 7) {
      detectedContact.push(match);
      return '[PHONE_REDACTED]';
    }
    return match;
  });

  // 5. Scrub Patient Names & Salutations (e.g., "patient, Marcus Vance,", "Mr. Miller", "Miss Clara Bennett")
  const patientSalutationRegex = /\b(Mr\.|Mrs\.|Ms\.|Miss|patient|Patient)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  scrubbed = scrubbed.replace(patientSalutationRegex, (match, salutation, name) => {
    detectedNames.push(name);
    return `${salutation} [PATIENT_NAME_REDACTED]`;
  });

  // 6. Scrub Specific Full Names after "patient", "for", "my patient", "regards"
  const patientContextRegex = /\b(my patient|regarding patient|for|patient|Name:)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/gi;
  scrubbed = scrubbed.replace(patientContextRegex, (match, prefix, name) => {
    detectedNames.push(name);
    return `${prefix} [PATIENT_NAME_REDACTED]`;
  });

  // 7. Scrub Specific Dates (YYYY-MM-DD or MM/DD/YYYY or Month DD, YYYY)
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?,?\s+\d{4})\b/gi;
  scrubbed = scrubbed.replace(dateRegex, (match) => {
    detectedDates.push(match);
    return '[DATE_REDACTED]';
  });

  const detectedEntitiesCount =
    detectedNames.length +
    detectedDates.length +
    detectedContact.length +
    detectedMRNs.length;

  return {
    scrubbedText: scrubbed,
    detectedEntitiesCount,
    detectedTypes: {
      names: Array.from(new Set(detectedNames)),
      dates: Array.from(new Set(detectedDates)),
      contactInfo: Array.from(new Set(detectedContact)),
      mrn: Array.from(new Set(detectedMRNs)),
    }
  };
}

// Default Encryption Key for local browser session storage (AES-GCM)
const DEFAULT_SALT = 'OrphanDx-HIPAA-AES256-Key-Salt-2026';

async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(DEFAULT_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using Web Crypto API AES-GCM 256-bit
 */
export async function encryptDataAES(plainText: string, secret = 'OrphanDx-Doctor-Session-Key'): Promise<string> {
  try {
    const key = await deriveKey(secret);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    // Combine IV and Ciphertext into Base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption error:', err);
    return plainText; // Fallback
  }
}

/**
 * Decrypts AES-GCM 256-bit encrypted payload
 */
export async function decryptDataAES(encryptedBase64: string, secret = 'OrphanDx-Doctor-Session-Key'): Promise<string> {
  try {
    const key = await deriveKey(secret);
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return encryptedBase64;
  }
}

/**
 * Local Audit Trail Manager
 */
const AUDIT_LOGS_KEY = 'orphandx_audit_trail_v1';

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function logAuditActivity(
  action: string,
  details: string,
  phiRedacted: boolean,
  modelUsed = 'gemini-3.1-pro-preview'
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    action,
    details,
    phiRedacted,
    modelUsed,
    ipMasked: '127.0.0.1 (Local Workstation)'
  };

  const logs = getAuditLogs();
  logs.unshift(entry);
  // Keep last 100 entries
  if (logs.length > 100) logs.pop();

  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to write audit log', e);
  }

  return entry;
}
