import React, { useState } from 'react';
import {
  X,
  Activity,
  Copy,
  Check,
  Zap,
  Clock,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';
import { api } from '../services/api';

interface CronKeepAliveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CronKeepAliveModal: React.FC<CronKeepAliveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  if (!isOpen) return null;

  const keepAliveUrl = `${window.location.origin}/api/cron/keepalive`;

  const handleCopy = () => {
    navigator.clipboard.writeText(keepAliveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    try {
      const data = await api.pingKeepAlive();
      setPingResult(data);
    } catch (err: any) {
      alert('Gagal melakukan tes ping: ' + err?.message);
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Zap className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Link Cron & UptimeRobot (24/7 Always Active)
              </h3>
              <p className="text-xs text-slate-400">
                Jaga koneksi WhatsApp dan AI Bot tetap hidup tanpa putus
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

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* URL Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              URL Endpoint Keep-Alive Anda (Salin ke UptimeRobot):
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="text"
                readOnly
                value={keepAliveUrl}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin URL'}
              </button>
            </div>
          </div>

          {/* Test Ping Button */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Cek apakah endpoint keep-alive merespons normal:</span>
            </div>
            <button
              onClick={handleTestPing}
              disabled={testingPing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {testingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Tes Ping Sekarang
            </button>
          </div>

          {/* Ping Result Live Box */}
          {pingResult && (
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs font-mono space-y-1">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>Status: {pingResult.status?.toUpperCase() || 'ONLINE'} (HTTP 200)</span>
                <span className="text-[11px] text-slate-400">Total Ping: {pingResult.totalPingsReceived}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                WhatsApp: {pingResult.whatsapp?.state} ({pingResult.whatsapp?.connectedNumber || 'Multi-Device Session Ready'})
              </div>
            </div>
          )}

          {/* 3 Step Tutorial */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white block">
              Cara Menghubungkan ke UptimeRobot (100% Gratis):
            </span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Buka situs <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold inline-flex items-center gap-0.5">UptimeRobot.com <ExternalLink className="w-3 h-3" /></a> dan buat akun gratis (atau login).
                </span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Klik tombol <strong>+ Add New Monitor</strong> &gt; Pilih Monitor Type: <strong>HTTP(s)</strong> &gt; Friendly Name: <strong>WhatsPro Bot AI</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Tempelkan (Paste) <strong>URL di atas</strong> pada kolom URL/IP &gt; Atur Monitoring Interval: <strong>5 minutes</strong> &gt; Klik <strong>Create Monitor</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Dengan UptimeRobot mengirim sinyal ping setiap 5 menit, server cloud tidak akan pernah mati/tidur (anti scale-to-zero) sehingga WhatsApp Anda selalu online dan chatbot AI siap menjawab pesan kapan pun.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
