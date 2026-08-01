import { MosqueProfile, Transaction, WANotification, AuditLog } from '../types';

// Read optional env vars for Supabase connection
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/**
 * Saves or updates Mosque Profile & QRIS Settings to Supabase or backend API.
 */
export async function saveMosqueProfileToSupabase(profile: MosqueProfile): Promise<boolean> {
  try {
    // 1. Always attempt backend Express API update
    const response = await fetch('/api/mosque-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      console.warn('Backend API update failed, falling back to local state sync.');
    }

    // 2. Direct Supabase REST persistence if env configured
    if (isSupabaseConfigured()) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mosque_profile?id=eq.a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
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
        })
      });
      return res.ok;
    }

    // Local storage fallback for standalone offline capability
    localStorage.setItem('simasjid_mosque_profile', JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error('Failed to save Mosque Profile to Supabase/API:', err);
    localStorage.setItem('simasjid_mosque_profile', JSON.stringify(profile));
    return false;
  }
}

/**
 * Saves a Transaction to Supabase or API.
 */
export async function saveTransactionToSupabase(tx: Transaction): Promise<boolean> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });

    if (isSupabaseConfigured()) {
      await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: tx.id,
          receipt_no: tx.receiptNo,
          date: tx.date,
          time: tx.time,
          type: tx.type,
          amount: tx.amount,
          fund_account: tx.fundAccount,
          category: tx.category,
          description: tx.description,
          donor_name: tx.donorName,
          donor_phone: tx.donorPhone,
          payment_method: tx.paymentMethod,
          status: tx.status,
          checksum: tx.checksum,
          attachment_url: tx.attachmentUrl,
          created_by: tx.createdBy
        })
      });
    }

    return res.ok;
  } catch (err) {
    console.error('Error saving transaction to Supabase:', err);
    return false;
  }
}
