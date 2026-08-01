import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Building2, Save, CheckCircle2, Copy, AlertCircle, RefreshCw, Upload, CreditCard } from 'lucide-react';
import { MosqueProfile } from '../types';
import { saveMosqueProfileToSupabase } from '../lib/supabase';

interface QRISManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: MosqueProfile;
  onUpdateMosque: (updated: MosqueProfile) => void;
}

export const QRISManagerModal: React.FC<QRISManagerModalProps> = ({
  isOpen,
  onClose,
  mosque,
  onUpdateMosque
}) => {
  const [nmid, setNmid] = useState(mosque.qrisNmid || 'ID102439871238491');
  const [merchantName, setMerchantName] = useState(mosque.qrisMerchantName || mosque.name);
  const [imageUrl, setImageUrl] = useState(mosque.qrisImageUrl || '');
  const [customPayload, setCustomPayload] = useState(
    mosque.qrisCustomPayload || 
    `00020101021226580016ID.GO.QRIS.WWW01189360091400000000005204581253033605802ID5920${mosque.qrisMerchantName || mosque.name}6013Jakarta South610512430`
  );

  const [bankAccounts, setBankAccounts] = useState(mosque.bankAccounts || []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'qris' | 'bank'>('qris');

  useEffect(() => {
    setNmid(mosque.qrisNmid || 'ID102439871238491');
    setMerchantName(mosque.qrisMerchantName || mosque.name);
    setImageUrl(mosque.qrisImageUrl || '');
    setCustomPayload(mosque.qrisCustomPayload || `00020101021226580016ID.GO.QRIS.WWW01189360091400000000005204581253033605802ID5920${mosque.name}6013Jakarta South610512430`);
    setBankAccounts(mosque.bankAccounts || []);
  }, [mosque]);

  if (!isOpen) return null;

  const handleBankChange = (index: number, field: string, value: string) => {
    const updated = [...bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setBankAccounts(updated);
  };

  const handleAddBank = () => {
    setBankAccounts([
      ...bankAccounts,
      { bankName: 'Bank Baru', accountNumber: '0000-0000-00', accountName: mosque.name }
    ]);
  };

  const handleRemoveBank = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const updatedProfile: MosqueProfile = {
      ...mosque,
      qrisNmid: nmid,
      qrisMerchantName: merchantName,
      qrisImageUrl: imageUrl,
      qrisCustomPayload: customPayload,
      bankAccounts: bankAccounts
    };

    const success = await saveMosqueProfileToSupabase(updatedProfile);
    onUpdateMosque(updatedProfile);
    setIsSaving(false);

    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Pengaturan QRIS & Rekening Bank Global</h3>
              <p className="text-xs text-emerald-200/80">Kelola Kode QRIS & Transfer Otomatis Masjid</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qris')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'qris'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Seting Kode QRIS</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bank'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Rekening Bank Transfer ({bankAccounts.length})</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Pengaturan QRIS & Rekening berhasil diperbarui dan tersimpan ke Supabase database!</span>
            </div>
          )}

          {activeTab === 'qris' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Form Input Fields */}
              <div className="md:col-span-7 space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Nama Merchant / Atas Nama QRIS
                  </label>
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    placeholder="Contoh: MASJID AGUNG AL-IKHLAS"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nama ini muncul saat donatur memindai QRIS.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    NMID (National Merchant ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={nmid}
                    onChange={(e) => setNmid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    placeholder="ID102439871238491"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    URL Gambar QRIS (Opsional Upload / External Link)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    placeholder="https://domain.com/qris-masjid.jpg"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kosongkan jika ingin menggunakan generator QRIS dinamis berbasis string payload.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    String Payload Raw QRIS (EMVCo Standards)
                  </label>
                  <textarea
                    rows={3}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    placeholder="00020101021226..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    String lengkap QRIS standar Bank Indonesia / ASPI.
                  </p>
                </div>

              </div>

              {/* QR Preview Widget */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Live Preview QRIS
                </span>

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="QRIS Preview"
                    className="w-48 h-48 object-contain rounded-xl border border-slate-300 shadow-sm bg-white p-2"
                  />
                ) : (
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200">
                    <QRCodeSVG value={customPayload || nmid} size={180} />
                  </div>
                )}

                <div className="mt-3 space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">{merchantName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">NMID: {nmid}</p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Daftar Rekening Bank Transfer</span>
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 border border-emerald-200 transition-all"
                >
                  + Tambah Rekening
                </button>
              </div>

              <div className="space-y-3">
                {bankAccounts.map((account, index) => (
                  <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Bank</label>
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => handleBankChange(index, 'bankName', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">No. Rekening</label>
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Atas Nama</label>
                        <input
                          type="text"
                          value={account.accountName}
                          onChange={(e) => handleBankChange(index, 'accountName', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(index)}
                        className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                        title="Hapus Rekening"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-100 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan QRIS</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
