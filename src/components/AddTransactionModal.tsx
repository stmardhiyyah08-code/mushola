import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, MessageSquare, PlusCircle } from 'lucide-react';
import { Transaction, TransactionType, FundAccount, TransactionCategory, PaymentMethod, MosqueProfile } from '../types';
import { calculateTransactionChecksum, formatRupiah } from '../utils/cryptoUtils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  mosque: MosqueProfile;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  mosque
}) => {
  const [type, setType] = useState<TransactionType>('pemasukan');
  const [amount, setAmount] = useState<number>(100000);
  const [fundAccount, setFundAccount] = useState<FundAccount>('Kas Utama');
  const [category, setCategory] = useState<TransactionCategory>('Infaq Jumat');
  const [description, setDescription] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [liveChecksum, setLiveChecksum] = useState('');
  const [autoSendWA, setAutoSendWA] = useState(true);

  // Auto-generate KWT number
  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const dateCode = new Date().toISOString().substring(0, 7).replace('-', '');
      setReceiptNo(`KWT-${dateCode}-${randomNum}`);
    }
  }, [isOpen]);

  // Compute SHA-256 checksum in real-time as fields change
  useEffect(() => {
    const updateChecksum = async () => {
      const tempTx: Omit<Transaction, 'checksum'> = {
        id: 'tx-temp',
        receiptNo,
        date,
        time,
        type,
        amount,
        fundAccount,
        category,
        description: description || 'Infaq Jamaah',
        donorName,
        donorPhone,
        paymentMethod,
        status: 'verified',
        createdBy: 'Bendahara Masjid',
        createdAt: new Date().toISOString()
      };
      const hash = await calculateTransactionChecksum(tempTx);
      setLiveChecksum(hash);
    };
    updateChecksum();
  }, [receiptNo, date, time, type, amount, fundAccount, category, description, donorName, paymentMethod]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      receiptNo,
      date,
      time,
      type,
      amount: Number(amount),
      fundAccount,
      category,
      description: description || (type === 'pemasukan' ? 'Infaq Jamaah' : 'Pengeluaran Operasional'),
      donorName: donorName || (type === 'pemasukan' ? 'Hamba Allah' : '-'),
      donorPhone,
      paymentMethod,
      status: 'verified',
      checksum: liveChecksum,
      createdBy: 'Bendahara Masjid',
      createdAt: new Date().toISOString()
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Catat Transaksi Keuangan Masjid
            </h3>
            <p className="text-xs text-slate-500">Pencatatan real-time dengan enkripsi otomatis Ledger SHA-256</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setType('pemasukan')}
              className={`py-2 rounded-xl font-bold text-xs transition-all ${
                type === 'pemasukan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Pemasukan (Infaq / Donasi)
            </button>
            <button
              type="button"
              onClick={() => setType('pengeluaran')}
              className={`py-2 rounded-xl font-bold text-xs transition-all ${
                type === 'pengeluaran' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              - Pengeluaran (Operasional)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal Transaksi (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-3 py-2 text-base font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Terbilang: {formatRupiah(amount)}
            </p>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Akun Kas
              </label>
              <select
                value={fundAccount}
                onChange={(e) => setFundAccount(e.target.value as FundAccount)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="Kas Utama">Kas Utama</option>
                <option value="Kas Yatim & Dhuafa">Kas Yatim & Dhuafa</option>
                <option value="Kas Renovasi">Kas Renovasi</option>
                <option value="Kas Zakat & Infaq">Kas Zakat & Infaq</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Transaksi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {type === 'pemasukan' ? (
                  <>
                    <option value="Infaq Jumat">Infaq Jumat</option>
                    <option value="Infaq Harian / Subuh">Infaq Harian / Subuh</option>
                    <option value="Donasi QRIS / Digital">Donasi QRIS / Digital</option>
                    <option value="Donasi Yatim & Dhuafa">Donasi Yatim & Dhuafa</option>
                    <option value="Infaq Renovasi & Pembangunan">Infaq Renovasi & Pembangunan</option>
                    <option value="Zakat Mal / Fitrah">Zakat Mal / Fitrah</option>
                    <option value="Sponsor / Hamba Allah">Sponsor / Hamba Allah</option>
                  </>
                ) : (
                  <>
                    <option value="Operasional Listrik & Air">Operasional Listrik & Air</option>
                    <option value="Pemeliharaan Gedung & AC">Pemeliharaan Gedung & AC</option>
                    <option value="Gaji Marbot & Imam">Gaji Marbot & Imam</option>
                    <option value="Santunan Yatim & Dhuafa">Santunan Yatim & Dhuafa</option>
                    <option value="Konsumsi & Pengajian">Konsumsi & Pengajian</option>
                    <option value="Honor Ustadz / Penceramah">Honor Ustadz / Penceramah</option>
                    <option value="Peralatan & Sound System">Peralatan & Sound System</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Rinci
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'pemasukan' ? 'Misal: Sedekah Subuh Jamaah' : 'Misal: Pembayaran Token Listrik PLN'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Donor Name & Phone (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Donatur / Penerima
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Kosongkan untuk Hamba Allah"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. WhatsApp (Notifikasi Otomatis)
              </label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="cash">Tunai (Kasir Masjid)</option>
                <option value="qris">QRIS Digital</option>
                <option value="gopay">GoPay</option>
                <option value="ovo">OVO</option>
                <option value="dana">DANA</option>
                <option value="shopeepay">ShopeePay</option>
                <option value="bank_transfer_bsi">Transfer BSI</option>
                <option value="bank_transfer_mandiri">Transfer Mandiri</option>
                <option value="bank_transfer_bca">Transfer BCA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Kuitansi KWT
              </label>
              <input
                type="text"
                readOnly
                value={receiptNo}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-700 font-mono font-bold"
              />
            </div>
          </div>

          {/* Live Checksum Badge */}
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Checksum SHA-256:
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {liveChecksum ? liveChecksum.substring(0, 16) + '...' : 'Calculating...'}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Transaksi & Enkripsi Ledger</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
