import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, CheckCircle2, RefreshCw, Lock, AlertTriangle, XCircle, RotateCcw, Smartphone } from 'lucide-react';
import { verifyAndroidBiometric, registerAndroidBiometric, isWebAuthnSupported } from '../lib/webauthn';

interface BiometricFaceIDScannerProps {
  userName: string;
  userRole: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricFaceIDScanner: React.FC<BiometricFaceIDScannerProps> = ({
  userName,
  userRole,
  onSuccess,
  onCancel
}) => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('Sentuh sensor sidik jari HP / Laptop Anda...');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSupport() {
      const supported = await isWebAuthnSupported();
      setIsSupported(supported);
      if (supported) {
        // Trigger hardware fingerprint scan automatically on modal open
        triggerHardwareFingerprint();
      } else {
        setScanStatus('failed');
        setStatusMessage('❌ Perangkat Tidak Mendukung Sensor Sidik Jari');
        setErrorMessage('HP/Laptop ini tidak memiliki sensor Biometrik WebAuthn/Passkey.');
      }
    }
    checkSupport();
  }, []);

  // Trigger Hardware Fingerprint Biometric Scan (Strict Matching)
  const triggerHardwareFingerprint = async () => {
    setScanStatus('scanning');
    setStatusMessage('Memindai Sidik Jari Fisik dari Sensor Perangkat...');
    setErrorMessage('');

    const emailDummy = `${userName.toLowerCase().replace(/\s+/g, '')}@masjid.or.id`;

    try {
      // 1. Attempt hardware fingerprint verification
      const res = await verifyAndroidBiometric(emailDummy);

      if (res.success) {
        setScanStatus('success');
        setStatusMessage('Sidik Jari Asli Terverifikasi ✓');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        // 2. If credential not registered yet, prompt registration of physical fingerprint
        const regRes = await registerAndroidBiometric(emailDummy, userName);
        
        if (regRes.success) {
          setScanStatus('success');
          setStatusMessage('Sidik Jari Asli Berhasil Didaftarkan & Terverifikasi ✓');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          // STRICT HARDWARE FAILURE: Fingerprint rejected or cancelled!
          setScanStatus('failed');
          setStatusMessage('❌ Otentikasi Sidik Jari Gagal!');
          setErrorMessage(regRes.error || res.error || 'Akses ditolak! Sidik jari tidak cocok atau dibatalkan.');
        }
      }
    } catch (err: any) {
      setScanStatus('failed');
      setStatusMessage('❌ Otentikasi Sidik Jari Gagal!');
      setErrorMessage(err.message || 'Sensor sidik jari menolak otentikasi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center space-y-6">
        
        {/* Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>Hardware Biometric Fingerprint Active</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Otentikasi Sidik Jari Pengurus
          </h2>
          <p className="text-xs text-slate-400">
            Pengurus: <strong className="text-emerald-400">{userName}</strong> ({userRole.toUpperCase()})
          </p>
        </div>

        {/* Physical Fingerprint Sensor Reticle */}
        <div
          onClick={scanStatus === 'failed' ? triggerHardwareFingerprint : undefined}
          className={`relative w-44 h-44 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 ${
            scanStatus === 'success'
              ? 'border-emerald-500 bg-emerald-950/50 shadow-[0_0_30px_#10b981]'
              : scanStatus === 'failed'
              ? 'border-rose-500 bg-rose-950/50 shadow-[0_0_30px_#f43f5e]'
              : 'border-emerald-500/80 bg-slate-950 shadow-[0_0_20px_#059669]'
          }`}
        >
          {/* Fingerprint Sensor Icon */}
          <div className="relative">
            <Fingerprint className={`w-24 h-24 transition-all duration-300 ${
              scanStatus === 'success'
                ? 'text-emerald-400 scale-110'
                : scanStatus === 'failed'
                ? 'text-rose-500'
                : 'text-emerald-400 animate-pulse'
            }`} />

            {scanStatus === 'scanning' && (
              <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-75" />
            )}
          </div>

          {/* Success Overlay */}
          {scanStatus === 'success' && (
            <div className="absolute inset-0 bg-emerald-950/90 rounded-full flex flex-col items-center justify-center text-white space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Akses Diberikan</span>
            </div>
          )}

          {/* Failure Overlay */}
          {scanStatus === 'failed' && (
            <div className="absolute inset-0 bg-rose-950/90 rounded-full flex flex-col items-center justify-center text-white space-y-1 animate-in zoom-in-95">
              <XCircle className="w-12 h-12 text-rose-500" />
              <span className="text-xs font-bold text-rose-200">Akses Ditolak</span>
            </div>
          )}
        </div>

        {/* Status Message & Error Alert */}
        <div className="w-full space-y-3">
          <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 ${
            scanStatus === 'failed'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              : scanStatus === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            {scanStatus === 'scanning' && <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />}
            {scanStatus === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
            {scanStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{statusMessage}</span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/90 border border-rose-500/40 rounded-2xl text-xs text-rose-300 text-left leading-relaxed">
              <div className="font-bold flex items-center gap-1 text-rose-400 mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Sensor Biometrik Menolak Sesi:</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Trigger Button */}
        {scanStatus !== 'success' && (
          <button
            type="button"
            onClick={triggerHardwareFingerprint}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pindai Sidik Jari Sekarang</span>
          </button>
        )}

        {/* Actions */}
        <div className="w-full pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
          >
            Batal / Logout
          </button>

          <span className="text-[11px] text-slate-500">
            FIDO2 / WebAuthn Hardware Sensor
          </span>
        </div>

      </div>
    </div>
  );
};
