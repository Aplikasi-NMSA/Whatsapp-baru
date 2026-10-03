import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  Send,
  User,
  Clock,
  RefreshCw
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { api } from '../services/api';

interface AiChatbotViewProps {
  settings: BusinessSettings;
  onUpdateSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
}

export const AiChatbotView: React.FC<AiChatbotViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled);
  const [persona, setPersona] = useState(settings.aiPersona);
  const [customName, setCustomName] = useState(settings.aiPersonaCustomName || 'Siti AI CS');
  const [systemPrompt, setSystemPrompt] = useState(settings.aiSystemPrompt);
  const [knowledgeBase, setKnowledgeBase] = useState(settings.aiKnowledgeBase);
  const [delaySec, setDelaySec] = useState(settings.aiResponseDelaySec || 2);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulator / Sandbox state
  const [testInput, setTestInput] = useState('Halo kak, apakah ada diskon untuk paket Pro CRM? Rekening pembayarannya ke mana ya?');
  const [testSender, setTestSender] = useState('Calon Pelanggan');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await onUpdateSettings({
        aiEnabled,
        aiPersona: persona,
        aiPersonaCustomName: customName,
        aiSystemPrompt: systemPrompt,
        aiKnowledgeBase: knowledgeBase,
        aiResponseDelaySec: Number(delaySec) || 2,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (!testInput.trim() || testing) return;
    setTesting(true);
    setTestResult(null);

    const start = Date.now();
    try {
      const res = await api.testAiChat(testInput, testSender);
      setTestResult(res.response);
      setTestLatency(Date.now() - start);
    } catch (err: any) {
      setTestResult('Gagal memproses AI: ' + (err?.message || 'Error server'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-400" />
              AI Chatbot Otomatis (Gemini 3.8 Flash)
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              SERVER-SIDE AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Respon pesan WhatsApp calon pembeli secara instan, ramah, dan solutif berdasarkan profil dan katalog usaha Anda.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <span className="text-xs font-bold text-slate-300">Status AI:</span>
          <button
            type="button"
            onClick={() => {
              const next = !aiEnabled;
              setAiEnabled(next);
              onUpdateSettings({ aiEnabled: next });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              aiEnabled
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiEnabled ? 'animate-pulse' : ''}`} />
            {aiEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: SETTINGS & INSTRUCTIONS (7 Cols)                */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Persona Selector Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Persona & Gaya Komunikasi AI
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'cs_friendly',
                    title: 'CS Ramah & Solutif',
                    desc: 'Hangat, sopan, membantu, dan menggunakan emotikon natural.',
                  },
                  {
                    id: 'sales_closer',
                    title: 'Sales Closing Specialist',
                    desc: 'Persuasif, percaya diri, fokus mendorong order dan pembayaran.',
                  },
                  {
                    id: 'tech_support',
                    title: 'Technical Support',
                    desc: 'Menjawab panduan teknis, langkah demi langkah, dan troubleshooting.',
                  },
                  {
                    id: 'business_consultant',
                    title: 'Konsultan Bisnis',
                    desc: 'Formal, berwibawa, analitis, dan berorientasi solusi enterprise.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setPersona(item.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      persona === item.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{item.title}</span>
                      {persona === item.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bot Name & Typing Delay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Panggilan AI (Display Name):
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Siti AI CS, Sarah, Budi Bot"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Jeda Mengetik (Typing Delay):</span>
                    <span className="text-emerald-400 font-mono font-bold">{delaySec} detik</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={delaySec}
                    onChange={(e) => setDelaySec(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Simulasi jeda mengetik manusia sebelum pesan terkirim.
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Business Rules / System Prompt */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  Instruksi Sistem Khusus (System Prompt)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Atur aturan khusus, batasan jawaban, cara menyapa, dan instruksi penawaran:
              </p>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Business Knowledge Base & FAQs */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Basis Pengetahuan Bisnis & FAQ (Knowledge Base)
              </h3>
              <p className="text-[11px] text-slate-400">
                Masukkan detail harga, rekening bank, garansi, jam buka, dan pertanyaan sering ditanyakan. Informasi ini akan diserap oleh Gemini untuk menjawab pertanyaan pelanggan secara akurat.
              </p>
              <textarea
                rows={7}
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Pengaturan AI berhasil disimpan!
                </span>
              ) : <span />}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Konfigurasi AI'}
              </button>
            </div>

          </form>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: INTERACTIVE AI SANDBOX / SIMULATOR (5 Cols)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 sticky top-20 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Simulator AI Sandbox
                  </h3>
                  <span className="text-[10px] text-slate-400">Uji jawaban AI sebelum live di WhatsApp</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                gemini-3.8-flash
              </span>
            </div>

            {/* Test Input Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nama Pengirim Simulasi:
                </label>
                <input
                  type="text"
                  value={testSender}
                  onChange={(e) => setTestSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Pesan Masuk Percobaan:
                </label>
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Ketik pertanyaan yang mungkin diajukan pelanggan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing || !testInput.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Berpikir & Memproses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Uji Respons AI Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Question Chips */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                Contoh Pertanyaan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Berapa harga paket CRM?',
                  'Apakah bisa transfer via BCA?',
                  'Apakah bisa link dengan UptimeRobot?',
                  'Di mana alamat kantornya?',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setTestInput(chip)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Preview Box */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  Pratinjau Balasan WhatsApp ({customName}):
                </span>
                {testLatency && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {testLatency}ms
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[140px] flex flex-col justify-between">
                {testResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded w-fit border border-emerald-500/20">
                      <Sparkles className="w-3 h-3" />
                      <span>Gemini 3.8 Flash Output</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                      {testResult}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs py-6">
                    <Bot className="w-8 h-8 text-slate-700 mb-2" />
                    <span>Klik "Uji Respons AI Sekarang" untuk melihat hasil jawaban.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
