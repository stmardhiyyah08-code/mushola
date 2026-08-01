import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import { initialTransactions, initialMosqueProfile, initialWANotifications, initialAuditLogs } from './src/data/mockData.js';
import { Transaction, MosqueProfile, WANotification, AuditLog } from './src/types.js';

dotenv.config();

// In-memory persistent data store
let mosqueProfileStore: MosqueProfile = { ...initialMosqueProfile };
let transactionsStore: Transaction[] = [...initialTransactions];
let waNotificationsStore: WANotification[] = [...initialWANotifications];
let auditLogsStore: AuditLog[] = [...initialAuditLogs];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES --- //

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Get Mosque Profile & Stats
  app.get('/api/mosque-profile', (req, res) => {
    res.json(mosqueProfileStore);
  });

  // Update Mosque Profile & QRIS Settings
  app.put('/api/mosque-profile', (req, res) => {
    try {
      mosqueProfileStore = { ...mosqueProfileStore, ...req.body };
      res.json({ success: true, profile: mosqueProfileStore });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Transactions
  app.get('/api/transactions', (req, res) => {
    res.json({
      transactions: transactionsStore,
      totalCount: transactionsStore.length
    });
  });

  // Create Transaction
  app.post('/api/transactions', (req, res) => {
    try {
      const newTx: Transaction = req.body;
      if (!newTx.id) {
        newTx.id = 'tx-' + Date.now();
      }
      
      transactionsStore.unshift(newTx);

      // Create Audit Log
      const newAudit: AuditLog = {
        id: 'audit-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: newTx.createdBy || 'System Admin',
        action: newTx.type === 'pemasukan' ? 'RECORD_INCOME' : 'RECORD_EXPENSE',
        details: `Transaksi ${newTx.type.toUpperCase()}: ${newTx.category} sebesar Rp ${newTx.amount.toLocaleString('id-ID')}`,
        previousHash: auditLogsStore[0]?.currentHash || '0000000000',
        currentHash: newTx.checksum
      };
      auditLogsStore.unshift(newAudit);

      // Auto-trigger WA Notification if phone provided
      if (newTx.donorPhone) {
        const newWA: WANotification = {
          id: 'wa-' + Date.now(),
          transactionId: newTx.id,
          recipientPhone: newTx.donorPhone,
          recipientName: newTx.donorName || 'Jamaah Donatur',
          message: `Jazakallahu Khairan! Donasi/Transaksi Anda di ${initialMosqueProfile.name} sebesar Rp ${newTx.amount.toLocaleString('id-ID')} (${newTx.category}) telah tercatat di Laporan Keuangan Real-time. No KWT: ${newTx.receiptNo}.`,
          sentAt: new Date().toISOString(),
          status: 'sent',
          gatewayResponse: '200 OK (Auto-Dispatched via Gateway API)'
        };
        waNotificationsStore.unshift(newWA);
      }

      res.status(201).json({ success: true, transaction: newTx });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Transaction
  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const index = transactionsStore.findIndex(t => t.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    transactionsStore[index] = { ...transactionsStore[index], ...req.body };
    res.json({ success: true, transaction: transactionsStore[index] });
  });

  // Delete Transaction
  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    transactionsStore = transactionsStore.filter(t => t.id !== id);
    res.json({ success: true, deletedId: id });
  });

  // Get WhatsApp Notifications
  app.get('/api/wa-notifications', (req, res) => {
    res.json(waNotificationsStore);
  });

  // Dispatch Manual WA Notification
  app.post('/api/wa/send', (req, res) => {
    const { recipientPhone, recipientName, message, transactionId } = req.body;
    const notification: WANotification = {
      id: 'wa-' + Date.now(),
      transactionId: transactionId || 'tx-manual',
      recipientPhone,
      recipientName,
      message,
      sentAt: new Date().toISOString(),
      status: 'sent',
      gatewayResponse: '200 OK (Dispatched via Fonnte/Wablas Gateway Simulator)'
    };
    waNotificationsStore.unshift(notification);
    res.json({ success: true, notification });
  });

  // Get Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(auditLogsStore);
  });

  // --- GEMINI AI FINANCIAL ASSISTANT ROUTE --- //
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is missing.'
        });
        return;
      }

      const { promptType, customPrompt } = req.body;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare context summary from transactions
      const totalIncome = transactionsStore.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.amount, 0);
      const totalExpense = transactionsStore.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.amount, 0);
      const balance = totalIncome - totalExpense;

      const txSummary = transactionsStore.slice(0, 10).map(t =>
        `- [${t.date}] ${t.type.toUpperCase()}: Rp ${t.amount.toLocaleString('id-ID')} (${t.category} - ${t.description}) [${t.fundAccount}]`
      ).join('\n');

      let systemPrompt = `Anda adalah Asisten Keuangan & Audit AI Senior untuk Masjid Agung Al-Ikhlas.
      Data Keuangan Saat Ini:
      - Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
      - Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
      - Saldo Kas Berjalan: Rp ${balance.toLocaleString('id-ID')}

      Sepuluh Transaksi Terakhir:
      ${txSummary}

      Berikan analisis terstruktur, bahasa santun, profesional, Islami, dan informatif. Gunakan format Markdown rapi.`;

      let userMessage = customPrompt;
      if (promptType === 'friday_bulletin') {
        userMessage = `Buatkan draf teks Pengumuman Laporan Keuangan Masjid untuk dibacakan Pengurus/Ketua Takmir sebelum Shalat Jumat. Sertakan rincian saldo awal, total infaq masuk pekan ini, pengeluaran operasional, dan saldo akhir per akun kas secara ringkas & jelas bagi jamaah.`;
      } else if (promptType === 'financial_audit') {
        userMessage = `Lakukan audit keuangan ringkas terhadap kas masjid saat ini. Evaluasi efisiensi pengeluaran operasional (listrik, AC, gaji marbot) dibandingkan dengan rasio penerimaan infaq/sedekah. Berikan 3 rekomendasi strategis penghematan & optimalisasi kas.`;
      } else if (promptType === 'transparency_summary') {
        userMessage = `Buatkan ringkasan transparansi keuangan bulanan untuk dipublikasikan di mading masjid dan grup WhatsApp jamaah, lengkap dengan ucapan terima kasih dan doa bagi para donatur.`;
      }

      // Call Gemini 3.1 Pro Preview with HIGH thinking mode as required
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });

      res.json({
        analysis: response.text
      });
    } catch (err: any) {
      console.error('Gemini AI error:', err);
      res.status(500).json({
        error: err.message || 'Gagal memproses analisis AI.'
      });
    }
  });

  // --- VITE / STATIC SERVING --- //
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SiMasjid running on http://localhost:${PORT}`);
  });
}

startServer();
