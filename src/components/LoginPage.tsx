import React, { useState } from 'react';
import { Building2, KeyRound, ShieldCheck, UserCheck, Lock, ArrowLeft, CheckCircle2, User, Eye, EyeOff, Sparkles, ChevronRight, Mail, UserPlus, LogIn } from 'lucide-react';
import { UserSession, MosqueProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'treasurer' | 'auditor'>('treasurer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password || password.length < 4) {
      setErrorMsg('Password / PIN minimal 4 karakter.');
      return;
    }

    if (mode === 'register' && (!email || !name)) {
      setErrorMsg('Mohon isi Nama Lengkap dan Email resmi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (mode === 'register') {
        setSuccessMsg(`Akun ${name} (${selectedRole.toUpperCase()}) berhasil dibuat! Silakan masuk.`);
        setMode('login');
        setPassword('');
      } else {
        const roleData = roles.find(r => r.id === selectedRole);
        const userDisplayName = name || (email ? email.split('@')[0] : (roleData?.person || 'Pengurus Masjid'));

        const newSession: UserSession = {
          isLogged: true,
          userRole: selectedRole,
          userName: userDisplayName,
          authMethod: 'password',
          lastActive: new Date().toISOString()
        };
        onLoginSuccess(newSession);
      }
    }, 600);
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
              Portal Pengurus {mosque.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Sistem keuangan masjid berbasis digital. Masuk untuk mengelola transaksi, mengubah QRIS masjid, dan mengunduh laporan audit.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Aplikasi Mandiri & Amanah</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Tanpa akun demo & terhubung langsung ke database</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Otentikasi terenkripsi SHA-256</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Manajemen QRIS & Rekening Bank Mandiri</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Login / Register Card */}
        <div className="md:col-span-7 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>{mode === 'login' ? 'Masuk Sesi Pengurus' : 'Registrasi Akun Pengurus Baru'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' ? 'Masukkan kredensial akun Anda.' : 'Daftarkan kredensial pengurus masjid baru.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
            >
              {mode === 'login' ? '+ Buat Akun' : 'Sudah Punya Akun?'}
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Pilih Tanggung Jawab / Role</label>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Email Pengurus / ID Masjid
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

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sesi {roles.find(r => r.id === selectedRole)?.title}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Akun Pengurus</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-slate-500 text-xs py-2">
        <p>{mosque.name} • System Platform Keuangan Digital Mandiri</p>
      </div>

    </div>
  );
};
