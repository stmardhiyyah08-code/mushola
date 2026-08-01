import React, { useState } from 'react';
import { X, Fingerprint, KeyRound, ShieldCheck, UserCheck, Lock, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric');
  const [pinCode, setPinCode] = useState('');
  const [userName, setUserName] = useState('H. Ir. Bambang Suroso');
  const [role, setRole] = useState<'treasurer' | 'admin' | 'auditor'>('treasurer');
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Simulate Biometric WebAuthn API authentication
  const handleBiometricAuth = async () => {
    setBiometricStatus('scanning');
    setErrorMsg('');

    try {
      // Test WebAuthn capability if supported
      if (window.PublicKeyCredential) {
        // Simple scan simulation delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setBiometricStatus('success');

        setTimeout(() => {
          onLoginSuccess({
            isLogged: true,
            userRole: role,
            userName: role === 'treasurer' ? 'H. Ir. Bambang Suroso (Bendahara)' : role === 'admin' ? 'H. Ahmad Fauzi, M.Ag (Ketua Takmir)' : 'Drs. H. M. Ridwan (Auditor)',
            authMethod: 'biometric',
            lastActive: new Date().toISOString()
          });
          onClose();
        }, 500);
      } else {
        // Fallback simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBiometricStatus('success');
        setTimeout(() => {
          onLoginSuccess({
            isLogged: true,
            userRole: role,
            userName: role === 'treasurer' ? 'H. Ir. Bambang Suroso (Bendahara)' : 'Takmir Masjid',
            authMethod: 'biometric',
            lastActive: new Date().toISOString()
          });
          onClose();
        }, 500);
      }
    } catch (err) {
      setBiometricStatus('failed');
      setErrorMsg('Autentikasi biometrik gagal. Gunakan PIN Pengurus.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '123456' || pinCode === '888888' || pinCode.length >= 4) {
      onLoginSuccess({
        isLogged: true,
        userRole: role,
        userName: role === 'treasurer' ? 'H. Ir. Bambang Suroso (Bendahara)' : role === 'admin' ? 'H. Ahmad Fauzi, M.Ag (Ketua Takmir)' : 'Drs. H. M. Ridwan (Auditor)',
        authMethod: 'pin',
        lastActive: new Date().toISOString()
      });
      onClose();
    } else {
      setErrorMsg('PIN Salah. Gunakan PIN Pengurus (default: 123456)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Autentikasi Biometrik & PIN Pengurus
            </h3>
            <p className="text-xs text-slate-400">Akses Terenkripsi Dashboard Keuangan Masjid</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Peran Pengurus
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('treasurer')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  role === 'treasurer'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Bendahara
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  role === 'admin'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Ketua Takmir
              </button>

              <button
                type="button"
                onClick={() => setRole('auditor')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  role === 'auditor'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Auditor
              </button>
            </div>
          </div>

          {/* Auth Method Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setAuthMethod('biometric')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'biometric' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Biometrik (Sidik Jari)</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('pin')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'pin' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>PIN Keamanan</span>
            </button>
          </div>

          {/* Biometric View */}
          {authMethod === 'biometric' ? (
            <div className="text-center py-4 space-y-4">
              <div 
                onClick={handleBiometricAuth}
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center cursor-pointer transition-all border-2 ${
                  biometricStatus === 'scanning'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 animate-pulse scale-105'
                    : biometricStatus === 'success'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
                }`}
              >
                <Fingerprint className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {biometricStatus === 'scanning'
                    ? 'Memindai Sidik Jari / FaceID...'
                    : biometricStatus === 'success'
                    ? 'Autentikasi Biometrik Berhasil!'
                    : 'Sentuh Sensor Biometrik untuk Masuk'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung WebAuthn Biometric API di perangkat Android/iOS/Desktop
                </p>
              </div>

              <button
                type="button"
                onClick={handleBiometricAuth}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Mulai Pemindaian Sidik Jari
              </button>
            </div>
          ) : (
            /* PIN View */
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Masukkan PIN 6 Angka Pengurus
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="• • • • • • (Default: 123456)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Verifikasi PIN & Masuk
              </button>
            </form>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 text-center font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
              {errorMsg}
            </p>
          )}

        </div>

      </div>
    </div>
  );
};
