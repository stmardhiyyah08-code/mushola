import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Trash2, 
  Edit, 
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  Printer,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Transaction, FundAccount, TransactionType, MosqueProfile, UserSession } from '../types';
import { formatRupiah, formatIndonesianDate } from '../utils/cryptoUtils';
import { exportFinancialReportPDF, exportExpenseReportPDF, exportDonationReceiptPDF } from '../utils/pdfExport';
import { exportTransactionsToExcel } from '../utils/excelExport';
import { generateWAMessage, openWhatsAppDirect } from '../utils/whatsappUtils';

interface TransactionTableProps {
  transactions: Transaction[];
  mosque: MosqueProfile;
  session: UserSession;
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  mosque,
  session,
  onOpenAddModal,
  onDeleteTransaction,
  onEditTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Keyword search
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.donorName && tx.donorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.donorPhone && tx.donorPhone.includes(searchTerm));

      if (!matchesSearch) return false;

      // 2. Type Filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // 3. Account Filter
      if (selectedAccount !== 'all' && tx.fundAccount !== selectedAccount) return false;

      // 4. Date Range Filter
      const txDate = new Date(tx.date);
      const today = new Date();
      
      if (dateFilterMode === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        if (tx.date !== todayStr) return false;
      } else if (dateFilterMode === 'this_week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (txDate < sevenDaysAgo) return false;
      } else if (dateFilterMode === 'this_month') {
        if (txDate.getMonth() !== today.getMonth() || txDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      } else if (dateFilterMode === 'custom') {
        if (startDate && new Date(tx.date) < new Date(startDate)) return false;
        if (endDate && new Date(tx.date) > new Date(endDate)) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedType, selectedAccount, dateFilterMode, startDate, endDate]);

  // Export PDF General
  const handleExportPDF = () => {
    exportFinancialReportPDF(filteredTransactions, mosque, 'Laporan Keuangan & Audit Transaksi');
  };

  // Export PDF Expense
  const handleExportExpensePDF = () => {
    exportExpenseReportPDF(filteredTransactions, mosque, 'Pengeluaran Bulanan');
  };

  // Export Excel
  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, mosque, 'Laporan_Keuangan_Masjid_Agung');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      
      {/* Table Top Toolbar */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Riwayat Transaksi Kas & Ledger Enkripsi
            </h2>
            <p className="text-xs text-slate-500">Pencarian, filter tanggal intuitif, serta ekspor laporan PDF dan Excel</p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Add Transaction (Pengurus Only or Active Demo) */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Transaksi</span>
            </button>

            {/* Export General PDF */}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all"
              title="Cetak Laporan Keuangan PDF"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">PDF Laporan</span>
            </button>

            {/* Export Expense PDF */}
            <button
              onClick={handleExportExpensePDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-all"
              title="Cetak Laporan Pengeluaran Bulanan PDF"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">PDF Pengeluaran</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all"
              title="Ekspor Laporan Keuangan ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>

          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Donatur, No. KWT, Keterangan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="all">Semua Jenis (Pemasukan & Pengeluaran)</option>
              <option value="pemasukan">Pemasukan (+)</option>
              <option value="pengeluaran">Pengeluaran (-)</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="all">Semua Akun Kas Masjid</option>
              <option value="Kas Utama">Kas Utama</option>
              <option value="Kas Yatim & Dhuafa">Kas Yatim & Dhuafa</option>
              <option value="Kas Renovasi">Kas Renovasi</option>
              <option value="Kas Zakat & Infaq">Kas Zakat & Infaq</option>
            </select>
          </div>

          {/* Date Filter Quick Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setDateFilterMode('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                dateFilterMode === 'all' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                dateFilterMode === 'today' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilterMode('this_month')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                dateFilterMode === 'this_month' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                dateFilterMode === 'custom' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kustom
            </button>
          </div>

        </div>

        {/* Custom Date Range Picker Options */}
        {dateFilterMode === 'custom' && (
          <div className="flex items-center gap-3 pt-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

      </div>

      {/* Transactions Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">No KWT & Waktu</th>
              <th className="py-3.5 px-4">Donatur / Rincian Keterangan</th>
              <th className="py-3.5 px-4">Akun Kas & Kategori</th>
              <th className="py-3.5 px-4 text-center">Metode</th>
              <th className="py-3.5 px-4 text-right">Jumlah (Rp)</th>
              <th className="py-3.5 px-4 text-center">Status Audit</th>
              <th className="py-3.5 px-4 text-center">Aksi / Cetak</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Tidak ada transaksi yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* No Kwt & Date */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">{tx.receiptNo}</div>
                    <div className="text-[11px] text-slate-500">{formatIndonesianDate(tx.date)} • {tx.time || '00:00'}</div>
                  </td>

                  {/* Donor & Description */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {tx.type === 'pemasukan' ? (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      )}
                      <span>{tx.donorName || tx.description}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{tx.description}</p>
                    {tx.donorPhone && (
                      <span className="inline-block mt-1 text-[10px] text-emerald-700 font-mono font-medium">
                        WA: {tx.donorPhone}
                      </span>
                    )}
                  </td>

                  {/* Fund Account & Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                      {tx.fundAccount}
                    </span>
                    <div className="text-[11px] font-medium text-slate-600">{tx.category}</div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-center font-mono text-[10px]">
                    <span className="uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                      {tx.paymentMethod}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                    <span className={tx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.type === 'pemasukan' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </span>
                  </td>

                  {/* Audit Checksum Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                      title={`Checksum SHA-256: ${tx.checksum}`}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {tx.checksum.substring(0, 10)}...
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {/* Printable Receipt PDF */}
                      <button
                        onClick={() => exportDonationReceiptPDF(tx, mosque)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                        title="Cetak Kuitansi Digital PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct WhatsApp Receipt */}
                      {tx.donorPhone && (
                        <button
                          onClick={() => {
                            const msg = generateWAMessage(tx, mosque);
                            openWhatsAppDirect(tx.donorPhone!, msg);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all"
                          title="Kirim Kuitansi WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete (if logged in as admin) */}
                      {session.isLogged && (
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan <span className="font-bold text-slate-900">{filteredTransactions.length}</span> dari <span className="font-bold text-slate-900">{transactions.length}</span> total transaksi
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Seluruh riwayat terenkripsi dan terverifikasi di Ledger Keuangan</span>
        </div>
      </div>

    </div>
  );
};
