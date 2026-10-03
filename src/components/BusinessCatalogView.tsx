import React, { useState } from 'react';
import {
  Store,
  Package,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Mail,
  Globe,
  Instagram,
  CheckCircle2,
  Save,
  MessageSquare,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { BusinessSettings, ProductItem, QuickReply } from '../types';

interface BusinessCatalogViewProps {
  settings: BusinessSettings;
  products: ProductItem[];
  quickReplies: QuickReply[];
  onUpdateSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  onSaveProduct: (product: Partial<ProductItem>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveQuickReply: (qr: Partial<QuickReply>) => Promise<void>;
  onDeleteQuickReply: (id: string) => Promise<void>;
}

export const BusinessCatalogView: React.FC<BusinessCatalogViewProps> = ({
  settings,
  products,
  quickReplies,
  onUpdateSettings,
  onSaveProduct,
  onDeleteProduct,
  onSaveQuickReply,
  onDeleteQuickReply,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'catalog' | 'quick_replies' | 'messages'>('profile');

  // Business profile form
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [category, setCategory] = useState(settings.category);
  const [description, setDescription] = useState(settings.description);
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours);
  const [isAwayNow, setIsAwayNow] = useState(settings.isAwayNow);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [website, setWebsite] = useState(settings.website);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);

  // Automated messages form
  const [greetingEnabled, setGreetingEnabled] = useState(settings.greetingEnabled);
  const [greetingMessage, setGreetingMessage] = useState(settings.greetingMessage);
  const [awayMessageEnabled, setAwayMessageEnabled] = useState(settings.awayMessageEnabled);
  const [awayMessage, setAwayMessage] = useState(settings.awayMessage);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState<ProductItem['stockStatus']>('in_stock');

  // Quick reply modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [editingQr, setEditingQr] = useState<QuickReply | null>(null);
  const [qrShortcut, setQrShortcut] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [qrContent, setQrContent] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedProfileSuccess(false);

    try {
      await onUpdateSettings({
        businessName,
        tagline,
        category,
        description,
        operatingHours,
        isAwayNow,
        address,
        phone,
        email,
        website,
        instagram,
        greetingEnabled,
        greetingMessage,
        awayMessageEnabled,
        awayMessage,
      });
      setSavedProfileSuccess(true);
      setTimeout(() => setSavedProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSku('');
    setProdPrice(0);
    setProdCategory('Software & Layanan');
    setProdDescription('');
    setProdImage('');
    setProdStock('in_stock');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdSku(p.sku);
    setProdPrice(p.price);
    setProdCategory(p.category);
    setProdDescription(p.description);
    setProdImage(p.imageUrl || '');
    setProdStock(p.stockStatus);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    await onSaveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      name: prodName.trim(),
      sku: prodSku.trim() || 'SKU-' + Date.now().toString().slice(-4),
      price: Number(prodPrice) || 0,
      category: prodCategory.trim() || 'Umum',
      description: prodDescription.trim(),
      imageUrl: prodImage.trim() || undefined,
      stockStatus: prodStock,
    });

    setIsProductModalOpen(false);
  };

  const handleOpenAddQr = () => {
    setEditingQr(null);
    setQrShortcut('/');
    setQrTitle('');
    setQrContent('');
    setIsQrModalOpen(true);
  };

  const handleOpenEditQr = (qr: QuickReply) => {
    setEditingQr(qr);
    setQrShortcut(qr.shortcut);
    setQrTitle(qr.title);
    setQrContent(qr.content);
    setIsQrModalOpen(true);
  };

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrShortcut.trim() || !qrContent.trim()) return;

    await onSaveQuickReply({
      id: editingQr ? editingQr.id : undefined,
      shortcut: qrShortcut.startsWith('/') ? qrShortcut.trim() : '/' + qrShortcut.trim(),
      title: qrTitle.trim() || 'Balasan Cepat',
      content: qrContent.trim(),
    });

    setIsQrModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-400" />
            Fitur WhatsApp Business & Katalog Produk (Gratis)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upgrade nomor pribadi Anda menjadi profil bisnis premium dengan katalog produk, balasan cepat, dan jam operasional.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'profile', label: 'Profil Usaha' },
            { id: 'catalog', label: `Katalog Produk (${products.length})` },
            { id: 'quick_replies', label: `Balasan Cepat (${quickReplies.length})` },
            { id: 'messages', label: 'Pesan Otomatis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. PROFIL BISNIS                                             */}
      {/* ============================================================ */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              Identitas & Informasi Usaha
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nama Bisnis / Toko:</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Bisnis:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Retail, Fashion, Agency, F&B, dll"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Slogan / Tagline:</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi Lengkap Usaha:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Jadwal & Jam Operasional:
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Senin-Sabtu 08:30 - 21:00 WIB"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Alamat Fisik / Lokasi:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Email Bisnis:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Website Resmi:
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-emerald-400" />
                  Instagram / Medsos:
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Away Mode Switch */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Status Luar Jam Kerja (Away Mode)</span>
                <span className="text-[11px] text-slate-400">
                  Jika aktif, pesan otomatis di luar jam kerja akan dikirimkan kepada kontak baru.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAwayNow}
                onChange={(e) => setIsAwayNow(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {savedProfileSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Profil Bisnis berhasil diperbarui!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Menyimpan...' : 'Simpan Profil Bisnis'}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* 2. KATALOG PRODUK                                            */}
      {/* ============================================================ */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Daftar produk ini otomatis terbaca oleh AI Gemini saat calon pembeli menanyakan katalog atau harga di WhatsApp.
            </p>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-36 object-cover rounded-xl border border-slate-800"
                    />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {p.category} • {p.sku}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{p.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        p.stockStatus === 'in_stock'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.stockStatus === 'pre_order'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {p.stockStatus === 'in_stock'
                        ? 'Ready Stock'
                        : p.stockStatus === 'pre_order'
                        ? 'Pre-Order'
                        : 'Habis'}
                    </span>
                  </div>

                  <div className="text-base font-extrabold text-emerald-400 font-mono">
                    Rp {p.price.toLocaleString('id-ID')}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditProduct(p)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. BALASAN CEPAT (QUICK REPLIES)                            */}
      {/* ============================================================ */}
      {activeTab === 'quick_replies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Gunakan shortcut seperti <code className="text-emerald-400 font-mono font-bold">/halo</code> atau{' '}
              <code className="text-emerald-400 font-mono font-bold">/rekening</code> di ruang chat untuk mengirim pesan dengan 1-klik.
            </p>
            <button
              onClick={handleOpenAddQr}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Balasan Cepat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickReplies.map((qr) => (
              <div
                key={qr.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {qr.shortcut}
                    </span>
                    <span className="text-xs font-bold text-white">{qr.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditQr(qr)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteQuickReply(qr.id)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                  {qr.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PESAN OTOMATIS (GREETING & AWAY)                          */}
      {/* ============================================================ */}
      {activeTab === 'messages' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-3xl">
          {/* Greeting message */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pesan Sambutan Otomatis (Greeting Message)</h3>
              </div>
              <input
                type="checkbox"
                checked={greetingEnabled}
                onChange={(e) => setGreetingEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400">
              Kirimkan salam pembuka secara otomatis saat pelanggan baru pertama kali mengirim pesan ke nomor WhatsApp Anda.
            </p>
            <textarea
              rows={3}
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Away message */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Pesan Di Luar Jam Kerja (Away Message)</h3>
              </div>
              <input
                type="checkbox"
                checked={awayMessageEnabled}
                onChange={(e) => setAwayMessageEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400">
              Diberikan saat ada pesan masuk di luar jam operasional atau ketika toko sedang tutup sementara.
            </p>
            <textarea
              rows={3}
              value={awayMessage}
              onChange={(e) => setAwayMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Simpan Pesan Otomatis
            </button>
          </div>
        </form>
      )}

      {/* Modal Add / Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama Produk:</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Contoh: Paket Pro CRM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kode SKU:</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="WP-PRO-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Harga (Rp):</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Software, Jasa, Fisik"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status Stok:</label>
                  <select
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="in_stock">Ready Stock</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="out_of_stock">Stok Habis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">URL Gambar (Opsional):</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi Produk:</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Detail fitur, keunggulan, spesifikasi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Quick Reply */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              {editingQr ? 'Edit Balasan Cepat' : 'Tambah Balasan Cepat'}
            </h3>

            <form onSubmit={handleQrSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Shortcut (awali dengan /):
                </label>
                <input
                  type="text"
                  required
                  value={qrShortcut}
                  onChange={(e) => setQrShortcut(e.target.value)}
                  placeholder="Contoh: /promo, /lokasi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Judul / Label:</label>
                <input
                  type="text"
                  required
                  value={qrTitle}
                  onChange={(e) => setQrTitle(e.target.value)}
                  placeholder="Contoh: Promo Spesial Weekend"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Isi Pesan:</label>
                <textarea
                  rows={4}
                  required
                  value={qrContent}
                  onChange={(e) => setQrContent(e.target.value)}
                  placeholder="Ketik teks pesan lengkap yang akan terkirim..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
