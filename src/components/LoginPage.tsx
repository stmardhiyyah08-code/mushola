import React, { useState } from 'react';
import { Building2, KeyRound, ShieldCheck, UserCheck, Lock, ArrowLeft, CheckCircle2, User, Eye, EyeOff, Sparkles, Mail, UserPlus, LogIn, ShieldAlert, CheckSquare } from 'lucide-react';
import { UserSession, MosqueProfile } from '../types';
import { isSupabaseConfigured, registerUserToSupabase, verifyAndLoginUserInSupabase, verifyUserCodeInSupabase } from '../lib/supabase';
import { BiometricFaceIDScanner } from './BiometricFaceIDScanner';

interface LoginPageProps {
  mosque: MosqueProfile;
  onLoginSuccess: (session: UserSession) => void;
  onBackToApp?: () => void;
  canGoBack?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  mosque,
  onLoginSuccess,
  onBackToApp,
  canGoBack = false
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'treasurer' | 'auditor'>('treasurer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSession, setPendingSession] = useState<UserSession | null>(null);
  const [showFaceIDScanner, setShowFaceIDScanner] = useState(false);

  const roles = [
    {
      id: 'treasurer',
      title: 'Bendahara Masjid',
      person: mosque.bendahara,
      desc: 'Akses penuh pencatatan pemasukan, pengeluaran & kuitansi',
      icon: KeyRound,
      badge: 'Kelola Keuangan'
    },
    {
      id: 'admin',
      title: 'Ketua Takmir / Admin',
      person: mosque.ketuaTakmir,
      desc: 'Akses penuh manajemen profil masjid, QRIS & sistem',
      icon: ShieldCheck,
      badge: 'Super Admin'
    },
    {
      id: 'auditor',
      title: 'Auditor Independen',
      person: mosque.auditor,
      desc: 'Akses audit verifikasi integritas checksum ledger SHA-256',
      icon: UserCheck,
      badge: 'Verifikator'
    }
  ];

  // Submit Handler for Login, Register & OTP Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'verify') {
      if (!otpCode || otpCode.length < 4) {
        setErrorMsg('Masukkan 6 digit Kode Verifikasi OTP.');
        return;
      }

      setIsLoading(true);
      const res = await verifyUserCodeInSupabase(email, otpCode);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('Alhamdulillah! Akun Anda berhasil DIVERIFIKASI di Supabase Database. Silakan langsung login.');
        setMode('login');
        setOtpCode('');
      } else {
        setErrorMsg(res.error || 'Gagal memverifikasi kode OTP.');
      }
      return;
    }

    if (!email) {
      setErrorMsg('Mohon masukkan alamat Email resmi pengurus.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Password / PIN minimal 4 karakter.');
      return;
    }

    if (mode === 'register' && !name) {
      setErrorMsg('Mohon isi Nama Lengkap Pengurus.');
      return;
    }

    setIsLoading(true);

    if (mode === 'register') {
      const res = await registerUserToSupabase({
        email,
        name,
        role: selectedRole,
        password
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`Pendaftaran Berhasil! Kode Verifikasi OTP Anda adalah: ${res.verificationCode}. Masukkan kode ini untuk memverifikasi akun.`);
        setDemoCodeHint(res.verificationCode || '');
        setMode('verify');
      } else {
        setErrorMsg(res.error || 'Gagal mendaftarkan akun di Supabase.');
      }
    } else {
      // Login Verification directly against Supabase users table
      const res = await verifyAndLoginUserInSupabase(email, password, selectedRole);
      setIsLoading(false);

      if (res.success && res.user) {
        const newSession: UserSession = {
          isLogged: true,
          userRole: res.user.role || selectedRole,
          userName: res.user.name || name || 'Pengurus Masjid',
          authMethod: 'password',
          lastActive: new Date().toISOString()
        };
        // Trigger mandatory Biometric Face ID scan before granting session
        setPendingSession(newSession);
        setShowFaceIDScanner(true);
      } else if (res.isUnverified) {
        setErrorMsg(res.error || 'Akun Anda belum diverifikasi.');
        setMode('verify');
      } else {
        setErrorMsg(res.error || 'Gagal login. Akun tidak ditemukan di database Supabase.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {canGoBack && onBackToApp ? (
          <button
            onClick={onBackToApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Laporan Keuangan</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Building2 className="w-4.5 h-4.5 text-emerald-500" />
            <span>{mosque.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-medium">
            Database Supabase Connected
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Side Info Panel */}
        <div className="md:col-span-5 space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/50">
            <Building2 className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Portal Otentikasi & Verifikasi {mosque.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Seluruh pengurus masjid WAJIB terdaftar & diverifikasi di database Supabase sebelum dapat masuk ke dashboard keuangan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Verifikasi Keamanan Wajib</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Akun belum terdaftar di Supabase ditolak otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verifikasi Kode OTP 6-Digit sebelum login</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Terenkripsi SHA-256 & Supabase RLS</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="md:col-span-7 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>
                  {mode === 'login' && 'Masuk Sesi Pengurus'}
                  {mode === 'register' && 'Registrasi Akun Pengurus Baru'}
                  {mode === 'verify' && 'Verifikasi Kode OTP (6-Digit)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' && 'Verifikasi kredensial terdaftar di Supabase.'}
                {mode === 'register' && 'Daftarkan akun pengurus baru ke Supabase.'}
                {mode === 'verify' && 'Masukkan 6 digit kode OTP verifikasi Anda.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {mode !== 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  Batal / Login
                </button>
              )}

              {mode === 'login' && (
                <span className="text-[11px] text-slate-400 font-medium">
                  Penambahan akun dilakukan oleh Super Admin
                </span>
              )}
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Status Berhasil</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-200/90">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VERIFY OTP MODE */}
          {mode === 'verify' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pengurus@masjid.or.id"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Masukkan 6-Digit Kode Verifikasi (OTP)
                  </label>
                  {demoCodeHint && (
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">Kode OTP: {demoCodeHint}</span>
                  )}
                </div>
                
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Contoh: 123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Masukkan 6 digit kode OTP verifikasi Anda.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi Kode OTP...</span>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Verifikasi & Aktifkan Akun Supabase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* LOGIN / REGISTER MODE */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Pilih Peran Pengurus</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((r) => {
                    const IconComp = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{r.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                {r.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap Pengurus
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap & gelar..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Resmi Pengurus
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pengurus@masjid.or.id"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password / PIN Keamanan
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password / PIN..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <span>Memverifikasi ke Database Supabase...</span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Sesi {roles.find(r => r.id === selectedRole)?.title}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Lanjutkan Pendaftaran & Minta Kode OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-slate-500 text-xs py-2">
        <p>{mosque.name} • System Platform Keuangan Digital Mandiri</p>
      </div>

      {/* Biometric Face ID Scanner Step */}
      {showFaceIDScanner && pendingSession && (
        <BiometricFaceIDScanner
          userName={pendingSession.userName}
          userRole={pendingSession.userRole}
          onSuccess={() => {
            setShowFaceIDScanner(false);
            onLoginSuccess(pendingSession);
          }}
          onCancel={() => {
            setShowFaceIDScanner(false);
            setPendingSession(null);
            setErrorMsg('Verifikasi Biometrik Face ID Dibatalkan.');
          }}
        />
      )}

    </div>
  );
};
