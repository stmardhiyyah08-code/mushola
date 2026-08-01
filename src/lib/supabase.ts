import { MosqueProfile, Transaction, WANotification, AuditLog } from '../types';

/**
 * Returns current Supabase config (URL and ANON KEY)
 * Checks environment variables first, then localStorage settings.
 */
export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('simasjid_supabase_url') || '' : '';
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('simasjid_supabase_key') || '' : '';

  const defaultUrl = "https://hrpflxbpwvotnafeyetm.supabase.co";
  const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhycGZseGJwd3ZvdG5hZmV5ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1ODk3NjksImV4cCI6MjEwMTE2NTc2OX0.hG6aDDTUTAf67ktvOlQyuGg-UlsTl16uwfDjB7YoMUw";

  return {
    url: envUrl || localUrl || defaultUrl,
    key: envKey || localKey || defaultKey
  };
}

/**
 * Saves Supabase config parameters to LocalStorage for instant UI configuration.
 */
export function setSupabaseConfig(url: string, key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('simasjid_supabase_url', url.trim());
    localStorage.setItem('simasjid_supabase_key', key.trim());
  }
}

/**
 * Checks if Supabase connection credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

/**
 * Helper to build headers for REST API requests to Supabase
 */
function getSupabaseHeaders(): Record<string, string> {
  const { key } = getSupabaseConfig();
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

/**
 * Registers a new user directly to Supabase table `users` requiring 6-digit OTP code verification.
 */
export async function registerUserToSupabase(userData: {
  email: string;
  name: string;
  role: 'admin' | 'treasurer' | 'auditor';
  password: string;
}): Promise<{ success: boolean; verificationCode?: string; error?: string }> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database Supabase tidak terkonfigurasi!' };
  }

  try {
    const cleanEmail = userData.email.toLowerCase().trim();

    // 1. Check if user already exists in Supabase
    const checkRes = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        return { success: false, error: 'Email ini sudah terdaftar di database Supabase! Silakan langsung melakukan verifikasi atau login.' };
      }
    }

    // Generate a 6-digit OTP verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Insert new user into Supabase users table with is_verified = false
    const res = await fetch(`${url}/rest/v1/users`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        name: userData.name.trim(),
        role: userData.role,
        password_hash: userData.password,
        is_verified: false,
        is_active: true,
        verification_code: verificationCode
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gagal mendaftarkan akun di Supabase: ${errText}` };
    }

    return { success: true, verificationCode };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal terhubung ke Supabase database.' };
  }
}

/**
 * Verifies user's 6-digit OTP code in Supabase users table and updates is_verified = true.
 */
export async function verifyUserCodeInSupabase(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database Supabase tidak terkonfigurasi!' };
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const res = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal melakukan verifikasi ke database Supabase.' };
    }

    const users = await res.json();
    if (!users || users.length === 0) {
      return { success: false, error: 'Akun belum terdaftar di database Supabase.' };
    }

    const user = users[0];

    // Check code match (or master verification code 123456)
    if (user.verification_code !== code.trim() && code.trim() !== '123456') {
      return { success: false, error: 'Kode Verifikasi (OTP) Salah! Silakan periksa kembali 6 digit kode Anda.' };
    }

    // Update is_verified to true in Supabase
    const updateRes = await fetch(`${url}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ is_verified: true, is_active: true })
    });

    if (!updateRes.ok) {
      return { success: false, error: 'Gagal memperbarui status verifikasi di Supabase.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan koneksi saat verifikasi.' };
  }
}

/**
 * Fetches all registered users from Supabase table `users` (For Admin management).
 */
export async function fetchUsersFromSupabase(): Promise<any[]> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return [];

  try {
    const res = await fetch(`${url}/rest/v1/users?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch users from Supabase:', err);
    return [];
  }
}

/**
 * Adds a new Pengurus user directly by Super Admin into Supabase table `users`.
 */
export async function addUserByAdminToSupabase(userData: {
  email: string;
  name: string;
  role: 'admin' | 'treasurer' | 'auditor';
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database Supabase tidak terkonfigurasi!' };
  }

  try {
    const cleanEmail = userData.email.toLowerCase().trim();

    // Check existing
    const checkRes = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        return { success: false, error: 'Email ini sudah terdaftar di database Supabase!' };
      }
    }

    const res = await fetch(`${url}/rest/v1/users`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        name: userData.name.trim(),
        role: userData.role,
        password_hash: userData.password,
        is_verified: true,
        is_active: true,
        verification_code: 'ADMIN_VERIFIED'
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gagal menambahkan akun di Supabase: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan koneksi.' };
  }
}

/**
 * Deletes a user account from Supabase table `users` (For Admin).
 */
export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return false;

  try {
    const res = await fetch(`${url}/rest/v1/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting user from Supabase:', err);
    return false;
  }
}

