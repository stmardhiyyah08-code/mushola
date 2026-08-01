import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, FileText, BarChart2, ShieldAlert, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIFinancialAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIFinancialAssistantModal: React.FC<AIFinancialAssistantModalProps> = ({
  isOpen,
  onClose
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (promptType: 'friday_bulletin' | 'financial_audit' | 'transparency_summary' | 'custom') => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType,
          customPrompt: promptType === 'custom' ? customPrompt : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal memanggil Gemini AI');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menghubungi Asisten AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              Asisten AI Keuangan & Audit Masjid
            </h3>
            <p className="text-xs text-slate-400">Powered by Gemini 3.1 Pro (Thinking Mode) untuk Analisis Kas & Draf Pengumuman</p>
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

          {/* Quick AI Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">Pilih Tugas Otomatis Takmir:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              <button
                disabled={loading}
                onClick={() => handleGenerate('friday_bulletin')}
                className="p-3 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-600 rounded-xl text-left transition-all group"
              >
                <div className="text-indigo-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Draf Pengumuman Jumat
                </div>
                <p className="text-[11px] text-slate-400">Generasi draf Laporan Kas untuk dibacakan sebelum Shalat Jumat</p>
              </button>

              <button
                disabled={loading}
                onClick={() => handleGenerate('financial_audit')}
                className="p-3 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600 rounded-xl text-left transition-all group"
              >
                <div className="text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4" />
                  Audit & Efisiensi Kas
                </div>
                <p className="text-[11px] text-slate-400">Evaluasi rasio penerimaan vs pengeluaran operasional</p>
              </button>

              <button
                disabled={loading}
                onClick={() => handleGenerate('transparency_summary')}
                className="p-3 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-600 rounded-xl text-left transition-all group"
              >
                <div className="text-amber-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Ringkasan Transparansi
                </div>
                <p className="text-[11px] text-slate-400">Format pesan ringkas untuk grup WA Jamaah & Mading</p>
              </button>

            </div>
          </div>

          {/* Custom Prompt Bar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Atau Tanyakan Pertanyaan Spesifik Keuangan:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Misal: Berapa alokasi ideal Kas Yatim untuk bulan depan?"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                disabled={loading || !customPrompt.trim()}
                onClick={() => handleGenerate('custom')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center text-indigo-400 space-y-3 bg-slate-950 rounded-2xl border border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-white">Gemini 3.1 Pro Sedang Menganalisis Ledger Keuangan...</p>
                <p className="text-[11px] text-slate-400">Proses High Thinking Mode untuk akurasi rekomendasi takmir</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Analysis Result Display */}
          {analysisResult && !loading && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Hasil Analisis AI Takmir Masjid
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Gemini 3.1 Pro Preview</span>
              </div>

              <div className="markdown-body text-xs text-slate-200 leading-relaxed space-y-2">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
