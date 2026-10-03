import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Sparkles,
  Bot,
  User,
  Phone,
  Tag,
  DollarSign,
  FileText,
  CheckCheck,
  Check,
  ChevronRight,
  Package,
  Layers,
  Clock,
  Plus,
  Trash2,
  Save,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Contact, ChatMessage, ProductItem, QuickReply } from '../types';
import { api } from '../services/api';

interface ChatViewProps {
  contacts: Contact[];
  messages: ChatMessage[];
  products: ProductItem[];
  quickReplies: QuickReply[];
  selectedContactJid: string | null;
  onSelectContact: (jid: string) => void;
  onSendMessage: (jid: string, text: string) => Promise<void>;
  onUpdateContact: (contact: Partial<Contact>) => Promise<void>;
  onContactCreated: (contact: Contact) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  contacts,
  messages,
  products,
  quickReplies,
  selectedContactJid,
  onSelectContact,
  onSendMessage,
  onUpdateContact,
  onContactCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('all');
  const [inputText, setInputText] = useState('');
  const [showCrmPanel, setShowCrmPanel] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [sending, setSending] = useState(false);

  // CRM panel edit state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStage, setEditStage] = useState<Contact['pipelineStage']>('lead_baru');
  const [editDealValue, setEditDealValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editAiAuto, setEditAiAuto] = useState(true);
  const [savingCrm, setSavingCrm] = useState(false);

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find active contact
  const activeContact = contacts.find((c) => c.jid === selectedContactJid) || contacts[0] || null;

