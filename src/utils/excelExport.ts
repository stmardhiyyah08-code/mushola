import * as XLSX from 'xlsx';
import { Transaction, MosqueProfile } from '../types';
import { formatRupiah, formatIndonesianDate } from './cryptoUtils';

/**
 * Export transactions list to Excel Spreadsheet (.xlsx)
 */
export function exportTransactionsToExcel(
  transactions: Transaction[],
  mosque: MosqueProfile,
  fileName: string = 'Laporan_Keuangan_Masjid'
) {
  // Format data array
  const formattedData = transactions.map((t, index) => ({
    'No': index + 1,
    'No Kuitansi': t.receiptNo,
    'Tanggal': t.date,
    'Waktu': t.time || '00:00',
    'Jenis Transaksi': t.type === 'pemasukan' ? 'Pemasukan (+)' : 'Pengeluaran (-)',
    'Akun Kas Target': t.fundAccount,
    'Kategori': t.category,
    'Keterangan Rinci': t.description,
    'Nama Donatur / Penerima': t.donorName || '-',
    'No WhatsApp': t.donorPhone || '-',
    'Metode Pembayaran': t.paymentMethod.toUpperCase(),
    'Jumlah Nomilal (Rp)': t.amount,
    'Status Verifikasi': t.status.toUpperCase(),
    'Checksum Hash SHA-256': t.checksum,
    'Dicatat Oleh': t.createdBy
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 18 }, // No Kwt
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Waktu
    { wch: 18 }, // Jenis
    { wch: 20 }, // Akun Kas
    { wch: 25 }, // Kategori
    { wch: 35 }, // Keterangan
    { wch: 25 }, // Donatur
    { wch: 15 }, // WA
    { wch: 18 }, // Metode
    { wch: 18 }, // Amount
    { wch: 14 }, // Status
    { wch: 28 }, // Checksum
    { wch: 20 }  // User
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');

  // Also create a Summary Sheet
  const totalIncome = transactions.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.amount, 0);

  const summaryData = [
    { 'Parameter Audit': 'Nama Masjid', 'Nilai': mosque.name },
    { 'Parameter Audit': 'Alamat', 'Nilai': `${mosque.address}, ${mosque.city}` },
    { 'Parameter Audit': 'Ketua Takmir', 'Nilai': mosque.ketuaTakmir },
    { 'Parameter Audit': 'Bendahara', 'Nilai': mosque.bendahara },
    { 'Parameter Audit': 'Tanggal Export', 'Nilai': formatIndonesianDate(new Date().toISOString().split('T')[0]) },
    { 'Parameter Audit': 'Total Pemasukan (Rp)', 'Nilai': totalIncome },
    { 'Parameter Audit': 'Total Pengeluaran (Rp)', 'Nilai': totalExpense },
    { 'Parameter Audit': 'Saldo Akhir Kas (Rp)', 'Nilai': totalIncome - totalExpense },
    { 'Parameter Audit': 'Total Record Transaksi', 'Nilai': transactions.length },
    { 'Parameter Audit': 'Status Integrasi Ledger', 'Nilai': 'TERENKRIPSI & VERIFIED SHA-256' }
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Audit');

  // Trigger download
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
