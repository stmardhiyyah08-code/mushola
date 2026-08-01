import { Transaction, MosqueProfile } from '../types';
import { formatRupiah, formatIndonesianDate } from './cryptoUtils';

/**
 * Generate formatted WhatsApp message for a transaction
 */
export function generateWAMessage(tx: Transaction, mosque: MosqueProfile): string {
  if (tx.type === 'pemasukan') {
    return `Assalamualaikum Wr. Wb.

Jazakallahu Khairan *${tx.donorName || 'Hamba Allah'}*!

Alhamdulillah, donasi/infaq Anda telah berhasil kami terima secara real-time di *${mosque.name}*.

📌 *RINCIAN DONASI*
• No Kuitansi: *${tx.receiptNo}*
• Tanggal: ${formatIndonesianDate(tx.date)} (${tx.time} WIB)
• Jumlah: *${formatRupiah(tx.amount)}*
• Alokasi Kas: *${tx.fundAccount}*
• Kategori: ${tx.category}
• Metode: ${tx.paymentMethod.toUpperCase()}

Kuitansi digital ini terverifikasi secara resmi dan terenkripsi di Ledger Keuangan Masjid.
Semoga menjadi amal jariyah yang berlipat ganda, pemberat timbangan kebaikan, dan pemberkah rezeki keluarga. Aamiin Yaa Rabbal 'Aalamiin.

_Pengurus Takmir & Keuangan ${mosque.name}_
Website Portal: ${mosque.email}`;
  } else {
    return `*NOTIFIKASI PENGELUARAN KAS MASJID*

*${mosque.name}*
• No. Bukti: *${tx.receiptNo}*
• Tanggal: ${formatIndonesianDate(tx.date)}
• Jumlah: *${formatRupiah(tx.amount)}*
• Kategori: *${tx.category}*
• Akun Kas: ${tx.fundAccount}
• Keterangan: ${tx.description}

Pengeluaran ini telah diverifikasi Bendahara Masjid dan tercatat transparan di Laporan Keuangan Real-time.`;
  }
}

/**
 * Open direct WhatsApp chat with recipient
 */
export function openWhatsAppDirect(phone: string, text: string) {
  // Clean phone number
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank');
}
