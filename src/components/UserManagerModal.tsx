import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, ShieldCheck, Trash2, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Lock, UserCheck } from 'lucide-react';
import { fetchUsersFromSupabase, addUserByAdminToSupabase, deleteUserFromSupabase } from '../lib/supabase';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Form State for Adding New User
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'treasurer' | 'admin' | 'auditor'>('treasurer');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await fetchUsersFromSupabase();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !name || !password) {
      setErrorMsg('Mohon lengkapi seluruh bidang pendaftaran.');
      return;
    }

    setIsSubmitting(true);
    const res = await addUserByAdminToSupabase({
      email,
      name,
      role,
      password
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Berhasil menambahkan ${name} sebagai ${role.toUpperCase()} di Supabase!`);
      setEmail('');
      setName('');
      setPassword('');
      loadUsers();
      setActiveTab('list');
    } else {
      setErrorMsg(res.error || 'Gagal menambahkan user.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akses pengurus ${userName}?`)) {
      const ok = await deleteUserFromSupabase(userId);
      if (ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Kelola Akses Pengurus & Role (Khusus Admin)</h3>
              <p className="text-xs text-emerald-200/80">Manajemen Hak Akses & Penambahan Tanggung Jawab Pengurus</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengurus Terdaftar ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pengurus Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LIST USERS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Memuat daftar pengurus dari Supabase...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">Belum Ada Pengurus Tambahan di Supabase</p>
                  <p className="text-[11px] mt-1">Klik "+ Tambah Pengurus Baru" di atas untuk menambahkan hak akses Bendahara/Auditor.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Hapus Hak Akses Pengurus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD USER FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Nama Lengkap Pengurus
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bpk. H. Supriadi, M.Ag"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Email Resmi Pengurus
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pengurus@masjid.or.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Pilih Peran / Tanggung Jawab (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('treasurer')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'treasurer'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Bendahara
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'admin'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Super Admin
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('auditor')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'auditor'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Auditor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Password / PIN Keamanan Awal
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password awal..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Supabase...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Tambahkan Hak Akses Pengurus</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
