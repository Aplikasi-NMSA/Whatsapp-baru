import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Bot,
  Store,
  Radio,
  Activity,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Settings,
  ChevronDown,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { WhatsAppConnectionStatus, ServerStats } from '../types';

interface HeaderProps {
  waStatus: WhatsAppConnectionStatus;
  stats: ServerStats | null;
  onOpenConnectModal: () => void;
  onOpenCronModal: () => void;
  onOpenAntiSpamModal: () => void;
  onOpenCrmModal: () => void;
  onOpenCatalogModal: () => void;
  onOpenBroadcastModal: () => void;
  onSwitchToQrLanding: () => void;
  onResetSession: () => void;
  onDisconnect: () => void;
  aiEnabled: boolean;
  onToggleAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  waStatus,
  stats,
  onOpenConnectModal,
  onOpenCronModal,
  onOpenAntiSpamModal,
  onOpenCrmModal,
  onOpenCatalogModal,
  onOpenBroadcastModal,
  onSwitchToQrLanding,
  onResetSession,
  onDisconnect,
  aiEnabled,
  onToggleAi,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isConnected = waStatus.state === 'connected';
  const isQrReady = waStatus.state === 'qr_ready';
  const isConnecting = waStatus.state === 'connecting';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#202c33] border-b border-slate-700/80 sticky top-0 z-40 select-none">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Brand (WhatsApp Web Minimalist Style) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center shadow text-white font-bold">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  WhatsPro <span className="text-[#00a884]">Web</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> PRO AI
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Controls & Dropdown Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Auto-Responder Master Toggle */}
            <button
              onClick={onToggleAi}
              title={aiEnabled ? "Bot AI Gemini Aktif" : "Bot AI Gemini Nonaktif"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                aiEnabled
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Bot AI:</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                aiEnabled ? 'bg-[#00a884] text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {aiEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* WhatsApp Connection State Pill */}
            <button
              onClick={onSwitchToQrLanding}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isConnected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : isQrReady
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
                  : isConnecting
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                  <span className="truncate max-w-[120px]">{waStatus.connectedNumber || 'Online'}</span>
                </>
              ) : isQrReady ? (
                <>
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scan QR</span>
                </>
              ) : isConnecting ? (
                <>
                  <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hubungkan WA</span>
                </>
              )}
            </button>

            {/* THE SINGLE SETTINGS DROPDOWN IN TOP-RIGHT CORNER */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  dropdownOpen
                    ? 'bg-[#00a884] text-white border-[#00a884]'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
                title="Pengaturan & Menu Fitur"
              >
                <Settings className={`w-4 h-4 ${dropdownOpen ? 'rotate-90 transition-transform' : ''}`} />
                <span className="hidden sm:inline">Pengaturan</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu Items */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111b21] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Menu & Pengaturan Sistem
                    </span>
                  </div>

                  {/* 1. Pengaturan Bot AI & Anti-Spam */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAntiSpamModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#202c33] hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                  >
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="block font-bold">Bot AI & Anti-Spam</span>
                      <span className="text-[10px] text-slate-400">Atur jeda acak & simulasi ngetik</span>
                    </div>
                  </button>

                  {/* 2. CRM Leads & Kontak */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCrmModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#202c33] hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="block font-bold">CRM Kontak & Pipeline</span>
                      <span className="text-[10px] text-slate-400">Kanban leads, prospek & closing</span>
                    </div>
                  </button>

                  {/* 3. Katalog Produk & Profil Bisnis */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCatalogModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#202c33] hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                  >
                    <Store className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="block font-bold">Katalog Produk & Usaha</span>
                      <span className="text-[10px] text-slate-400">Daftar produk, harga & profil</span>
                    </div>
                  </button>

                  {/* 4. Broadcast Pesan Massal */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenBroadcastModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#202c33] hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                  >
                    <Radio className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="block font-bold">Broadcast Pesan Massal</span>
                      <span className="text-[10px] text-slate-400">Kirim massal anti-banned</span>
                    </div>
                  </button>

                  {/* 5. Link Cron (UptimeRobot 24/7) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCronModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-[#202c33] hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="block font-bold">Link Cron (UptimeRobot)</span>
                      <span className="text-[10px] text-slate-400">Jaga WhatsApp aktif 24 jam nonstop</span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  {/* 6. Layar QR Code Web Asli */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onSwitchToQrLanding();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-[#202c33] hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Layar QR Web WhatsApp</span>
                  </button>

                  {/* 7. Reset Sesi WhatsApp */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (confirm('Reset sesi WhatsApp dan buat QR Code baru yang segar?')) {
                        onResetSession();
                      }
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-amber-300 hover:bg-[#202c33] hover:text-amber-200 flex items-center gap-2.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Reset Sesi (Hasilkan QR Baru)</span>
                  </button>

                  {/* 8. Putuskan & Ganti Nomor WhatsApp */}
                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (confirm('Putuskan koneksi WhatsApp ini dan ganti dengan nomor lain?')) {
                          onDisconnect();
                        }
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors border-t border-slate-800/80"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Putuskan & Ganti Nomor</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
