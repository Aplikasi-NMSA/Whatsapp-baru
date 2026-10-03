import React, { useState } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { WhatsAppConnectionStatus } from '../types';
import { api } from '../services/api';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  waStatus: WhatsAppConnectionStatus;
  onRefresh: () => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  isOpen,
  onClose,
  waStatus,
  onRefresh,
}) => {
  const [activeMode, setActiveMode] = useState<'qr' | 'pairing'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadingPairing, setLoadingPairing] = useState(false);
  const [pairingCodeResult, setPairingCodeResult] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  if (!isOpen) return null;

  const isConnected = waStatus.state === 'connected';

  const handleRequestPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoadingPairing(true);
    try {
      const res = await api.requestPairingCode(phoneNumber);
      if (res.pairingCode) {
        setPairingCodeResult(res.pairingCode);
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal meminta pairing code');
    } finally {
      setLoadingPairing(false);
    }
  };

  const handleCopyCode = () => {
    if (pairingCodeResult) {
      navigator.clipboard.writeText(pairingCodeResult);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin memutuskan sambungan WhatsApp? Sesi di server akan dihapus dan Anda harus scan ulang untuk menyambungkannya kembali.')) {
      setDisconnecting(true);
      try {
        await api.logoutWhatsApp();
        onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setDisconnecting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tautkan WhatsApp Pribadi
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  MULTI-DEVICE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gunakan nomor pribadi Anda menjadi WhatsApp Business Premium
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isConnected ? (
            /* Connected State Screen */
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">WhatsApp Berhasil Terhubung!</h4>
                    <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Nomor WhatsApp Anda sekarang aktif dengan AI Chatbot Gemini & CRM terintegrasi.
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nomor WhatsApp:</span>
                      <span className="font-semibold text-white">{waStatus.connectedNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nama Perangkat:</span>
                      <span className="font-semibold text-white">{waStatus.connectedName || 'WhatsApp Multi-Device'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Protokol:</span>
                      <span className="font-semibold text-emerald-400">Multi-Device Web (Baileys)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Status Sesi:</span>
                      <span className="font-semibold text-emerald-400">Tersimpan Permanen (1x Scan)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persistent Session Guarantee info */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">Sesi Tersimpan Otomatis (Hanya 1x Scan):</span>
                  Anda tidak perlu scan ulang setiap kali membuka web browser atau restart server. WhatsApp akan tetap tersambung secara background 24/7. Pastikan Anda mengaktifkan link cron UptimeRobot agar server tetap online.
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Buka Dashboard Chat
                </button>
                <button
                  onClick={handleLogout}
                  disabled={disconnecting}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {disconnecting ? 'Memutuskan...' : 'Putuskan Sambungan'}
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected / Pairing Screen */
            <div className="space-y-5">
              
              {/* Mode Switch Tabs */}
              <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveMode('qr')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeMode === 'qr'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Scan QR Code (Kamera HP)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('pairing')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeMode === 'pairing'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Kode Tautkan (Nomor HP)
                </button>
              </div>

              {activeMode === 'qr' ? (
                /* QR Code Method */
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* QR Box */}
                  <div className="relative group shrink-0">
                    <div className="w-64 h-64 bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center border-4 border-slate-700 overflow-hidden">
                      {waStatus.qrCodeUrl ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={waStatus.qrCodeUrl}
                            alt="WhatsApp Web QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-4 text-slate-800 flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                          <p className="text-xs font-semibold text-slate-600">
                            Menghasilkan QR Code WhatsApp...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={onRefresh}
                      className="mt-2 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh QR Code
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                      💡 <strong>Scan Cukup 1x Saja!</strong> Sesi WhatsApp akan tersimpan otomatis di sistem server WhatsPro.
                    </div>

                    <ol className="space-y-2 list-decimal list-inside text-slate-300">
                      <li className="leading-relaxed">
                        Buka aplikasi <strong>WhatsApp</strong> di HP Anda.
                      </li>
                      <li className="leading-relaxed">
                        Ketuk <strong>Menu (titik 3)</strong> di Android atau <strong>Pengaturan</strong> di iPhone.
                      </li>
                      <li className="leading-relaxed">
                        Pilih <strong>Perangkat Tertaut</strong> lalu ketuk <strong>Tautkan Perangkat</strong>.
                      </li>
                      <li className="leading-relaxed">
                        Arahkan kamera HP Anda ke QR Code di samping.
                      </li>
                    </ol>

                    <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Koneksi aman end-to-end terenkripsi resmi Multi-Device WhatsApp.</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Pairing Code Method */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <p className="text-xs text-slate-300 mb-3">
                      Tautkan WhatsApp Anda tanpa kamera menggunakan 8 digit Kode Penautan resmi:
                    </p>

                    <form onSubmit={handleRequestPairing} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: 628123456789 atau 08123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={loadingPairing || !phoneNumber.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {loadingPairing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        Dapatkan Kode
                      </button>
                    </form>
                  </div>

                  {pairingCodeResult && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                      <span className="text-xs text-emerald-300 font-semibold block">
                        Kode Penautan WhatsApp Anda:
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-2xl font-mono font-extrabold tracking-widest text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/40">
                          {pairingCodeResult}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Buka WhatsApp di HP &gt; Perangkat Tertaut &gt; Tautkan Perangkat &gt; <em>Tautkan dengan nomor telepon saja</em> &gt; Masukkan kode di atas.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Metode ini berguna jika kamera HP Anda sedang bermasalah atau Anda ingin menghubungkan WhatsApp dari jarak jauh.
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>WhatsPro Multi-Device Server Siaga</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
