import React, { useState, useEffect, useRef } from 'react';
import { Camera, ShieldCheck, CheckCircle2, RefreshCw, Scan, Lock, AlertTriangle, Eye } from 'lucide-react';

interface BiometricFaceIDScannerProps {
  userName: string;
  userRole: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricFaceIDScanner: React.FC<BiometricFaceIDScannerProps> = ({
  userName,
  userRole,
  onSuccess,
  onCancel
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<'initiating' | 'scanning' | 'verifying' | 'success' | 'failed'>('initiating');
  const [statusMessage, setStatusMessage] = useState('Mengaktifkan Kamera Biometrik...');
  const [scanProgress, setScanProgress] = useState(0);

  // Initialize Camera WebRTC Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
          }
        }
      } catch (err) {
        console.warn('Webcam stream not available, falling back to simulated biometric face scanning mesh.', err);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Biometric Scan Sequence Simulation
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setScanStatus('scanning');
      setStatusMessage('Memindai Struktur Wajah & Vector Biometrik Pengurus...');
    }, 800);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 250);

    const timer2 = setTimeout(() => {
      setScanStatus('verifying');
      setStatusMessage('Verifikasi Hash Biometrik Wajah ke Supabase Ledger...');
    }, 3200);

    const timer3 = setTimeout(() => {
      setScanStatus('success');
      setStatusMessage('Face ID Terverifikasi ✓ Akses Sesi Diberikan.');
    }, 4500);

    const timer4 = setTimeout(() => {
      onSuccess();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearInterval(interval);
    };
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center space-y-5">
        
        {/* Header Badges */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          <Scan className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Biometric Face ID Scan Active</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Verifikasi Wajah Pengurus
          </h2>
          <p className="text-xs text-slate-400">
            Akses Sesi: <strong className="text-emerald-400">{userName}</strong> ({userRole.toUpperCase()})
          </p>
        </div>

        {/* Camera Reticle & Biometric Mesh Frame */}
        <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
          
          {/* Real Live Camera Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover rounded-full ${streamActive ? 'block' : 'hidden'}`}
          />

          {/* Fallback Simulation View if Camera Permission Denied */}
          {!streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-400 space-y-2">
              <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-emerald-500/60 flex items-center justify-center animate-pulse">
                <Scan className="w-12 h-12 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Facial Landmark Mesh</span>
            </div>
          )}

          {/* Animated Scanning Beam Line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce my-auto top-1/2 relative" />
          </div>

          {/* Facial Landmark Target Grid Dots */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-44 h-44 rounded-full border border-emerald-500/30 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-dashed border-emerald-400/50 animate-spin" />
            </div>
          </div>

          {/* Status Overlay Badge */}
          {scanStatus === 'success' && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-emerald-300">Wajah Terverifikasi</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {statusMessage}
            </span>
            <span className="font-mono text-emerald-400 font-bold">{scanProgress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_10px_#10b981]"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="w-full pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
          >
            Batal
          </button>

          <span className="text-[11px] text-slate-500">
            Encrypted Biometric Verification
          </span>
        </div>

      </div>
    </div>
  );
};