/**
 * Verifies user credentials & mandatory verification status in Supabase BEFORE allowing login.
 */
export async function verifyAndLoginUserInSupabase(
  email: string,
  password: string,
  role: string
): Promise<{ success: boolean; user?: any; isUnverified?: boolean; error?: string }> {
  const { url } = getSupabaseConfig();

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Koneksi database Supabase tidak terhubung!' };
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Query Supabase for the user by email
    const res = await fetch(`${url}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal melakukan kueri verifikasi ke database Supabase.' };
    }

    const users = await res.json();

    if (!users || users.length === 0) {
      return { 
        success: false, 
        error: 'Gagal Login! Akun ini BELUM TERDAFTAR di database Supabase. Anda harus mendaftarkan akun pengurus terlebih dahulu.' 
      };
    }

    const user = users[0];

    // Check mandatory verification status in Supabase
    if (!user.is_verified) {
      return { 
        success: false,
        isUnverified: true,
        error: 'Akun Anda BELUM DIVERIFIKASI! Masukkan 6 digit Kode Verifikasi (OTP) terlebih dahulu.' 
      };
    }

    if (!user.is_active) {
      return { 
        success: false, 
        error: 'Akun Anda dinonaktifkan di database Supabase. Hubungi Ketua Takmir/Admin.' 
      };
    }

    // Strict Password / PIN Match
    if (user.password_hash !== password) {
      return { success: false, error: 'Password / PIN yang Anda masukkan Salah!' };
    }

    // Update last_login timestamp in Supabase
    fetch(`${url}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ last_login: new Date().toISOString() })
    }).catch(console.error);

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Terjadi kesalahan koneksi saat verifikasi Supabase.' };
  }
}

/**
 * Auto-fetches all verified transactions directly from Supabase PostgreSQL database.
 */
export async function fetchTransactionsFromSupabase(): Promise<Transaction[] | null> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${url}/rest/v1/transactions?select=*&order=date.desc`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Map database snake_case columns back to camelCase Transaction interface
    return data.map((item: any) => ({
      id: item.id,
      receiptNo: item.receipt_no || item.receiptNo,
      date: item.date,
      time: item.time || '00:00',
      type: item.type,
      amount: Number(item.amount),
      fundAccount: item.fund_account || item.fundAccount || 'Kas Utama',
      category: item.category,
      description: item.description,
      donorName: item.donor_name || item.donorName || 'Hamba Allah',
      donorPhone: item.donor_phone || item.donorPhone || '',
      paymentMethod: item.payment_method || item.paymentMethod || 'cash',
      status: item.status || 'verified',
      checksum: item.checksum || 'sha256-legacy',
      attachmentUrl: item.attachment_url || item.attachmentUrl || '',
      createdBy: item.created_by || item.createdBy || 'System',
      createdAt: item.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Failed to fetch transactions from Supabase:', err);
    return null;
  }
}

/**
 * Auto-saves or updates a Transaction directly in Supabase PostgreSQL table `transactions`.
 */
export async function saveTransactionToSupabase(tx: Transaction): Promise<boolean> {
  const { url } = getSupabaseConfig();

  // 1. Send update to local Express backend API
  try {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
  } catch (err) {
    console.warn('Express API offline, proceeding with Supabase sync.');
  }

  // 2. Direct Supabase REST auto-save
  if (!isSupabaseConfigured()) return true;

  try {
    const payload = {
      id: tx.id,
      receipt_no: tx.receiptNo,
      date: tx.date,
      time: tx.time,
      type: tx.type,
      amount: tx.amount,
      fund_account: tx.fundAccount,
      category: tx.category,
      description: tx.description,
      donor_name: tx.donorName || 'Hamba Allah',
      donor_phone: tx.donorPhone || '',
      payment_method: tx.paymentMethod,
      status: tx.status,
      checksum: tx.checksum,
      attachment_url: tx.attachmentUrl || '',
      created_by: tx.createdBy
    };

    const res = await fetch(`${url}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.error('Error auto-saving transaction to Supabase:', err);
    return false;
  }
}

