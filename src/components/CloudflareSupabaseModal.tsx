import React, { useState, useEffect } from 'react';
import { X, Cloud, Database, Copy, Check, Terminal, Key, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConfigured, fetchTransactionsFromSupabase } from '../lib/supabase';

interface CloudflareSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const CloudflareSupabaseModal: React.FC<CloudflareSupabaseModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [supabaseUrl, setSupabaseUrlInput] = useState('');
  const [supabaseKey, setSupabaseKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrlInput(config.url);
    setSupabaseKeyInput(config.key);
    if (config.url && config.key) {
      setConnectionStatus('success');
      setStatusMsg('Terhubung ke database Supabase PostgreSQL real-time');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setConnectionStatus('idle');
    setStatusMsg('');

    setSupabaseConfig(supabaseUrl, supabaseKey);

    try {
      const data = await fetchTransactionsFromSupabase();
      setIsTesting(false);
      if (data !== null) {
        setConnectionStatus('success');
        setStatusMsg(`Koneksi Supabase Berhasil! ${data.length} transaksi otomatis tersinkronisasi.`);
        if (onRefreshData) onRefreshData();
      } else {
        setConnectionStatus('failed');
        setStatusMsg('Gagal terhubung. Pastikan tabel `transactions` di Supabase sudah dibuat menggunakan `schema.sql`.');
      }
    } catch (err) {
      setIsTesting(false);
      setConnectionStatus('failed');
      setStatusMsg('Terjadi kesalahan koneksi. Periksa URL & Anon Key Supabase.');
    }
  };

  const supabaseSqlSchema = `-- SKEMA DATABASE SUPABASE PRODUKSI SIMASJID
-- Jalankan query ini di menu SQL Editor pada Dashboard Supabase Anda:
-- File lengkap: schema.sql

CREATE TABLE IF NOT EXISTS public.transactions (
  id VARCHAR(100) PRIMARY KEY,
  receipt_no VARCHAR(100) UNIQUE NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  fund_account VARCHAR(100) NOT NULL,
  category VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  donor_name VARCHAR(255),
  donor_phone VARCHAR(50),
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'verified',
  checksum VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (status = 'verified');
CREATE POLICY "Public insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Integrasi Otomatis Supabase PostgreSQL
            </h3>
            <p className="text-xs text-slate-400">Penyimpanan Otomatis Real-time Database & Cloud Edge</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">

          {/* Form Input Config */}
          <form onSubmit={handleSaveConfig} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Konfigurasi Kredensial Supabase Project
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isSupabaseConfigured() ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {isSupabaseConfigured() ? '✅ Terhubung' : '⚠️ Offline (Local Fallback)'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Supabase Project URL (`VITE_SUPABASE_URL`)
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                placeholder="https://xyzxyzxyz.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Supabase Anon Key (`VITE_SUPABASE_ANON_KEY`)
              </label>
              <input
                type="password"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 ${connectionStatus === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'}`}>
                {connectionStatus === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                <span>{statusMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menguji Koneksi Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Kredensial & Hubungkan Otomatis</span>
                </>
              )}
            </button>
          </form>

          {/* DDL Schema Reference */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Query DDL Schema Database (`schema.sql`):
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(supabaseSqlSchema);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-300 overflow-x-auto max-h-40 leading-relaxed text-[11px]">
              {supabaseSqlSchema}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
