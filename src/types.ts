export type TransactionType = 'pemasukan' | 'pengeluaran' | 'transfer';

export type FundAccount = 'Kas Utama' | 'Kas Yatim & Dhuafa' | 'Kas Renovasi' | 'Kas Zakat & Infaq';

export type PaymentMethod = 
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bank_transfer_bsi'
  | 'bank_transfer_mandiri'
  | 'bank_transfer_bca'
  | 'bank_transfer_bri'
  | 'cash';

export type TransactionCategory =
  | 'Infaq Jumat'
  | 'Infaq Harian / Subuh'
  | 'Donasi QRIS / Digital'
  | 'Donasi Yatim & Dhuafa'
  | 'Infaq Renovasi & Pembangunan'
  | 'Zakat Mal / Fitrah'
  | 'Sponsor / Hamba Allah'
  | 'Operasional Listrik & Air'
  | 'Pemeliharaan Gedung & AC'
  | 'Gaji Marbot & Imam'
  | 'Santunan Yatim & Dhuafa'
  | 'Konsumsi & Pengajian'
  | 'Honor Ustadz / Penceramah'
  | 'Peralatan & Sound System'
  | 'Lain-lain';

export interface Transaction {
  id: string;
  receiptNo: string;
  date: string; // ISO format YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  amount: number;
  fundAccount: FundAccount;
  category: TransactionCategory;
  description: string;
  donorName?: string;
  donorPhone?: string;
  paymentMethod: PaymentMethod;
  status: 'verified' | 'pending' | 'rejected';
  checksum: string; // SHA-256 hash for ledger anti-tampering
  attachmentUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface MosqueProfile {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  ketuaTakmir: string;
  bendahara: string;
  auditor: string;
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }[];
  qrisNmid: string;
  qrisMerchantName?: string;
  qrisImageUrl?: string;
  qrisCustomPayload?: string;
  waGatewayStatus: 'connected' | 'disconnected' | 'testing';
  waGatewayNumber: string;
  waApiKey: string;
}

export interface WANotification {
  id: string;
  transactionId: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
  gatewayResponse?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  previousHash: string;
  currentHash: string;
}

export interface UserSession {
  isLogged: boolean;
  userRole: 'admin' | 'treasurer' | 'auditor' | 'guest';
  userName: string;
  authMethod: 'biometric' | 'pin' | 'password';
  lastActive: string;
}

export interface FinancialStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  kasUtamaBalance: number;
  kasYatimBalance: number;
  kasRenovasiBalance: number;
  kasZakatBalance: number;
  transactionCount: number;
}
