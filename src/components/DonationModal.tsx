import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle2, ShieldCheck, Copy, Check, Printer, Building2 } from 'lucide-react';
import { Transaction, PaymentMethod, MosqueProfile } from '../types';
import { calculateTransactionChecksum, formatRupiah } from '../utils/cryptoUtils';
import { exportDonationReceiptPDF } from '../utils/pdfExport';
import { openWhatsAppDirect, generateWAMessage } from '../utils/whatsappUtils';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  mosque: MosqueProfile;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  mosque
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer_bsi');
  const [fundAccount, setFundAccount] = useState<'Kas Utama' | 'Kas Yatim & Dhuafa' | 'Kas Renovasi'>('Kas Utama');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'bank_pay' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Presets
  const presets = [20000, 50000, 100000, 250000, 500000, 1000000];

  const handleNextPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 5000) return;
    setStep('bank_pay');
  };

  const handleConfirmPaid = async () => {
    const receiptNo = `KWT-${new Date().toISOString().substring(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;
    
    const tempTx: Omit<Transaction, 'checksum'> = {
      id: `tx-don-${Date.now()}`,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      type: 'pemasukan',
      amount,
      fundAccount,
      category: 'Infaq Harian / Subuh',
      description: note || `Transfer Donasi (${paymentMethod.toUpperCase()}) - ${donorName || 'Hamba Allah'}`,
      donorName: donorName || 'Hamba Allah',
      donorPhone,
      paymentMethod,
      status: 'verified',
      createdBy: 'System Transfer Gateway',
      createdAt: new Date().toISOString()
    };

    const checksum = await calculateTransactionChecksum(tempTx);
    const finalTx: Transaction = { ...tempTx, checksum };

    onAddTransaction(finalTx);
    setLastTx(finalTx);
    setStep('success');

    // Auto open WA if phone provided
    if (donorPhone) {
      const waMsg = generateWAMessage(finalTx, mosque);
      openWhatsAppDirect(donorPhone, waMsg);
    }
  };

  const copyVA = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              Portal Infaq & Donasi Transfer Bank
            </h3>
            <p className="text-xs text-slate-400">{mosque.name} - Konfirmasi Real-time</p>
          </div>
          <button
            onClick={() => {
              setStep('form');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">

          {/* STEP 1: FORM INPUT */}
          {step === 'form' && (
            <form onSubmit={handleNextPayment} className="space-y-4">
              
              {/* Target Fund Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alokasi Donasi / Infaq
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundAccount('Kas Utama')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      fundAccount === 'Kas Utama'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Kas Utama
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundAccount('Kas Yatim & Dhuafa')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      fundAccount === 'Kas Yatim & Dhuafa'
                        ? 'bg-amber-600 text-white border-amber-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Kas Yatim
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundAccount('Kas Renovasi')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      fundAccount === 'Kas Renovasi'
                        ? 'bg-sky-600 text-white border-sky-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Pembangunan
                  </button>
                </div>
              </div>

              {/* Amount & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nominal Donasi (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 mb-2"
                />

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        amount === val
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-600 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000}JT` : `${val / 1000}RB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Rekening Transfer Bank / E-Wallet
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bank_transfer_bsi', label: 'BSI Syariah', icon: '🏦' },
                    { id: 'bank_transfer_mandiri', label: 'Bank Mandiri', icon: '🏦' },
                    { id: 'bank_transfer_bca', label: 'Bank BCA', icon: '🏦' },
                    { id: 'bank_transfer_bri', label: 'Bank BRI', icon: '🏦' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === m.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-base mb-0.5">{m.icon}</div>
                      <div className="text-xs font-semibold">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Donor Name & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Donatur (Atas Nama)
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Hamba Allah"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. WhatsApp (Untuk Kuitansi Digital)
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan ke Transfer Bank {formatRupiah(amount)}</span>
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: BANK TRANSFER DETAILS */}
          {step === 'bank_pay' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>Rekening Transfer Resmi Masjid</span>
                </div>

                <div className="space-y-2">
                  {mosque.bankAccounts.map((acc, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">{acc.bankName}</div>
                        <div className="font-mono text-emerald-400 font-bold text-sm">{acc.accountNumber}</div>
                        <div className="text-[11px] text-slate-400">a.n {acc.accountName}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyVA(acc.accountNumber)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Atas Nama Donatur</span>
                  <span className="font-bold text-white">{donorName || 'Hamba Allah'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Total Nominal</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatRupiah(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Alokasi Kas</span>
                  <span className="font-semibold text-slate-200">{fundAccount}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => setStep('form')}
                  className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Ubah Nominal
                </button>

                <button
                  onClick={handleConfirmPaid}
                  className="w-full sm:w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Sudah Transfer</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS & KUITANSI */}
          {step === 'success' && lastTx && (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Alhamdulillah, Donasi Berhasil!</h4>
                <p className="text-xs text-slate-400 mt-1">Terima kasih atas infaq & donasi Anda di {mosque.name}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">No. Kuitansi</span>
                  <span className="font-mono font-bold text-emerald-400">{lastTx.receiptNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Atas Nama</span>
                  <span className="font-semibold text-white">{lastTx.donorName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Nominal</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatRupiah(lastTx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SHA-256 Checksum</span>
                  <span className="font-mono text-[10px] text-slate-400">{lastTx.checksum.substring(0, 14)}...</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => exportDonationReceiptPDF(lastTx, mosque)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Unduh Kuitansi PDF</span>
                </button>

                <button
                  onClick={() => {
                    setStep('form');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
