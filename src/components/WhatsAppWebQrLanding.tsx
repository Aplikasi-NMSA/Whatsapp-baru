import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Zap,
  Bot,
  Activity,
  Layers,
  HelpCircle,
  QrCode,
  RotateCcw
} from 'lucide-react';
import { WhatsAppConnectionStatus, ServerStats } from '../types';
import { api } from '../services/api';

interface WhatsAppWebQrLandingProps {
  waStatus: WhatsAppConnectionStatus;
  stats: ServerStats | null;
  onRefreshQr: () => void;
  onResetSession: () => void;
  onEnterDashboard: () => void;
}

export const WhatsAppWebQrLanding: React.FC<WhatsAppWebQrLandingProps> = ({
  waStatus,
  stats,
  onRefreshQr,
  onResetSession,
  onEnterDashboard,
}) => {
  const [method, setMethod] = useState<'qr' | 'pairing'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadingPairing, setLoadingPairing] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const isConnected = waStatus.state === 'connected';

  // Auto-refresh countdown for QR code
  useEffect(() => {
    if (isConnected) return;
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          onRefreshQr();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected, onRefreshQr]);

  // When WhatsApp connects, give a brief moment to celebrate then allow auto-transition
  useEffect(() => {
    if (isConnected) {
      const timeout = setTimeout(() => {
        onEnterDashboard();
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [isConnected, onEnterDashboard]);

  const handleRequestPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoadingPairing(true);
    try {
      const res = await api.requestPairingCode(phoneNumber);
      if (res.pairingCode) {
        setPairingCode(res.pairingCode);
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal meminta kode penautan.');
    } finally {
      setLoadingPairing(false);
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#111b21] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* WhatsApp Green Top Banner Header (Official WA Web Accent) */}
      <div className="h-56 bg-[#00a884] absolute top-0 inset-x-0 z-0">
        <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-[#00a884] fill-[#00a884]" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wider uppercase">
                WHATSAPP WEB
              </span>
              <span className="ml-2 text-[10px] bg-emerald-950/40 text-emerald-100 font-extrabold px-2 py-0.5 rounded-full border border-white/20">
                PRO AI CRM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/90">
            <button
              onClick={onEnterDashboard}
              className="px-3.5 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span>Buka Dasbor CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Centered Authentication Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-20 pb-12 flex-1 flex flex-col justify-center">
        
        {/* Main Card */}
        <div className="bg-[#202c33] rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden">
          
          {isConnected ? (
            /* Connection Success Celebration Screen */
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">
                  WhatsApp Berhasil Ditautkan!
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Nomor <strong className="text-emerald-400 font-mono">{waStatus.connectedNumber || 'Pribadi Anda'}</strong> telah tersambung secara otomatis dengan AI Chatbot Gemini & Dasbor CRM.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#111b21] border border-slate-700/80 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Sesi:</span>
                  <span className="text-emerald-400 font-bold">Tersimpan Permanen (1x Scan Saja)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Auto-Responder:</span>
                  <span className="text-emerald-400 font-bold">Aktif (Google Gemini 3.8 Flash)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protokol:</span>
                  <span className="text-slate-200">Multi-Device Web (Baileys)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onEnterDashboard}
                  className="px-6 py-3 bg-[#00a884] hover:bg-[#009172] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <span>Masuk ke Dasbor CRM & AI Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Official WhatsApp Web QR Code Linking Screen */
            <div className="p-6 sm:p-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Numbered Instructions (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                      Gunakan WhatsApp di komputer Anda
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Tautkan nomor WhatsApp pribadi Anda ke WhatsPro AI Bot & CRM
                    </p>
                  </div>

                  {method === 'qr' ? (
                    <ol className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#111b21] text-[#00a884] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          1
                        </span>
                        <span>
                          Buka aplikasi <strong>WhatsApp</strong> di telepon Anda
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#111b21] text-[#00a884] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          2
                        </span>
                        <span>
                          Ketuk <strong>Menu</strong> (ikon titik tiga di Android) atau <strong>Pengaturan</strong> (ikon roda gigi di iPhone)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#111b21] text-[#00a884] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          3
                        </span>
                        <span>
                          Ketuk <strong>Perangkat tertaut</strong> lalu <strong>Tautkan perangkat</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#111b21] text-[#00a884] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          4
                        </span>
                        <span>
                          Arahkan telepon Anda ke layar ini untuk memindai kode QR di sebelah kanan
                        </span>
                      </li>
                    </ol>
                  ) : (
                    /* Pairing Code Form */
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#111b21] border border-slate-700/80 space-y-3">
                        <span className="text-xs text-slate-300 block">
                          Masukkan nomor telepon WhatsApp Anda dengan kode negara (contoh: <strong>628123456789</strong> atau <strong>08123456789</strong>):
                        </span>
                        <form onSubmit={handleRequestPairing} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: 628123456789"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="flex-1 bg-[#202c33] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00a884]"
                          />
                          <button
                            type="submit"
                            disabled={loadingPairing || !phoneNumber.trim()}
                            className="px-4 py-2 bg-[#00a884] hover:bg-[#009172] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            {loadingPairing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            Lanjut
                          </button>
                        </form>
                      </div>

                      {pairingCode && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                          <span className="text-xs text-emerald-300 font-semibold block">
                            Kode Penautan WhatsApp Anda:
                          </span>
                          <div className="flex items-center justify-center gap-3">
                            <div className="text-2xl font-mono font-extrabold tracking-widest text-emerald-400 bg-black/60 px-4 py-2 rounded-xl border border-emerald-500/40">
                              {pairingCode}
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyCode}
                              className="p-2.5 bg-[#00a884] hover:bg-[#009172] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            Buka WhatsApp di telepon &gt; Perangkat Tertaut &gt; Tautkan Perangkat &gt; <em>Tautkan dengan nomor telepon saja</em> &gt; Masukkan kode di atas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle Between QR and Phone Number */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                    {method === 'qr' ? (
                      <button
                        type="button"
                        onClick={() => setMethod('pairing')}
                        className="text-[#00a884] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Smartphone className="w-4 h-4" />
                        Tautkan dengan nomor telepon saja
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMethod('qr')}
                        className="text-[#00a884] hover:underline font-semibold flex items-center gap-1"
                      >
                        <QrCode className="w-4 h-4" />
                        Tautkan dengan pindai kode QR
                      </button>
                    )}

                    <div className="flex items-center gap-2 text-slate-400">
                      <input
                        type="checkbox"
                        id="keepSigned"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
                      />
                      <label htmlFor="keepSigned" className="cursor-pointer text-[12px]">
                        Tetap masuk (Scan cukup 1x)
                      </label>
                    </div>
                  </div>

                  {/* Guarantee banner */}
                  <div className="p-3 rounded-xl bg-[#111b21] border border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                    <span>
                      <strong>Sesi Disimpan Permanen:</strong> Setelah dipindai 1x, WhatsApp akan tetap tersambung tanpa perlu scan ulang setiap kali Anda membuka web.
                    </span>
                  </div>

                </div>

                {/* Right Column: Authentic WhatsApp Web QR Code Box (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  
                  <div className="relative group">
                    {/* Outer Viewfinder Frame styling like official WA Web */}
                    <div className="w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-2xl p-4 shadow-2xl flex items-center justify-center border-4 border-slate-700 relative overflow-hidden">
                      {waStatus.qrCodeUrl ? (
                        <div className="w-full h-full flex items-center justify-center p-1 bg-white">
                          <img
                            src={waStatus.qrCodeUrl}
                            alt="WhatsApp Web QR Code"
                            className="w-full h-full object-contain select-none"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-4 text-slate-800 flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="w-10 h-10 text-[#00a884] animate-spin" />
                          <p className="text-xs font-semibold text-slate-600">
                            Menghasilkan Kode QR WhatsApp Asli...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* QR Code footer & refresh */}
                    <div className="mt-3 flex items-center justify-between w-full px-1 text-xs text-slate-400">
                      <span className="text-[11px]">
                        Refresh: <strong className="text-emerald-400 font-mono">{refreshCountdown}s</strong>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={onRefreshQr}
                          className="text-[#00a884] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Muat Ulang
                        </button>
                        <button
                          onClick={onResetSession}
                          className="text-amber-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                          title="Hapus sesi lama dan buat QR code baru"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset Sesi
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Bottom Feature Badges & Direct Dashboard Access */}
          <div className="bg-[#111b21] px-6 py-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>AI Chatbot Gemini 3.8 Flash</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>CRM Leads & Pipeline</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>UptimeRobot 24/7 Keep-Alive</span>
              </span>
            </div>

            <button
              onClick={onEnterDashboard}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0"
            >
              <span>Langsung Lihat Dasbor CRM & AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Video Tutorial / Help Accordion Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Butuh bantuan penautan? Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat.
          </span>
        </div>

      </div>

    </div>
  );
};
