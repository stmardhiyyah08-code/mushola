import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { RealtimeBalanceCards } from './components/RealtimeBalanceCards';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionTable } from './components/TransactionTable';
import { AddTransactionModal } from './components/AddTransactionModal';
import { DonationModal } from './components/DonationModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AIFinancialAssistantModal } from './components/AIFinancialAssistantModal';
import { WhatsAppManagerModal } from './components/WhatsAppManagerModal';
import { AuditIntegrityModal } from './components/AuditIntegrityModal';
import { CloudflareSupabaseModal } from './components/CloudflareSupabaseModal';
import { QRISManagerModal } from './components/QRISManagerModal';
import { LoginPage } from './components/LoginPage';

import { Transaction, MosqueProfile, UserSession, FinancialStats } from './types';
import { initialMosqueProfile, initialTransactions } from './data/mockData';
import { Building2, HeartHandshake, ShieldCheck, Heart, Sparkles, MessageSquare, Cloud, QrCode } from 'lucide-react';
import { saveTransactionToSupabase, saveMosqueProfileToSupabase } from './lib/supabase';

export default function App() {
  const [mosque, setMosque] = useState<MosqueProfile>(initialMosqueProfile);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [currentView, setCurrentView] = useState<'dashboard' | 'login'>('dashboard');
  
  // User Session state
  const [session, setSession] = useState<UserSession>({
    isLogged: false,
    userRole: 'guest',
    userName: 'Jamaah Donatur',
    authMethod: 'pin',
    lastActive: new Date().toISOString()
  });

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);

  // Fetch initial data from backend API
  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      })
      .catch(err => console.log('Using local client state initial data', err));

    fetch('/api/mosque-profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setMosque(data);
      })
      .catch(console.error);
  }, []);

  // Compute live financial statistics
  const stats: FinancialStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let kasUtamaBalance = 0;
    let kasYatimBalance = 0;
    let kasRenovasiBalance = 0;
    let kasZakatBalance = 0;

    transactions.forEach(t => {
      if (t.type === 'pemasukan') {
        totalIncome += t.amount;
        if (t.fundAccount === 'Kas Utama') kasUtamaBalance += t.amount;
        else if (t.fundAccount === 'Kas Yatim & Dhuafa') kasYatimBalance += t.amount;
        else if (t.fundAccount === 'Kas Renovasi') kasRenovasiBalance += t.amount;
        else if (t.fundAccount === 'Kas Zakat & Infaq') kasZakatBalance += t.amount;
      } else if (t.type === 'pengeluaran') {
        totalExpense += t.amount;
        if (t.fundAccount === 'Kas Utama') kasUtamaBalance -= t.amount;
        else if (t.fundAccount === 'Kas Yatim & Dhuafa') kasYatimBalance -= t.amount;
        else if (t.fundAccount === 'Kas Renovasi') kasRenovasiBalance -= t.amount;
        else if (t.fundAccount === 'Kas Zakat & Infaq') kasZakatBalance -= t.amount;
      }
    });

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthlyIncome: totalIncome,
      monthlyExpense: totalExpense,
      kasUtamaBalance,
      kasYatimBalance,
      kasRenovasiBalance,
      kasZakatBalance,
      transactionCount: transactions.length
    };
  }, [transactions]);

  // Handle Adding New Transaction
  const handleAddTransaction = async (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    await saveTransactionToSupabase(newTx);
  };

  // Handle Deleting Transaction
  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Editing Transaction
  const handleEditTransaction = async (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));

    try {
      await fetch(`/api/transactions/${updatedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Force display Login Page if user is not logged in or requested login view
  if (!session.isLogged || currentView === 'login') {
    return (
      <LoginPage
        mosque={mosque}
        canGoBack={session.isLogged}
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          setCurrentView('dashboard');
        }}
        onBackToApp={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      
      {/* Header */}
      <Header
        mosque={mosque}
        session={session}
        onOpenAuth={() => setCurrentView('login')}
        onLogout={() => {
          setSession({
            isLogged: false,
            userRole: 'guest',
            userName: 'Jamaah Donatur',
            authMethod: 'pin',
            lastActive: new Date().toISOString()
          });
        }}
        onOpenDonation={() => setIsDonationModalOpen(true)}
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenWA={() => setIsWAModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenCloudflare={() => setIsCloudflareModalOpen(true)}
        onOpenQRISManager={() => setIsQRISModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner Bento Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                SiMasjid Keuangan Real-time
              </span>
              <span className="text-xs text-slate-400 font-medium">• Terenkripsi SHA-256</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Laporan Kas & Donasi Masjid Transparan
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl">
              Pantau arus kas masuk, pengeluaran operasional, serta kuitansi digital terverifikasi secara akurat dan transparan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Infaq / Donasi QRIS</span>
            </button>

            <button
              onClick={() => setIsQRISModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold text-xs transition-all flex items-center gap-2 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Menu QRIS</span>
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Asisten AI</span>
            </button>
          </div>
        </div>

        {/* Realtime Balance Summary Cards */}
        <RealtimeBalanceCards transactions={transactions} stats={stats} />

        {/* Visual Charts */}
        <FinancialCharts transactions={transactions} />

        {/* Transaction History & Filter Table */}
        <TransactionTable
          transactions={transactions}
          mosque={mosque}
          session={session}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={handleEditTransaction}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>{mosque.name} • SiMasjid Platform Keuangan</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Terhubung ke Cloudflare & Supabase PostgreSQL • Enkripsi Ledger SHA-256
          </p>

          <div className="flex items-center gap-3 font-medium">
            <button
              onClick={() => setIsCloudflareModalOpen(true)}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Setup Cloudflare</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL DIALOGS */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        mosque={mosque}
      />

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        mosque={mosque}
      />

      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(newSession) => setSession(newSession)}
      />

      <QRISManagerModal
        isOpen={isQRISModalOpen}
        onClose={() => setIsQRISModalOpen(false)}
        mosque={mosque}
        onUpdateMosque={(updated) => setMosque(updated)}
      />

      <AIFinancialAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <WhatsAppManagerModal
        isOpen={isWAModalOpen}
        onClose={() => setIsWAModalOpen(false)}
        mosque={mosque}
      />

      <AuditIntegrityModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        transactions={transactions}
      />

      <CloudflareSupabaseModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />

    </div>
  );
}

