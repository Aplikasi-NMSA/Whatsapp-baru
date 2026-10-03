import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit,
  Tag,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { Contact } from '../types';

interface CrmPipelineViewProps {
  contacts: Contact[];
  onOpenChat: (jid: string) => void;
  onSaveContact: (contact: Partial<Contact>) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
  onImportContacts: (contacts: Partial<Contact>[]) => Promise<void>;
}

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  contacts,
  onOpenChat,
  onSaveContact,
  onDeleteContact,
  onImportContacts,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStage, setFormStage] = useState<Contact['pipelineStage']>('lead_baru');
  const [formDealValue, setFormDealValue] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formTags, setFormTags] = useState('Lead Baru');

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTag === 'all') return matchesSearch;
    return matchesSearch && c.tags.includes(selectedTag);
  });

  const stages: { id: Contact['pipelineStage']; label: string; color: string; border: string }[] = [
    { id: 'lead_baru', label: 'Lead Baru', color: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/30' },
    { id: 'dihubungi', label: 'Sudah Dihubungi', color: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/30' },
    { id: 'penawaran', label: 'Penawaran Dikirim', color: 'from-purple-600/20 to-purple-900/10', border: 'border-purple-500/30' },
    { id: 'negosiasi', label: 'Negosiasi', color: 'from-orange-600/20 to-orange-900/10', border: 'border-orange-500/30' },
    { id: 'closing_won', label: 'Closing Berhasil (Won)', color: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/30' },
  ];

  const totalPipelineValue = contacts.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  const wonValue = contacts
    .filter((c) => c.pipelineStage === 'closing_won')
    .reduce((acc, c) => acc + (c.dealValue || 0), 0);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormStage('lead_baru');
    setFormDealValue(0);
    setFormNotes('');
    setFormTags('Lead Baru');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email || '');
    setFormAddress(c.address || '');
    setFormStage(c.pipelineStage);
    setFormDealValue(c.dealValue || 0);
    setFormNotes(c.notes || '');
    setFormTags(c.tags.join(', '));
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await onSaveContact({
      id: editingContact ? editingContact.id : undefined,
      jid: editingContact ? editingContact.jid : undefined,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      pipelineStage: formStage,
      dealValue: Number(formDealValue) || 0,
      notes: formNotes.trim(),
      tags: tagsArray.length ? tagsArray : ['Lead Baru'],
    });

    setIsAddModalOpen(false);
  };

  const handleMoveStage = async (contact: Contact, newStage: Contact['pipelineStage']) => {
    await onSaveContact({
      id: contact.id,
      jid: contact.jid,
      pipelineStage: newStage,
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `whatspro-contacts-${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportSample = async () => {
    const sample = [
      {
        name: 'Hendra Wijaya (CV Berkah)',
        phone: '0813-8822-1199',
        email: 'hendra@berkah.com',
        tags: ['Prospek CRM', 'Hot'],
        pipelineStage: 'penawaran',
        dealValue: 500000,
        notes: 'Minta contoh integrasi AI chatbot WhatsApp.',
      },
      {
        name: 'Rina Anggraini',
        phone: '0852-9900-1122',
        email: 'rina.ang@gmail.com',
        tags: ['Retail', 'VIP'],
        pipelineStage: 'closing_won',
        dealValue: 350000,
        notes: 'Sudah aktif, customer setia.',
      },
    ];
    await onImportContacts(sample as any);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Manajemen Kontak & CRM Penjualan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola prospek dari WhatsApp, atur tahapan closing, dan catat potensi omset bisnis Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabel
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export JSON
          </button>

          <button
            onClick={handleImportSample}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Import Contoh Prospek Cepat"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            + Contoh Data
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Kontak
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Kontak Prospek</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{contacts.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Nilai Pipeline Berjalan</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-mono">
              Rp {totalPipelineValue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Closing Berhasil (Won)</span>
            <span className="text-2xl font-extrabold text-teal-400 mt-1 block font-mono">
              Rp {wonValue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pelanggan Won</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {contacts.filter((c) => c.pipelineStage === 'closing_won').length} kontak
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kontak, nomor HP atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'Lead Baru', 'VIP', 'Hot Prospect', 'Pelanggan'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tag === 'all' ? 'Semua Tag' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* KANBAN VIEW                                                  */}
      {/* ============================================================ */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((st) => {
            const stageContacts = filteredContacts.filter((c) => c.pipelineStage === st.id);
            const stageTotal = stageContacts.reduce((acc, c) => acc + (c.dealValue || 0), 0);

            return (
              <div
                key={st.id}
                className={`rounded-2xl bg-gradient-to-b ${st.color} border ${st.border} p-3 flex flex-col min-w-[240px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                      {st.label}
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block mt-0.5">
                      Rp {stageTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    {stageContacts.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageContacts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
                      Kosong
                    </div>
                  ) : (
                    stageContacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 shadow-sm transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {c.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {c.phone}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                              title="Edit Kontak"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteContact(c.id)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                              title="Hapus Kontak"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Deal Value */}
                        {c.dealValue > 0 && (
                          <div className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                            Rp {c.dealValue.toLocaleString('id-ID')}
                          </div>
                        )}

                        {/* Notes preview */}
                        {c.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                            "{c.notes}"
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => onOpenChat(c.jid)}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat WA
                          </button>

                          {/* Quick stage changer */}
                          <select
                            value={c.pipelineStage}
                            onChange={(e) => handleMoveStage(c, e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                          >
                            <option value="lead_baru">Pindah: Lead Baru</option>
                            <option value="dihubungi">Pindah: Dihubungi</option>
                            <option value="penawaran">Pindah: Penawaran</option>
                            <option value="negosiasi">Pindah: Negosiasi</option>
                            <option value="closing_won">Pindah: Closing Won</option>
                            <option value="closing_lost">Pindah: Batal</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================ */
        /* TABLE VIEW                                                   */
        /* ============================================================ */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5">Nomor WA</th>
                  <th className="p-3.5">Tahap Pipeline</th>
                  <th className="p-3.5">Nilai Transaksi</th>
                  <th className="p-3.5">Label</th>
                  <th className="p-3.5">Catatan</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{c.name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{c.phone}</td>
                    <td className="p-3.5">
                      <select
                        value={c.pipelineStage}
                        onChange={(e) => handleMoveStage(c, e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="lead_baru">Lead Baru</option>
                        <option value="dihubungi">Sudah Dihubungi</option>
                        <option value="penawaran">Penawaran</option>
                        <option value="negosiasi">Negosiasi</option>
                        <option value="closing_won">Closing Won</option>
                        <option value="closing_lost">Batal</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      Rp {c.dealValue.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{c.notes || '-'}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenChat(c.jid)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg font-semibold transition-colors"
                      >
                        Buka Chat
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 hover:text-white text-slate-400"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => onDeleteContact(c.id)}
                        className="p-1 hover:text-rose-400 text-slate-400"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Contact */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              {editingContact ? 'Edit Data Kontak CRM' : 'Tambah Kontak Prospek Baru'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama Kontak:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Pak Budi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nomor WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tahap Pipeline:</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="lead_baru">Lead Baru</option>
                    <option value="dihubungi">Sudah Dihubungi</option>
                    <option value="penawaran">Penawaran Dikirim</option>
                    <option value="negosiasi">Negosiasi</option>
                    <option value="closing_won">Closing Berhasil (Won)</option>
                    <option value="closing_lost">Batal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Potensi Omset (Rp):</label>
                  <input
                    type="number"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@perusahaan.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Label / Tag (Pisahkan koma):</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="VIP, Hot, Retail"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Catatan Tambahan:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan kebutuhan klien, janji follow up..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
