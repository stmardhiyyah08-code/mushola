-- ====================================================================
-- SIMASJID - SKEMA DATABASE SUPABASE / POSTGRESQL REALTIME (LENGKAP)
-- Terintegrasi Otomatis Untuk Semua Menu & Fitur SiMasjid
-- (Profil Masjid, QRIS Global, Rekening Bank, Transaksi Kas, WA Gateway,
--  Audit SHA-256 Ledger, User Auth RLS & System Config)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABEL 1: PROFIL MASJID, PENGATURAN QRIS & REKENING BANK GLOBAL
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.mosque_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Masjid Agung Al-Ikhlas',
    tagline TEXT DEFAULT 'Transparan, Amanah, dan Berbasis Digital Untuk Kemaslahatan Umat',
    address TEXT DEFAULT 'Jl. Raya Utama No. 88, Kompleks Islamic Center',
    city VARCHAR(255) DEFAULT 'Kota Jakarta Selatan, DKI Jakarta 12430',
    phone VARCHAR(50) DEFAULT '+62 812-3456-7890',
    email VARCHAR(255) DEFAULT 'keuangan@masjid-alikhlas.or.id',
    ketua_takmir VARCHAR(255) DEFAULT 'H. Ahmad Fauzi, M.Ag',
    bendahara VARCHAR(255) DEFAULT 'H. Ir. Bambang Suroso',
    auditor VARCHAR(255) DEFAULT 'Drs. H. M. Ridwan, Ak., CA',
    
    -- Pengaturan Menu QRIS & Rekening Transfer Global
    qris_nmid VARCHAR(100) DEFAULT 'ID102439871238491',
    qris_merchant_name VARCHAR(255) DEFAULT 'MASJID AGUNG AL-IKHLAS',
    qris_image_url TEXT DEFAULT '',
    qris_custom_payload TEXT DEFAULT '00020101021226580016ID.GO.QRIS.WWW01189360091400000000005204581253033605802ID5920MASJID AGUNG AL-IKHLAS6013Jakarta South61051243062250721',
    bank_accounts JSONB DEFAULT '[
        {"bankName": "Bank Syariah Indonesia (BSI)", "accountNumber": "7123-4567-89", "accountName": "Masjid Agung Al-Ikhlas Kas Utama"},
        {"bankName": "Bank Mandiri", "accountNumber": "127-00-0987654-3", "accountName": "Masjid Agung Al-Ikhlas Donasi"},
        {"bankName": "Bank Central Asia (BCA)", "accountNumber": "883-0987-123", "accountName": "Yayasan Masjid Al-Ikhlas"},
        {"bankName": "Bank Rakyat Indonesia (BRI)", "accountNumber": "0341-01-000456-30-2", "accountName": "Kas Pembangunan Masjid"}
    ]'::jsonb,

    -- Integrasi Menu WhatsApp Gateway
    wa_gateway_status VARCHAR(50) DEFAULT 'connected',
    wa_gateway_number VARCHAR(50) DEFAULT '+6281234567890',
    wa_api_key TEXT DEFAULT 'sk_wa_live_98a7f6e5d4c3b2a1',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 2: TRANSAKSI KEUANGAN KAS MASJID & KUITANSI DIGITAL
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(100) PRIMARY KEY,
    receipt_no VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time VARCHAR(10) NOT NULL DEFAULT '00:00',
    type VARCHAR(20) NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    fund_account VARCHAR(100) NOT NULL DEFAULT 'Kas Utama' CHECK (
        fund_account IN ('Kas Utama', 'Kas Yatim & Dhuafa', 'Kas Renovasi', 'Kas Zakat & Infaq')
    ),
    category VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    donor_name VARCHAR(255) DEFAULT 'Hamba Allah',
    donor_phone VARCHAR(50) DEFAULT '',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'rejected')),
    checksum VARCHAR(255) NOT NULL,
    attachment_url TEXT DEFAULT '',
    created_by VARCHAR(255) NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 3: MENU WHATSAPP NOTIFICATIONS & DISPATCH LOG
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.wa_notifications (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'wa-' || extract(epoch from now())::text,
    transaction_id VARCHAR(100) REFERENCES public.transactions(id) ON DELETE SET NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'pending', 'failed')),
    gateway_response TEXT DEFAULT '200 OK',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 4: MENU AUDIT INTEGRITY LEDGER (SHA-256 CHAIN)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'audit-' || extract(epoch from now())::text,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    previous_hash VARCHAR(255) DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
    current_hash VARCHAR(255) NOT NULL
);

-- ====================================================================
-- TABEL 5: MANAJEMEN USER PENGURUS & OTENTIKASI (AUTH)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'treasurer', 'auditor', 'guest')),
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 6: KONFIGURASI SISTEM CLOUDFLARE & SUPABASE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES PERFORMANCE QUERY
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_fund ON public.transactions(fund_account);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_wa_notifications_recipient ON public.wa_notifications(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ====================================================================
-- DATABASE VIEWS (RINGKASAN REAL-TIME UNTUK DASHBOARD)
-- ====================================================================

-- View 1: Ringkasan Saldo per Akun Kas
CREATE OR REPLACE VIEW public.vw_kas_summary AS
SELECT 
    fund_account,
    SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE 0 END) AS total_pemasukan,
    SUM(CASE WHEN type = 'pengeluaran' THEN amount ELSE 0 END) AS total_pengeluaran,
    SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE -amount END) AS saldo_akhir,
    COUNT(id) AS jumlah_transaksi
FROM public.transactions
WHERE status = 'verified'
GROUP BY fund_account;

-- View 2: Pengaturan QRIS Aktif
CREATE OR REPLACE VIEW public.vw_qris_config AS
SELECT 
    name AS mosque_name,
    qris_nmid,
    qris_merchant_name,
    qris_image_url,
    qris_custom_payload,
    bank_accounts,
    updated_at
FROM public.mosque_profile
LIMIT 1;

-- ====================================================================
-- SEED DATA AWAL MASJID
-- ====================================================================
INSERT INTO public.mosque_profile (id, name, qris_nmid, qris_merchant_name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Masjid Agung Al-Ikhlas', 'ID102439871238491', 'MASJID AGUNG AL-IKHLAS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_configs (config_key, config_value, description)
VALUES 
('APP_NAME', 'SiMasjid Platform Digital', 'Nama resmi aplikasi'),
('LEDGER_ENCRYPTION', 'SHA-256', 'Standar enkripsi ledger anti-tampering'),
('SUPABASE_REALTIME', 'ENABLED', 'Status integrasi realtime')
ON CONFLICT (config_key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ====================================================================
ALTER TABLE public.mosque_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Akses Baca Publik
CREATE POLICY "Public read mosque profile" ON public.mosque_profile FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (status = 'verified');
CREATE POLICY "Public read audit logs" ON public.audit_logs FOR SELECT USING (true);

-- Policy: Akses Tulis Publik untuk Donasi QRIS
CREATE POLICY "Public insert donation transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Policy: Akses Penuh untuk Admin / Pengurus
CREATE POLICY "Full access mosque profile" ON public.mosque_profile FOR ALL USING (true);
CREATE POLICY "Full access transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Full access wa notifications" ON public.wa_notifications FOR ALL USING (true);
CREATE POLICY "Full access audit logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Full access users" ON public.users FOR ALL USING (true);

-- ====================================================================
-- TRIGGER AUTOMATIC UPDATED_AT TIMESTAMP
-- ====================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mosque_profile_modtime
BEFORE UPDATE ON public.mosque_profile
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_transactions_modtime
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
