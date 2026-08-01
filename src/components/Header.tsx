import React from 'react';
import { 
  Building2, 
  LogOut, 
  KeyRound,
  UserCheck,
  Users
} from 'lucide-react';
import { MosqueProfile, UserSession } from '../types';

interface HeaderProps {
  mosque: MosqueProfile;
  session: UserSession;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUserManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mosque,
  session,
  onOpenAuth,
  onLogout,
  onOpenUserManager
}) => {
  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Mosque Identity & Live Status */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-100 text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">{mosque.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500">{mosque.address}, {mosque.city}</p>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Admin Only: Kelola Role & Tanggung Jawab Pengurus */}
            {session.isLogged && session.userRole === 'admin' && onOpenUserManager && (
              <button
                onClick={onOpenUserManager}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all shadow-sm"
                title="Kelola Hak Akses & Role Pengurus (Super Admin)"
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Kelola Role</span>
              </button>
            )}

            {/* Auth Session Button */}
            {session.isLogged ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right text-xs hidden lg:block">
                  <div className="font-bold text-emerald-700 flex items-center gap-1 justify-end">
                    <UserCheck className="w-3.5 h-3.5" />
                    {session.userName}
                  </div>
                  <div className="text-slate-500 uppercase text-[10px] font-medium">{session.userRole}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all text-xs"
                  title="Keluar Sesi Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-all active:scale-95"
              >
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Login Pengurus</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
