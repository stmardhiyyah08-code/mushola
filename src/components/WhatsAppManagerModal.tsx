import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2, RefreshCw, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { WANotification, MosqueProfile } from '../types';

interface WhatsAppManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: MosqueProfile;
}

export const WhatsAppManagerModal: React.FC<WhatsAppManagerModalProps> = ({
  isOpen,
  onClose,
  mosque
}) => {
  const [notifications, setNotifications] = useState<WANotification[]>([]);
  const [testPhone, setTestPhone] = useState('08123456789');
  const [testName, setTestName] = useState('Bpk. Jamaah');
  const [testMsg, setTestMsg] = useState('Tes Notifikasi Otomatis Keuangan Masjid SDN 012 Tarakan.');
  const [sending, setSending] = useState(false);

  // Fetch WA Notifications log
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/wa-notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/wa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: testPhone,
          recipientName: testName,
          message: testMsg
        })
      });

      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Integrasi Gateway Notifikasi WhatsApp
            </h3>
            <p className="text-xs text-slate-400">Pengiriman Otomatis Kuitansi Donasi Masuk & Pengeluaran Kas</p>
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

          {/* Gateway Status Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Status WA Gateway: Terhubung</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-400">Provider: Fonnte / Wablas API Gateway ({mosque.waGatewayNumber})</p>
              </div>
            </div>

            <button
              onClick={fetchLogs}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Refresh Log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Test Dispatch Form */}
          <form onSubmit={handleSendTest} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Uji Coba Pengiriman Pesan WA:</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Nama Penerima"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <input
                type="tel"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="No. WhatsApp (0812...)"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <textarea
              required
              rows={2}
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            ></textarea>

            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Kirim Pesan Tes WA'}</span>
            </button>
          </form>

          {/* Notification History Log Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Riwayat Pengiriman Notifikasi WhatsApp:</h4>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Penerima</th>
                    <th className="py-2.5 px-3">Pesan</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                  {notifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-200">{item.recipientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.recipientPhone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="line-clamp-2 text-[11px] text-slate-300">{item.message}</p>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {new Date(item.sentAt).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          200 OK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
