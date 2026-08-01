/**
 * WEBAUTHN NATIVE ANDROID BIOMETRIC MODULE (FIDO2 / PASSKEYS)
 * Memungkinkan login menggunakan Sidik Jari (Fingerprint) atau Face ID bawaan Android & Browser.
 */

// Format buffer conversion helpers
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Memeriksa apakah perangkat Android/Browser mendukung Biometrik WebAuthn.
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    return false;
  }
}

/**
 * Mendaftarkan Sidik Jari / Wajah Biometrik Android bawaan HP (Passkey Creation).
 */
export async function registerAndroidBiometric(
  userEmail: string,
  userName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  if (!(await isWebAuthnSupported())) {
    return { success: false, error: 'Perangkat Android ini belum mendukung sensor Biometrik WebAuthn.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode(userEmail);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'SiMasjid Keuangan',
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256 (Android Hardware Default)
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Memaksa sensor Biometrik HP Android (Fingerprint/Face)
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'direct'
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    })) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: 'Pendaftaran biometrik Android dibatalkan.' };
    }

    const credIdBase64 = bufferToBase64(credential.rawId);
    
    // Simpan Credential ID ke localStorage untuk pemanggilan verifikasi cepat
    localStorage.setItem(`webauthn_cred_${userEmail.toLowerCase()}`, credIdBase64);

    return { success: true, credentialId: credIdBase64 };
  } catch (err: any) {
    console.error('WebAuthn Android registration error:', err);
    return { 
      success: false, 
      error: err.message || 'Sensors Biometrik Android tidak merespon atau dibatalkan.' 
    };
  }
}

/**
 * Memverifikasi Sidik Jari / Wajah Biometrik Android bawaan HP saat Login.
 */
export async function verifyAndroidBiometric(
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await isWebAuthnSupported())) {
    return { success: false, error: 'Perangkat Android Anda belum mendukung Biometrik WebAuthn.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const savedCredId = localStorage.getItem(`webauthn_cred_${userEmail.toLowerCase()}`);
    
    const allowCredentials: PublicKeyCredentialDescriptor[] = savedCredId ? [
      {
        id: base64ToBuffer(savedCredId),
        type: 'public-key',
        transports: ['internal']
      }
    ] : [];

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials,
      userVerification: 'required', // Meminta konfirmasi Sidik Jari / Face Unlock Android
      timeout: 60000
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    })) as PublicKeyCredential;

    if (!assertion) {
      return { success: false, error: 'Verifikasi Biometrik Android dibatalkan.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('WebAuthn Android verification error:', err);
    return { 
      success: false, 
      error: err.message || 'Verifikasi Biometrik Sidik Jari / Wajah Android Gagal atau Dibatalkan.' 
    };
  }
}
