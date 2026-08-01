import React, { useState } from 'react';
import { X, Cloud, Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface CloudflareSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareSupabaseModal: React.FC<CloudflareSupabaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedWorker, setCopiedWorker] = useState(false);

  if (!isOpen) return null;

  const supabaseSqlSchema = `-- SCHEMA DATABASE SUPABASE UNTUK SIMASJID KEUANGAN
-- Run this SQL query in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL,
  fund_account VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  donor_name VARCHAR(100),
  donor_phone VARCHAR(30),
  payment_method VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'verified',
  checksum VARCHAR(64) NOT NULL,
  created_by VARCHAR(100) DEFAULT 'Bendahara Masjid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Public Read Policy for Transparency
CREATE POLICY "Public Read Access" ON public.transactions
  FOR SELECT USING (true);

-- Indexes for Fast Querying
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_fund ON public.transactions(fund_account);
`;

  const cloudflareWorkerScript = `// CLOUDFLARE WORKERS / PAGES FUNCTION RUNTIME FOR SIMASJID
// wrangler.toml configuration for Cloudflare deployment

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Routes for Cloudflare Workers
    if (url.pathname === '/api/stats') {
      return new Response(JSON.stringify({ status: 'live', cloud: 'Cloudflare Edge' }), {
        headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
`;

  const copyToClipboard = (text: string, type: 'sql' | 'worker') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedWorker(true);
      setTimeout(() => setCopiedWorker(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-400" />
              Arsitektur Cloudflare & Supabase Ready
            </h3>
            <p className="text-xs text-slate-400">Skema Database PostgreSQL & Runtime Script Edge Deployment</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Intro Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Database className="w-4 h-4" />
              <span>Dukungan Penuh Deployment Cloudflare Pages + Supabase Backend</span>
            </div>
            <p>
              Aplikasi SiMasjid Keuangan dirancang dengan arsitektur modular yang kompatibel untuk langsung dideploy ke <strong className="text-white">Cloudflare Workers/Pages</strong> dengan database <strong className="text-white">Supabase PostgreSQL</strong> real-time.
            </p>
          </div>

          {/* Supabase DDL SQL Schema */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                1. DDL Schema Supabase PostgreSQL (`schema.sql`):
              </span>
              <button
                onClick={() => copyToClipboard(supabaseSqlSchema, 'sql')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 leading-relaxed">
              {supabaseSqlSchema}
            </pre>
          </div>

          {/* Cloudflare Workers Config */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-400" />
                2. Cloudflare Worker Edge Entry Point (`_worker.js`):
              </span>
              <button
                onClick={() => copyToClipboard(cloudflareWorkerScript, 'worker')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-all"
              >
                {copiedWorker ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorker ? 'Tersalin!' : 'Salin Script'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-sky-300 overflow-x-auto max-h-48 leading-relaxed">
              {cloudflareWorkerScript}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
