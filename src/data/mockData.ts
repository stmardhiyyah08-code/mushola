import { MosqueProfile, Transaction, WANotification, AuditLog } from '../types';

export const initialMosqueProfile: MosqueProfile = {
  name: "Masjid SDN 012 Tarakan",
  tagline: "Transparan, Amanah, dan Berbasis Digital Untuk Kemaslahatan Umat",
  address: "Jl. Subrantas, Kota Tarakan",
  city: "Kota Tarakan, Kalimantan Utara",
  phone: "+62 812-3456-7890",
  email: "keuangan@masjid-sdn012tarakan.or.id",
  ketuaTakmir: "Pengurus Masjid",
  bendahara: "Bendahara Masjid",
  auditor: "Auditor Keuangan",
  bankAccounts: [
    { bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "7123-4567-89", accountName: "Masjid SDN 012 Tarakan Kas Utama" },
    { bankName: "Bank Mandiri", accountNumber: "127-00-0987654-3", accountName: "Masjid SDN 012 Tarakan Donasi" },
    { bankName: "Bank Central Asia (BCA)", accountNumber: "883-0987-123", accountName: "Yayasan Masjid SDN 012 Tarakan" },
    { bankName: "Bank Rakyat Indonesia (BRI)", accountNumber: "0341-01-000456-30-2", accountName: "Kas Pembangunan Masjid" }
  ],
  qrisNmid: "ID102439871238491",
  qrisMerchantName: "MASJID SDN 012 Tarakan",
  qrisImageUrl: "",
  qrisCustomPayload: "00020101021226580016ID.GO.QRIS.WWW01189360091400000000005204581253033605802ID5920MASJID SDN 012 Tarakan6013Tarakan61057710062250721",
  waGatewayStatus: "connected",
  waGatewayNumber: "+6281234567890",
  waApiKey: ""
};

// Clean slate: No example dummy transactions, clean database ready for real data
export const initialTransactions: Transaction[] = [];

// Clean slate: No sample notifications
export const initialWANotifications: WANotification[] = [];

// Clean slate: No sample audit logs
export const initialAuditLogs: AuditLog[] = [];
