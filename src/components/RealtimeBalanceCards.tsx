import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  HeartHandshake, 
  Building, 
  Coins, 
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, FinancialStats } from '../types';
import { formatRupiah } from '../utils/cryptoUtils';

interface RealtimeBalanceCardsProps {
  transactions: Transaction[];
  stats: FinancialStats;
}

export const RealtimeBalanceCards: React.FC<RealtimeBalanceCardsProps> = ({ transactions, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Kas Utama & Overall Balance Card (Hero Bento Tile) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-md border border-emerald-500">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-100 tracking-wider uppercase flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-200" />
            Total Saldo Kas Masjid
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-3 h-3" />
            Audit Live
          </span>
        </div>
        
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          {formatRupiah(stats.totalBalance)}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-500/50 text-xs">
          <div>
            <span className="text-emerald-100/80 block text-[10px] uppercase font-semibold">Pemasukan</span>
            <span className="font-bold text-white flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
              {formatRupiah(stats.totalIncome)}
            </span>
          </div>
          <div>
            <span className="text-emerald-100/80 block text-[10px] uppercase font-semibold">Pengeluaran</span>
            <span className="font-bold text-rose-100 flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-200" />
              {formatRupiah(stats.totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Kas Yatim & Dhuafa Bento Tile */}
      <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-500" />
              Kas Yatim & Dhuafa
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Khusus
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {formatRupiah(stats.kasYatimBalance)}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Santunan & Beasiswa Santri
        </p>
      </div>

      {/* Kas Renovasi & Pembangunan Bento Tile */}
      <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-500" />
              Kas Pembangunan
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Fasilitas
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {formatRupiah(stats.kasRenovasiBalance)}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          Perbaikan Kubah & Solar Panel
        </p>
      </div>

      {/* Kas Zakat & Infaq Bento Tile */}
      <div className="rounded-3xl bg-white text-slate-800 p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              Kas Zakat & Infaq
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Penyaluran
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {formatRupiah(stats.kasZakatBalance)}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Zakat Maal & Fitrah Terverifikasi
        </p>
      </div>

    </div>
  );
};