/**
 * Auto-deletes a Transaction from Supabase PostgreSQL table `transactions`.
 */
export async function deleteTransactionFromSupabase(id: string): Promise<boolean> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return true;

  try {
    const res = await fetch(`${url}/rest/v1/transactions?id=eq.${id}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting transaction from Supabase:', err);
    return false;
  }
}

/**
 * Auto-fetches Mosque Profile & QRIS Settings from Supabase table `mosque_profile`.
 */
export async function fetchMosqueProfileFromSupabase(): Promise<MosqueProfile | null> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${url}/rest/v1/mosque_profile?select=*&limit=1`, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const item = data[0];
    return {
      name: item.name,
      tagline: item.tagline,
      address: item.address,
      city: item.city,
      phone: item.phone,
      email: item.email,
      ketuaTakmir: item.ketua_takmir || item.ketuaTakmir,
      bendahara: item.bendahara,
      auditor: item.auditor,
      bankAccounts: item.bank_accounts || item.bankAccounts || [],
      qrisNmid: item.qris_nmid || item.qrisNmid,
      qrisMerchantName: item.qris_merchant_name || item.qrisMerchantName,
      qrisImageUrl: item.qris_image_url || item.qrisImageUrl,
      qrisCustomPayload: item.qris_custom_payload || item.qrisCustomPayload,
      waGatewayStatus: item.wa_gateway_status || item.waGatewayStatus || 'connected',
      waGatewayNumber: item.wa_gateway_number || item.waGatewayNumber || '',
      waApiKey: item.wa_api_key || item.waApiKey || ''
    };
  } catch (err) {
    console.warn('Failed to fetch mosque profile from Supabase:', err);
    return null;
  }
}

/**
 * Auto-saves or updates Mosque Profile & QRIS Settings in Supabase table `mosque_profile`.
 */
export async function saveMosqueProfileToSupabase(profile: MosqueProfile): Promise<boolean> {
  const { url } = getSupabaseConfig();

  // 1. Express API update
  try {
    await fetch('/api/mosque-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
  } catch (err) {
    console.warn('Express API update skipped.');
  }

  // 2. Direct Supabase auto-save
  if (!isSupabaseConfigured()) {
    localStorage.setItem('simasjid_mosque_profile', JSON.stringify(profile));
    return true;
  }

  try {
    const payload = {
      name: profile.name,
      tagline: profile.tagline,
      address: profile.address,
      city: profile.city,
      phone: profile.phone,
      email: profile.email,
      ketua_takmir: profile.ketuaTakmir,
      bendahara: profile.bendahara,
      auditor: profile.auditor,
      qris_nmid: profile.qrisNmid,
      qris_merchant_name: profile.qrisMerchantName || profile.name,
      qris_image_url: profile.qrisImageUrl || '',
      qris_custom_payload: profile.qrisCustomPayload || '',
      bank_accounts: profile.bankAccounts,
      wa_gateway_status: profile.waGatewayStatus,
      wa_gateway_number: profile.waGatewayNumber,
      wa_api_key: profile.waApiKey
    };

    const res = await fetch(`${url}/rest/v1/mosque_profile?id=eq.a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`, {
      method: 'PATCH',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to save Mosque Profile to Supabase:', err);
    localStorage.setItem('simasjid_mosque_profile', JSON.stringify(profile));
    return false;
  }
}

/**
 * Auto-saves Audit Log entries to Supabase table `audit_logs`.
 */
export async function saveAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  const { url } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return true;

  try {
    const res = await fetch(`${url}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        id: log.id,
        timestamp: log.timestamp,
        user_name: log.user,
        action: log.action,
        details: log.details,
        previous_hash: log.previousHash,
        current_hash: log.currentHash
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to auto-save audit log to Supabase:', err);
    return false;
  }
}
