import React, { useState } from 'react';
import {
  Radio,
  Send,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Contact, BroadcastCampaign } from '../types';

interface BroadcastViewProps {
  contacts: Contact[];
  broadcasts: BroadcastCampaign[];
  onCreateBroadcast: (data: {
    title: string;
    messageTemplate: string;
    targetTag?: string;
    targetStage?: string;
  }) => Promise<void>;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  contacts,
  broadcasts,
  onCreateBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [targetTag, setTargetTag] = useState('all');
  const [targetStage, setTargetStage] = useState('all');
  const [messageTemplate, setMessageTemplate] = useState(
    'Halo kak {nama}! 😊\n\nKami ada penawaran spesial minggu ini dari {bisnis}. Dapatkan konsultasi gratis & diskon khusus untuk Anda hari ini. Tertarik info detailnya kak?'
  );
  const [isSending, setIsSending] = useState(false);

  // Compute targeted recipients count
  const targetedRecipients = contacts.filter((c) => {
    const matchTag = targetTag === 'all' || c.tags.includes(targetTag);
    const matchStage = targetStage === 'all' || c.pipelineStage === targetStage;
    return matchTag && matchStage;
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageTemplate.trim()) return;
    if (targetedRecipients.length === 0) {
      alert('Tidak ada kontak yang cocok dengan target filter yang dipilih.');
      return;
    }

    if (
      !confirm(
        `Kirim broadcast ke ${targetedRecipients.length} kontak terpilih? Pesan akan dikirim dengan jeda otomatis untuk menjaga keamanan akun WhatsApp Anda.`
      )
    ) {
      return;
    }

    setIsSending(true);
    try {
      await onCreateBroadcast({
        title: title.trim(),
        messageTemplate: messageTemplate.trim(),
        targetTag: targetTag === 'all' ? undefined : targetTag,
        targetStage: targetStage === 'all' ? undefined : targetStage,
      });
      setTitle('');
    } catch (err: any) {
      alert('Gagal mengirim broadcast: ' + err?.message);
    } finally {
      setIsSending(false);
    }
  };

  const insertVariable = (varName: string) => {
    setMessageTemplate((prev) => prev + ` {${varName}}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-emerald-400" />
          Broadcast Pesan Massal Terarah
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kirim penawaran, update info, atau follow up ke ratusan prospek WhatsApp dengan variabel nama otomatis & jeda anti-banned.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Create Campaign (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSend} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Buat Kampanye Pesan Baru
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Judul Kampanye (Internal):
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Promo Diskon Paket CRM Awal Bulan"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Target Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Berdasarkan Tag/Label:
                </label>
                <select
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua Tag ({contacts.length} kontak)</option>
                  <option value="Lead Baru">Hanya "Lead Baru"</option>
                  <option value="VIP">Hanya "VIP"</option>
                  <option value="Hot Prospect">Hanya "Hot Prospect"</option>
                  <option value="Pelanggan">Hanya "Pelanggan"</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Berdasarkan Pipeline:
                </label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua Tahapan Pipeline</option>
                  <option value="lead_baru">Lead Baru</option>
                  <option value="dihubungi">Sudah Dihubungi</option>
                  <option value="penawaran">Penawaran Dikirim</option>
                  <option value="negosiasi">Negosiasi</option>
                  <option value="closing_won">Closing Berhasil (Won)</option>
                </select>
              </div>
            </div>

            {/* Recipients Counter Pill */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Target Penerima Pesan:
              </span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                {targetedRecipients.length} Kontak Terpilih
              </span>
            </div>

            {/* Template editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Template Teks Pesan WhatsApp:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Variabel:</span>
                  <button
                    type="button"
                    onClick={() => insertVariable('nama')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700"
                  >
                    + {`{nama}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('nomor')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700"
                  >
                    + {`{nomor}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('bisnis')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700"
                  >
                    + {`{bisnis}`}
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>

            {/* Anti-spam safety notice */}
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300/90 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Smart Human Delay:</strong> Sistem WhatsPro menyisipkan jeda aman 3–5 detik antar pesan secara otomatis untuk mencegah pemblokiran akun oleh sistem spam WhatsApp.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending || targetedRecipients.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Broadcast...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Broadcast Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Campaign History (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Riwayat Kampanye Broadcast
            </h3>

            {broadcasts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-slate-950 border border-dashed border-slate-800">
                Belum ada riwayat broadcast. Buat kampanye pertama Anda di sebelah kiri.
              </div>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{b.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : b.status === 'sending'
                            ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.status === 'completed' ? 'Selesai' : b.status === 'sending' ? 'Sedang Dikirim' : 'Draft'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                      "{b.messageTemplate}"
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Terkirim: <strong className="text-emerald-400">{b.sentCount}</strong> / {b.totalRecipients}
                      </span>
                      <span>
                        {new Date(b.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {b.totalRecipients > 0 && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((b.sentCount / b.totalRecipients) * 100))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
