import { Transaction, AuditLog } from '../types';

/**
 * Computes SHA-256 hash for a given string using Web Crypto API or fallback
 */
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Basic deterministic hash fallback for non-crypto contexts
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'sha256-' + Math.abs(hash).toString(16).padStart(12, '0');
}

/**
 * Calculates cryptographic checksum for a transaction entry
 */
export async function calculateTransactionChecksum(tx: Omit<Transaction, 'checksum'>): Promise<string> {
  const payload = `${tx.id}|${tx.receiptNo}|${tx.date}|${tx.type}|${tx.amount}|${tx.fundAccount}|${tx.category}|${tx.paymentMethod}|${tx.status}`;
  return await sha256(payload);
}

/**
 * Verifies if a transaction checksum matches its payload
 */
export async function verifyTransactionChecksum(tx: Transaction): Promise<boolean> {
  const expected = await calculateTransactionChecksum(tx);
  return tx.checksum === expected;
}

/**
 * Verifies entire financial ledger integrity
 */
export async function verifyLedgerIntegrity(transactions: Transaction[]): Promise<{
  isValid: boolean;
  tamperedCount: number;
  tamperedIds: string[];
}> {
  const tamperedIds: string[] = [];
  
  for (const tx of transactions) {
    const isOk = await verifyTransactionChecksum(tx);
    if (!isOk) {
      tamperedIds.push(tx.id);
    }
  }

  return {
    isValid: tamperedIds.length === 0,
    tamperedCount: tamperedIds.length,
    tamperedIds
  };
}

/**
 * Format currency to Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian localized format (e.g., 1 Agustus 2026)
 */
export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
