import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, MosqueProfile } from '../types';
import { formatRupiah, formatIndonesianDate } from './cryptoUtils';

/**
 * Export Financial General Report (Laporan Kas Keuangan) to PDF
 */
export function exportFinancialReportPDF(
  transactions: Transaction[],
  mosque: MosqueProfile,
  filterTitle: string = 'Laporan Keuangan Bulanan'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Header / Kop Surat
  doc.setFillColor(15, 118, 110); // Emerald green #0f766e
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(mosque.name.toUpperCase(), 105, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(mosque.address + ', ' + mosque.city, 105, 18, { align: 'center' });
  doc.text(`Telp: ${mosque.phone} | Email: ${mosque.email}`, 105, 23, { align: 'center' });

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(filterTitle.toUpperCase(), 105, 42, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode Cetak: ${formatIndonesianDate(new Date().toISOString().split('T')[0])}`, 105, 48, { align: 'center' });

  // Summary Financial Card Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 54, 182, 22, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Green income
  doc.text(`Total Pemasukan: ${formatRupiah(totalIncome)}`, 20, 63);

  doc.setTextColor(239, 68, 68); // Red expense
  doc.text(`Total Pengeluaran: ${formatRupiah(totalExpense)}`, 20, 71);

  doc.setTextColor(15, 118, 110);
  doc.text(`Saldo Akhir Kas: ${formatRupiah(netBalance)}`, 110, 67);

  // Table Columns & Data
  const tableColumn = ['No KWT / Date', 'Akun Kas', 'Kategori & Keterangan', 'Jenis', 'Jumlah (Rp)'];
  const tableRows = transactions.map(t => [
    `${t.receiptNo}\n${formatIndonesianDate(t.date)}`,
    t.fundAccount,
    `${t.category}\n${t.description}${t.donorName ? ` (${t.donorName})` : ''}`,
    t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
    formatRupiah(t.amount)
  ]);

  autoTable(doc, {
    startY: 82,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 32 },
      2: { cellWidth: 70 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'Pemasukan') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    }
  });

  // Footer / Signatures
  // @ts-ignore
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 220;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Mengetahui,`, 30, finalY);
  doc.text(`Ketua Takmir Masjid`, 30, finalY + 5);
  doc.text(`( ${mosque.ketuaTakmir} )`, 30, finalY + 28);

  doc.text(`${mosque.city.split(',')[0]}, ${formatIndonesianDate(new Date().toISOString().split('T')[0])}`, 130, finalY);
  doc.text(`Bendahara Masjid`, 130, finalY + 5);
  doc.text(`( ${mosque.bendahara} )`, 130, finalY + 28);

  // Download trigger
  doc.save(`Laporan_Keuangan_${mosque.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export Monthly Expense Report (Laporan Pengeluaran Bulanan) to PDF
 */
export function exportExpenseReportPDF(
  transactions: Transaction[],
  mosque: MosqueProfile,
  monthName: string = 'Bulan Ini'
) {
  const expenseTxs = transactions.filter(t => t.type === 'pengeluaran');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  // Header / Kop Surat
  doc.setFillColor(185, 28, 28); // Red theme for expense report
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(mosque.name.toUpperCase(), 105, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(mosque.address + ', ' + mosque.city, 105, 18, { align: 'center' });
  doc.text(`Audit Keuangan & Laporan Pengeluaran Resmi Transparan`, 105, 23, { align: 'center' });

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`LAPORAN PENGELUARAN KAS MASJID (${monthName.toUpperCase()})`, 105, 42, { align: 'center' });

  // Total Box
  doc.setDrawColor(252, 165, 165);
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, 50, 182, 16, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`TOTAL PENGELUARAN BULANAN: ${formatRupiah(totalExpense)} (${expenseTxs.length} Transaksi)`, 20, 60);

  // Table
  const tableColumn = ['No. KWT', 'Tanggal', 'Akun Kas', 'Kategori Pengeluaran', 'Keterangan Rinci', 'Jumlah (Rp)'];
  const tableRows = expenseTxs.map(t => [
    t.receiptNo,
    formatIndonesianDate(t.date),
    t.fundAccount,
    t.category,
    t.description,
    formatRupiah(t.amount)
  ]);

  autoTable(doc, {
    startY: 72,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [185, 28, 28],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 38 },
      4: { cellWidth: 32 },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 220;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Mengetahui,`, 30, finalY);
  doc.text(`Ketua Takmir Masjid`, 30, finalY + 5);
  doc.text(`( ${mosque.ketuaTakmir} )`, 30, finalY + 28);

  doc.text(`${mosque.city.split(',')[0]}, ${formatIndonesianDate(new Date().toISOString().split('T')[0])}`, 130, finalY);
  doc.text(`Bendahara Masjid`, 130, finalY + 5);
  doc.text(`( ${mosque.bendahara} )`, 130, finalY + 28);

  doc.save(`Laporan_Pengeluaran_${mosque.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generate Printable PDF Receipt (Kuitansi Donasi Digital) for Donors
 */
export function exportDonationReceiptPDF(tx: Transaction, mosque: MosqueProfile) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [148, 210] // A5 landscape
  });

  // Border & Header
  doc.setLineWidth(1);
  doc.setDrawColor(15, 118, 110);
  doc.rect(5, 5, 200, 138);

  doc.setFillColor(15, 118, 110);
  doc.rect(5, 5, 200, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KUITANSI DONASI & INFAQ DIGITAL', 105, 16, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(mosque.name + ' - ' + mosque.address, 105, 23, { align: 'center' });

  // Receipt details
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(`No. Kuitansi : ${tx.receiptNo}`, 15, 38);
  doc.text(`Tanggal      : ${formatIndonesianDate(tx.date)} (${tx.time} WIB)`, 15, 44);
  doc.text(`Metode       : ${tx.paymentMethod.toUpperCase()}`, 130, 38);
  doc.text(`Checksum Audit: ${tx.checksum.substring(0, 16)}...`, 130, 44);

  doc.line(15, 48, 195, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Telah diterima dari : ${tx.donorName || 'Hamba Allah'}`, 15, 58);
  doc.text(`Uang Sejumlah       :`, 15, 66);

  // Amount badge box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(55, 61, 140, 10, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(formatRupiah(tx.amount), 60, 68);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Untuk Pembayaran    : ${tx.category} - ${tx.description}`, 15, 78);
  doc.text(`Alokasi Kas         : ${tx.fundAccount}`, 15, 86);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`* Bukti pembayaran sah, telah terverifikasi secara terenkripsi di Ledger Keuangan Masjid.`, 15, 96);

  // Signatures
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text(`Penerima / Bendahara Masjid`, 140, 106);
  doc.text(`( ${mosque.bendahara} )`, 140, 128);

  doc.save(`Kuitansi_${tx.receiptNo}_${tx.donorName ? tx.donorName.replace(/\s+/g, '_') : 'Donatur'}.pdf`);
}
