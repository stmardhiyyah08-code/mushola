-- ====================================================================
-- SIMASJID - SKEMA DATABASE SUPABASE POSTGRESQL REALTIME (TERBARU)
-- Platform Keuangan Digital Mandiri Masjid SDN 012 Tarakan
-- Terintegrasi Otomatis Untuk Seluruh Tabel & Menu Sistem:
-- 1. Profil Masjid & Rekening Transfer Bank Resmi
-- 2. Buku Kas Transaksi Keuangan & Kuitansi Digital
-- 3. Otentikasi User Pengurus, Verifikasi OTP & Sidik Jari WebAuthn Hardware
-- 4. Notifikasi WhatsApp Gateway Log
-- 5. Audit Integrity Ledger SHA-256 Chain
-- 6. Konfigurasi Sistem Cloudflare & Supabase
-- ====================================================================

-- 1. EXTENSIONS POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABEL 1: PROFIL MASJID & REKENING BANK TRANSFER
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.mosque_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Masjid SDN 012 Tarakan',
    tagline TEXT DEFAULT 'Transparan, Amanah, dan Berbasis Digital Untuk Kemaslahatan Umat',
    address TEXT DEFAULT 'Jl. Subrantas, Kota Tarakan',
    city VARCHAR(255) DEFAULT 'Kota Tarakan, Kalimantan Utara',
    phone VARCHAR(50) DEFAULT '+62 812-3456-7890',
    email VARCHAR(255) DEFAULT 'keuangan@masjid-sdn012tarakan.or.id',
    ketua_takmir VARCHAR(255) DEFAULT 'Pengurus Masjid',
    bendahara VARCHAR(255) DEFAULT 'Bendahara Masjid',
    auditor VARCHAR(255) DEFAULT 'Auditor Keuangan',
    
    -- Rekening Bank Transfer Global
    bank_accounts JSONB DEFAULT '[
        {"bankName": "Bank Syariah Indonesia (BSI)", "accountNumber": "7123-4567-89", "accountName": "Masjid SDN 012 Tarakan Kas Utama"},
        {"bankName": "Bank Mandiri", "accountNumber": "127-00-0987654-3", "accountName": "Masjid SDN 012 Tarakan Donasi"},
        {"bankName": "Bank Central Asia (BCA)", "accountNumber": "883-0987-123", "accountName": "Yayasan Masjid SDN 012 Tarakan"},
        {"bankName": "Bank Rakyat Indonesia (BRI)", "accountNumber": "0341-01-000456-30-2", "accountName": "Kas Pembangunan Masjid"}
    ]'::jsonb,

    -- Integrasi WhatsApp Gateway
    wa_gateway_status VARCHAR(50) DEFAULT 'connected',
    wa_gateway_number VARCHAR(50) DEFAULT '+6281234567890',
    wa_api_key TEXT DEFAULT 'sk_wa_live_98a7f6e5d4c3b2a1',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 2: BUKU KAS TRANSAKSI KEUANGAN & KUITANSI DIGITAL
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
-- TABEL 3: MANAJEMEN USER PENGURUS & OTENTIKASI SIDIK JARI WEBAUTHN
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'treasurer', 'auditor', 'guest')),
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_code VARCHAR(50) DEFAULT 'VERIFIED_SUPABASE',
    webauthn_credential_id TEXT DEFAULT '', -- ID Kredensial Sensor Sidik Jari Perangkat
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABEL 4: NOTIFIKASI WHATSAPP GATEWAY LOG
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
-- TABEL 5: AUDIT INTEGRITY LEDGER (ENKRIPSI SHA-256 CHAIN)
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
-- TABEL 6: KONFIGURASI SISTEM CLOUDFLARE & SUPABASE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEX PERFORMA DATABASE REALTIME
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_fund ON public.transactions(fund_account);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(is_verified, is_active);

-- ====================================================================
-- DATABASE VIEWS RINGKASAN DATA
-- ====================================================================

-- View 1: Saldo Kas Real-time per Akun
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

-- View 2: Pengurus Terverifikasi Supabase
CREATE OR REPLACE VIEW public.vw_verified_users AS
SELECT id, email, name, role, is_verified, is_active, created_at
FROM public.users
WHERE is_verified = true AND is_active = true;

-- ====================================================================
-- SEED DATA PROFIL MASJID (PRODUKSI BERSIH)
-- ====================================================================
INSERT INTO public.mosque_profile (id, name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Masjid SDN 012 Tarakan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_configs (config_key, config_value, description)
VALUES 
('APP_NAME', 'SiMasjid Platform Digital', 'Nama resmi aplikasi'),
('LEDGER_ENCRYPTION', 'SHA-256', 'Standar enkripsi ledger anti-tampering'),
('BIOMETRIC_AUTH', 'WEBAUTHN_HARDWARE_FINGERPRINT', 'Dukungan Biometrik Sidik Jari Hardware Perangkat'),
('SUPABASE_REALTIME', 'ENABLED', 'Status integrasi realtime')
ON CONFLICT (config_key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ====================================================================
ALTER TABLE public.mosque_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Policy Akses
CREATE POLICY "Public read mosque profile" ON public.mosque_profile FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (status = 'verified');
CREATE POLICY "Public read audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert donation transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Full access mosque profile" ON public.mosque_profile FOR ALL USING (true);
CREATE POLICY "Full access transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Full access wa notifications" ON public.wa_notifications FOR ALL USING (true);
CREATE POLICY "Full access audit logs" ON public.audit_logs FOR ALL USING (true);

-- ====================================================================
-- TRIGGER UPDATED_AT AUTOMATIC TIMESTAMP
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
