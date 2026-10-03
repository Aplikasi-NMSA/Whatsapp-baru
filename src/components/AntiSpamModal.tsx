import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Save,
  Users,
  MessageSquare
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface AntiSpamModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onUpdateSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
}

export const AntiSpamModal: React.FC<AntiSpamModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled);
  const [persona, setPersona] = useState(settings.aiPersona);
  const [customName, setCustomName] = useState(settings.aiPersonaCustomName || 'Siti AI CS');
  const [systemPrompt, setSystemPrompt] = useState(settings.aiSystemPrompt);
  const [knowledgeBase, setKnowledgeBase] = useState(settings.aiKnowledgeBase);

  // Anti-Spam states
  const [antiSpamEnabled, setAntiSpamEnabled] = useState(settings.antiSpamEnabled !== false);
  const [minDelaySec, setMinDelaySec] = useState(settings.antiSpamMinDelaySec || 3);
  const [maxDelaySec, setMaxDelaySec] = useState(settings.antiSpamMaxDelaySec || 7);
  const [humanTyping, setHumanTyping] = useState(settings.antiSpamHumanTyping !== false);
  const [cooldownSec, setCooldownSec] = useState(settings.antiSpamCooldownSec || 5);
  const [replyGroups, setReplyGroups] = useState(Boolean(settings.antiSpamReplyGroups));
  const [maxPerMinute, setMaxPerMinute] = useState(settings.antiSpamMaxPerMinute || 15);
  const [ignoredNumbers, setIgnoredNumbers] = useState(settings.antiSpamIgnoredNumbers || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateSettings({
        aiEnabled,
        aiPersona: persona,
        aiPersonaCustomName: customName,
        aiSystemPrompt: systemPrompt,
        aiKnowledgeBase: knowledgeBase,
        antiSpamEnabled,
        antiSpamMinDelaySec: Number(minDelaySec) || 3,
        antiSpamMaxDelaySec: Number(maxDelaySec) || 7,
        antiSpamHumanTyping: humanTyping,
        antiSpamCooldownSec: Number(cooldownSec) || 5,
        antiSpamReplyGroups: replyGroups,
        antiSpamMaxPerMinute: Number(maxPerMinute) || 15,
        antiSpamIgnoredNumbers: ignoredNumbers.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202c33] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80 bg-[#111b21]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5 text-[#00a884]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pengaturan AI Bot & Proteksi Anti-Spam
              </h3>
              <p className="text-xs text-slate-400">
                Atur jeda waktu pengetikan, jadwal dan keamanan akun agar tidak terblokir WhatsApp
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: AI Master Switch */}
          <div className="p-4 rounded-xl bg-[#111b21] border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00a884]" />
                Status Bot AI Gemini (Auto-Responder)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Balas pesan masuk dari pelanggan secara otomatis menggunakan model Google Gemini 3.8 Flash
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                aiEnabled
                  ? 'bg-[#00a884] text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {aiEnabled ? 'AKTIF (ON)' : 'MATI (OFF)'}
            </button>
          </div>

          {/* Section 2: Anti-Spam & Delivery Safeguards */}
          <div className="p-5 rounded-xl bg-[#111b21] border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Proteksi Anti-Banned & Anti-Spam WhatsApp
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                PENTING
              </span>
            </div>

            {/* Jeda Pengiriman Acak (Randomized Delay) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Waktu Jeda Pengiriman Pesan Acak (Randomized Delay):
                </label>
                <span className="text-xs font-mono font-bold text-[#00a884]">
                  {minDelaySec}s – {maxDelaySec}s
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bot akan menunggu waktu acak antara {minDelaySec} sampai {maxDelaySec} detik sebelum mengirimkan pesan balasan. Pola jeda yang tidak teratur membuat pengiriman tidak terdeteksi sebagai robot otomatis oleh WhatsApp.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Jeda Minimum (detik):</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={minDelaySec}
                    onChange={(e) => setMinDelaySec(Number(e.target.value))}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Jeda Maksimum (detik):</span>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={maxDelaySec}
                    onChange={(e) => setMaxDelaySec(Number(e.target.value))}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>
            </div>

            {/* Simulasi Mengetik Manusiawi */}
            <div className="pt-2 border-t border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Simulasi Mengetik Manusiawi (Human-like Typing)
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                  Menampilkan status <em>"sedang mengetik..."</em> di WhatsApp penerima dengan durasi yang proporsional dengan panjang teks balasan.
                </span>
              </div>
              <input
                type="checkbox"
                checked={humanTyping}
                onChange={(e) => setHumanTyping(e.target.checked)}
                className="w-4 h-4 accent-[#00a884] rounded cursor-pointer mt-1"
              />
            </div>

            {/* Cooldown antar pesan dari kontak yang sama */}
            <div className="pt-2 border-t border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Cooldown Per-Kontak (Jeda Anti-Spam Pengirim):
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{cooldownSec} detik</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Jika pelanggan mengirim 3-5 pesan berurutan dengan cepat, bot tidak akan membalas setiap baris kalimat sekaligus, melainkan menunggu cooldown sebelum menjawab.
              </p>
              <input
                type="range"
                min="2"
                max="20"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(Number(e.target.value))}
                className="w-full accent-[#00a884]"
              />
            </div>

            {/* Balas Pesan Grup */}
            <div className="pt-2 border-t border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Balas Pesan di Grup WhatsApp
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                  Nonaktifkan jika nomor WhatsApp Anda bergabung di banyak grup agar bot tidak merespons obrolan grup secara liar.
                </span>
              </div>
              <input
                type="checkbox"
                checked={replyGroups}
                onChange={(e) => setReplyGroups(e.target.checked)}
                className="w-4 h-4 accent-[#00a884] rounded cursor-pointer mt-1"
              />
            </div>

            {/* Batas Maksimum Balasan per Menit */}
            <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Batas Maksimal Pesan / Menit:
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Mencegah lonjakan trafik tinggi
                </span>
              </div>
              <input
                type="number"
                min="5"
                max="60"
                value={maxPerMinute}
                onChange={(e) => setMaxPerMinute(Number(e.target.value))}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
              />
            </div>

            {/* Nomor yang Diabaikan (Blacklist) */}
            <div className="pt-2 border-t border-slate-700/60 space-y-1">
              <span className="text-xs font-semibold text-white block">
                Daftar Nomor yang Diabaikan (Blacklist):
              </span>
              <p className="text-[11px] text-slate-400">
                Pisahkan dengan koma jika ada nomor keluarga, atasan, atau kontak pribadi yang tidak ingin dibalas oleh bot AI.
              </p>
              <input
                type="text"
                placeholder="Contoh: 081299998888, 6285711112222"
                value={ignoredNumbers}
                onChange={(e) => setIgnoredNumbers(e.target.value)}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00a884]"
              />
            </div>

          </div>

          {/* Section 3: Persona & System Instructions */}
          <div className="p-5 rounded-xl bg-[#111b21] border border-slate-700 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00a884]" />
              Persona & Gaya Bicara AI
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nama Panggilan Bot:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Pilihan Persona:
                </label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as any)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
                >
                  <option value="cs_friendly">CS Ramah & Solutif</option>
                  <option value="sales_closer">Sales Closing Specialist</option>
                  <option value="tech_support">Technical Support</option>
                  <option value="business_consultant">Konsultan Bisnis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Instruksi Sistem Tambahan:
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Instruksi khusus dari pemilik bisnis..."
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00a884] font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Section 4: Save Actions */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-[#00a884] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Pengaturan Anti-Spam berhasil disimpan!
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#00a884] hover:bg-[#009172] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