  useEffect(() => {
    if (activeContact) {
      setEditName(activeContact.name);
      setEditPhone(activeContact.phone);
      setEditEmail(activeContact.email || '');
      setEditAddress(activeContact.address || '');
      setEditStage(activeContact.pipelineStage);
      setEditDealValue(activeContact.dealValue || 0);
      setEditNotes(activeContact.notes || '');
      setEditTags(activeContact.tags || []);
      setEditAiAuto(activeContact.aiAutoReplyEnabled);
    }
  }, [activeContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContactJid]);

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTagFilter === 'all') return matchesSearch;
    if (activeTagFilter === 'unread') return matchesSearch && c.unreadCount > 0;
    return matchesSearch && c.tags.includes(activeTagFilter);
  });

  // Current contact messages
  const activeMessages = activeContact ? messages.filter((m) => m.jid === activeContact.jid) : [];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeContact || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await onSendMessage(activeContact.jid, text);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReplyClick = (content: string) => {
    setInputText(content);
  };

  const handleSendProduct = async (product: ProductItem) => {
    if (!activeContact) return;
    const text = `🛍️ *PRODUK:* ${product.name}
🔖 *SKU:* ${product.sku}
💰 *Harga:* Rp ${product.price.toLocaleString('id-ID')}
📦 *Status:* ${product.stockStatus === 'in_stock' ? 'Ready Stock' : 'Pre-Order'}

${product.description}

Tertarik memesan produk ini kak? 😊`;

    setShowProductPicker(false);
    await onSendMessage(activeContact.jid, text);
  };

  const handleSaveCrm = async () => {
    if (!activeContact) return;
    setSavingCrm(true);
    try {
      await onUpdateContact({
        id: activeContact.id,
        jid: activeContact.jid,
        name: editName,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
        pipelineStage: editStage,
        dealValue: Number(editDealValue) || 0,
        notes: editNotes,
        tags: editTags,
        aiAutoReplyEnabled: editAiAuto,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCrm(false);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !editTags.includes(newTagInput.trim())) {
      setEditTags([...editTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim() || !newChatName.trim()) return;

    const digits = newChatPhone.replace(/[^0-9]/g, '');
    const phoneFormatted = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
    const jid = `${phoneFormatted}@s.whatsapp.net`;

    const newContact: Contact = {
      id: 'c-' + Date.now(),
      jid,
      name: newChatName.trim(),
      phone: `+${phoneFormatted}`,
      tags: ['Lead Baru'],
      pipelineStage: 'lead_baru',
      dealValue: 0,
      notes: 'Chat baru dimulai dari dashboard.',
      unreadCount: 0,
      aiAutoReplyEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onContactCreated(newContact);
    onSelectContact(jid);
    setShowNewChatModal(false);
    setNewChatPhone('');
    setNewChatName('');
  };

  const stageLabels: Record<Contact['pipelineStage'], { label: string; color: string }> = {
    lead_baru: { label: 'Lead Baru', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    dihubungi: { label: 'Dihubungi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    penawaran: { label: 'Penawaran', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    negosiasi: { label: 'Negosiasi', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    closing_won: { label: 'Closing Berhasil', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    closing_lost: { label: 'Batal', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR: CONTACTS & CHAT LIST (WhatsApp Web Style)  */}
      {/* ============================================================ */}
      <div className="w-80 sm:w-96 border-r border-slate-800 flex flex-col bg-slate-900/60 shrink-0">
        
        {/* Search & Actions Header */}
        <div className="p-3 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Semua Obrolan
            </span>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Kirim Pesan ke Nomor Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              Chat Baru
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kontak, nomor atau pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Tag Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'unread', label: 'Belum Dibaca' },
              { id: 'Lead Baru', label: 'Lead' },
              { id: 'VIP', label: 'VIP' },
              { id: 'Follow Up', label: 'Follow Up' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTagFilter(tag.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  activeTagFilter === tag.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada percakapan ditemukan.
            </div>
          ) : (
            filteredContacts.map((c) => {
              const isSelected = activeContact?.jid === c.jid;
              const stage = stageLabels[c.pipelineStage] || stageLabels.lead_baru;

              return (
                <div
                  key={c.jid}
                  onClick={() => {
                    onSelectContact(c.jid);
                    api.markAsRead(c.jid);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Contact Avatar */}
                  <div className="relative shrink-0">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {c.aiAutoReplyEnabled && (
                      <span
                        title="AI Auto-Reply Aktif"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] shadow font-bold"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Contact Preview Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-white truncate max-w-[140px]">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.lastMessageTimestamp
                          ? new Date(c.lastMessageTimestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <p className="truncate text-[11px] max-w-[170px] text-slate-300">
                        {c.lastMessage || 'Mulai percakapan...'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="shrink-0 bg-emerald-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Stage & Tags Mini Pills */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${stage.color}`}
                      >
                        {stage.label}
                      </span>
                      {c.dealValue > 0 && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Rp {(c.dealValue / 1000).toLocaleString('id-ID')}k
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. CENTER: ACTIVE CHAT SCREEN (WhatsApp Web Experience)      */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col bg-slate-950 relative min-w-0">
        {activeContact ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {activeContact.avatar ? (
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                      {activeContact.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {activeContact.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        stageLabels[activeContact.pipelineStage]?.color
                      }`}
                    >
                      {stageLabels[activeContact.pipelineStage]?.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block truncate">
                    {activeContact.phone}
                  </span>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                {/* Per-Contact AI Auto-Reply Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !activeContact.aiAutoReplyEnabled;
                    onUpdateContact({
                      id: activeContact.id,
                      jid: activeContact.jid,
                      aiAutoReplyEnabled: nextVal,
                    });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeContact.aiAutoReplyEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Aktifkan/nonaktifkan auto reply AI untuk kontak ini"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">AI Auto-Reply:</span>
                  <span className="font-bold">
                    {activeContact.aiAutoReplyEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Toggle CRM info panel */}
                <button
                  onClick={() => setShowCrmPanel(!showCrmPanel)}
                  className={`p-2 rounded-lg border transition-colors ${
                    showCrmPanel
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Lihat / Edit Data CRM Kontak"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Chat Messages Stream (Wallpaper style) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950/80">
              
              {/* Notice Banner */}
              <div className="max-w-md mx-auto p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pesan masuk otomatis dijawab oleh AI Gemini 3.8 Flash jika AI aktif.</span>
              </div>

              {activeMessages.map((msg) => {
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md relative ${
                        msg.fromMe
                          ? 'bg-emerald-700 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                      }`}
                    >
                      {/* AI Badge for automated reply */}
                      {msg.isAiGenerated && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200 bg-emerald-950/60 px-2 py-0.5 rounded-full mb-1.5 w-fit border border-emerald-400/30">
                          <Sparkles className="w-3 h-3 text-emerald-300" />
                          <span>AI Gemini Auto-Reply</span>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap select-text">
                        {msg.text}
                      </p>

                      {/* Footer time & status */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-200/80">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.fromMe && (
                          <span>
                            {msg.status === 'read' || msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-emerald-300 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Shortcut Pills Bar */}
            <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                Balasan Cepat:
              </span>
              {quickReplies.map((qr) => (
                <button
                  key={qr.id}
                  onClick={() => handleQuickReplyClick(qr.content)}
                  className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1"
                >
                  <span className="text-emerald-400 font-bold">{qr.shortcut}</span>
                  <span className="text-[11px] text-slate-400">{qr.title}</span>
                </button>
              ))}
            </div>

            {/* Product Catalog Picker Popover */}
            {showProductPicker && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto animate-in fade-in">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSendProduct(p)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer border border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Rp {p.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded shrink-0">
                      Kirim
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() => setShowProductPicker(!showProductPicker)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  showProductPicker
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Kirim Produk dari Katalog Bisnis"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Katalog</span>
              </button>

              <input
                type="text"
                placeholder="Ketik pesan WhatsApp atau ketik / untuk balasan cepat..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-8 gap-3">
            <MessageSquare className="w-12 h-12 text-slate-700" />
            <p>Pilih salah satu kontak di sebelah kiri untuk memulai chat.</p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. RIGHT SIDEBAR: INTEGRATED CRM CONTACT DRAWER              */}
      {/* ============================================================ */}
      {showCrmPanel && activeContact && (
        <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200">
          
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              Data CRM Kontak
            </span>
            <button
              onClick={() => setShowCrmPanel(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            
            {/* Pipeline Stage Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Tahap Penjualan (Pipeline):
              </label>
              <select
                value={editStage}
                onChange={(e) => setEditStage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="lead_baru">Lead Baru (Prospek)</option>
                <option value="dihubungi">Sudah Dihubungi</option>
                <option value="penawaran">Penawaran Dikirim</option>
                <option value="negosiasi">Tahap Negosiasi</option>
                <option value="closing_won">Closing Berhasil (Pelanggan)</option>
                <option value="closing_lost">Batal / Tidak Tertarik</option>
              </select>
            </div>

            {/* Deal Value */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Potensi Nilai Transaksi (Rp):
              </label>
              <input
                type="number"
                value={editDealValue}
                onChange={(e) => setEditDealValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Nama Kontak:
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Nomor WhatsApp:
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email & Address */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Alamat / Kota:
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Jakarta, Surabaya, dll"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tags Manager */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Label & Tag:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Tambah tag baru..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Catatan Khusus Pelanggan:
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Tuliskan preferensi, kendala, atau jadwal follow up..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* AI Toggle inside CRM drawer */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">AI Auto-Reply</span>
                <span className="text-[10px] text-slate-400">Respon otomatis pesan pelanggan ini</span>
              </div>
              <input
                type="checkbox"
                checked={editAiAuto}
                onChange={(e) => setEditAiAuto(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveCrm}
              disabled={savingCrm}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              {savingCrm ? 'Menyimpan...' : 'Simpan Perubahan CRM'}
            </button>

          </div>

        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Kirim Pesan ke Nomor Baru
            </h3>
            <p className="text-xs text-slate-400">
              Masukkan nomor WhatsApp tujuan untuk membuka ruang obrolan baru.
            </p>

            <form onSubmit={handleCreateNewChat} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Kontak / Perusahaan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Anton"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nomor WhatsApp:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Buka Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
