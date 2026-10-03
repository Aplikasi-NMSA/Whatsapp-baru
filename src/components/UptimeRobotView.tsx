import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Server,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServerStats, PingLog, WhatsAppConnectionStatus } from '../types';
import { api } from '../services/api';

interface UptimeRobotViewProps {
  stats: ServerStats | null;
  waStatus: WhatsAppConnectionStatus;
}

export const UptimeRobotView: React.FC<UptimeRobotViewProps> = ({
  stats,
  waStatus,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [logs, setLogs] = useState<PingLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const cronUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/cron/keepalive` : '/api/cron/keepalive';
  const curlCommand = `curl -s "${cronUrl}"`;

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getCronLogs();
      setLogs(res.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cronUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const res = await api.pingKeepAlive();
      setTestResult(res);
      setTestLatency(Date.now() - start);
      fetchLogs();
    } catch (err: any) {
      setTestResult({ error: err?.message || 'Gagal tes ping' });
    } finally {
      setTestingPing(false);
    }
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}h ${h}j ${m}m`;
    if (h > 0) return `${h} jam ${m} mnt`;
    return `${m} mnt ${s} dtk`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-400" />
              Integrasi UptimeRobot & Link Cron (24/7 Always Active)
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              ANTI SCALE-TO-ZERO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pertahankan server dan koneksi WhatsApp Anda tetap online 24 jam sehari tanpa terputus menggunakan heartbeat ping otomatis.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">
            Daemon Siaga: {stats ? formatUptime(stats.uptimeSec) : 'Aktif'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Ping Diterima</span>
            <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
              {stats?.totalPings || logs.length} kali
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Status Socket WhatsApp</span>
            <span className="text-sm font-extrabold text-emerald-400 mt-1 block uppercase">
              {waStatus.state === 'connected' ? 'Terhubung (Alive)' : 'Siap Menghubungkan'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Sesi Multi-Device</span>
            <span className="text-sm font-extrabold text-teal-400 mt-1 block">
              1x Scan (Tersimpan)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Interval UptimeRobot Ideal</span>
            <span className="text-base font-extrabold text-white mt-1 block font-mono">
              5 Menit
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Keep-Alive Setup Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              Link Cron Keep-Alive Khusus UptimeRobot
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Salin tautan URL ini ke monitor UptimeRobot Anda untuk menjaga sistem WhatsApp tetap aktif terus menerus.
            </p>
          </div>

          <button
            onClick={handleTestPing}
            disabled={testingPing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0"
          >
            {testingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Tes Sinyal Ping Sekarang
          </button>
        </div>

        {/* Copy URL Input Box */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
            URL Monitor HTTP(s) (Copy & Paste ke UptimeRobot):
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-700 rounded-xl">
            <input
              type="text"
              readOnly
              value={cronUrl}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-amber-300 font-mono font-bold focus:outline-none select-all"
            />
            <button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                copiedUrl
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedUrl ? 'Tersalin!' : 'Salin URL'}
            </button>
          </div>
        </div>

        {/* Test Ping Live Output Box */}
        {testResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs font-mono space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Respon HTTP 200 OK — Endpoint Keep-Alive Berfungsi Sempurna!
              </span>
              {testLatency && <span>Latensi: {testLatency}ms</span>}
            </div>
            <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded-lg">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* cURL alternative */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              Alternatif via Terminal / Linux Cron:
            </span>
            <button
              onClick={handleCopyCurl}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              {copiedCurl ? 'Tersalin' : 'Salin cURL'}
            </button>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono select-all">
            {curlCommand}
          </div>
        </div>

      </div>

      {/* Tutorial Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-emerald-400" />
          Panduan Langkah Demi Langkah Menghubungkan ke UptimeRobot
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white">Daftar Akun Gratis</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Kunjungi <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">UptimeRobot.com</a> dan buat akun gratis (50 monitor gratis selamanya).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white">+ Add New Monitor</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Klik tombol <strong>+ Add New Monitor</strong> di dashboard UptimeRobot Anda, lalu pilih <strong>Monitor Type: HTTP(s)</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Tempelkan Link Cron</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Isi Friendly Name: <strong>WhatsPro Bot AI</strong> dan tempelkan URL Keep-Alive di atas pada kolom URL.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              4
            </span>
            <h4 className="font-bold text-white">Atur Interval 5 Menit</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Atur <strong>Monitoring Interval: 5 minutes</strong>, lalu klik <strong>Create Monitor</strong>. Selesai! Server kini siaga 24 jam nonstop.
            </p>
          </div>
        </div>
      </div>

      {/* Live Ping Logs Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Log Riwayat Ping Heartbeat (UptimeRobot & Cron)
            </h3>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loadingLogs ? 'animate-spin' : ''}`} />
            Perbarui
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Waktu Ping (Timestamp)</th>
                <th className="p-3">IP Sumber</th>
                <th className="p-3">User-Agent Pemanggil</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Latensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 font-sans text-xs">
                    Belum ada riwayat ping terekam. Klik tombol "Tes Sinyal Ping Sekarang" di atas untuk mencoba.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-300 font-sans">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-slate-400">{log.ip}</td>
                    <td className="p-3 text-slate-300 font-sans truncate max-w-xs">{log.userAgent}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-emerald-400">{log.responseTimeMs}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
