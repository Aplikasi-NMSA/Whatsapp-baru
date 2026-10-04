import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { CrmPipelineView } from './components/CrmPipelineView';
import { BusinessCatalogView } from './components/BusinessCatalogView';
import { BroadcastView } from './components/BroadcastView';
import { WhatsAppConnectModal } from './components/WhatsAppConnectModal';
import { CronKeepAliveModal } from './components/CronKeepAliveModal';
import { WhatsAppWebQrLanding } from './components/WhatsAppWebQrLanding';
import { AntiSpamModal } from './components/AntiSpamModal';
import { X, Users, Store, Radio } from 'lucide-react';
import {
  Contact,
  ChatMessage,
  ProductItem,
  QuickReply,
  BroadcastCampaign,
  BusinessSettings,
  WhatsAppConnectionStatus,
  ServerStats
} from './types';
import { api } from './services/api';

export default function App() {
  const [selectedContactJid, setSelectedContactJid] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'qr_landing' | 'dashboard'>('qr_landing');

  // Core Data
  const [waStatus, setWaStatus] = useState<WhatsAppConnectionStatus>({
    state: 'disconnected',
    qrCodeUrl: null,
    pairingCode: null,
    connectedNumber: null,
    connectedName: null,
    lastConnectedAt: null,
    error: null,
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>([]);
  const [stats, setStats] = useState<ServerStats | null>(null);

  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'WhatsPro Store & Solution',
    tagline: 'Solusi Bisnis & Layanan Cepat Tanggap 24/7',
    category: 'Retail & Digital Agency',
    description: '',
    operatingHours: 'Senin - Sabtu: 08:30 - 21:00 WIB',
    isAwayNow: false,
    address: 'Jl. Sudirman Bisnis Park No. 88, Jakarta Selatan',
    phone: '0812-3456-7890',
    email: 'info@whatspro.id',
    website: 'https://whatspro.id',
    instagram: '@whatspro.official',
    aiEnabled: true,
    aiPersona: 'cs_friendly',
    aiPersonaCustomName: 'Siti AI CS',
    aiSystemPrompt: '',
    aiKnowledgeBase: '',
    aiResponseDelaySec: 2,
    aiHumanTakeoverMinutes: 30,
    antiSpamEnabled: true,
    antiSpamMinDelaySec: 3,
    antiSpamMaxDelaySec: 7,
    antiSpamHumanTyping: true,
    antiSpamCooldownSec: 5,
    antiSpamReplyGroups: false,
    antiSpamMaxPerMinute: 15,
    antiSpamIgnoredNumbers: '',
    greetingEnabled: true,
    greetingMessage: 'Halo kak! Terima kasih telah menghubungi kami. Ada yang bisa dibantu?',
    awayMessageEnabled: true,
    awayMessage: 'Terima kasih telah menghubungi kami. Saat ini kami sedang di luar jam kerja.',
  });

  // Modals for Top-Right Dropdown
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCronModalOpen, setIsCronModalOpen] = useState(false);
  const [isAntiSpamModalOpen, setIsAntiSpamModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Initial load
  const loadAllData = useCallback(async () => {
    try {
      const [
        statusRes,
        contactsRes,
        messagesRes,
        productsRes,
        qrRes,
        settingsRes,
        broadcastsRes,
        statsRes
      ] = await Promise.all([
        api.getWhatsAppStatus(),
        api.getContacts(),
        api.getMessages(),
        api.getProducts(),
        api.getQuickReplies(),
        api.getSettings(),
        api.getBroadcasts(),
        api.getStats()
      ]);

      setWaStatus(statusRes);
      if (statusRes.state === 'connected') {
        setViewMode('dashboard');
      }
      setContacts(contactsRes);
      setMessages(messagesRes);
      setProducts(productsRes);
      setQuickReplies(qrRes);
      setSettings(settingsRes);
      setBroadcasts(broadcastsRes);
      setStats(statsRes);

      if (contactsRes.length > 0 && !selectedContactJid) {
        setSelectedContactJid(contactsRes[0].jid);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }, [selectedContactJid]);

  useEffect(() => {
    loadAllData();
  }, []);

  // WebSocket Live Real-Time Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connectWs() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WebSocket] Connected to WhatsPro real-time server');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'status_update') {
              setWaStatus(data.data);
              if (data.data.state === 'connected') {
                setViewMode('dashboard');
              }
            } else if (data.type === 'qr_received') {
              setWaStatus((prev) => ({
                ...prev,
                qrCodeUrl: data.data.qrUrl,
                state: 'qr_ready',
              }));
            } else if (data.type === 'ready') {
              setWaStatus(data.data);
              setViewMode('dashboard');
            } else if (data.type === 'new_message') {
              const newMsg: ChatMessage = data.data;
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              api.getContacts().then((updated) => setContacts(updated));
            } else if (data.type === 'contact_updated') {
              setContacts((prev) => {
                const idx = prev.findIndex((c) => c.id === data.data.id || c.jid === data.data.jid);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = data.data;
                  return copy;
                }
                return [data.data, ...prev];
              });
            } else if (data.type === 'contact_deleted') {
              setContacts((prev) => prev.filter((c) => c.id !== data.data.id));
            } else if (data.type === 'settings_updated') {
              setSettings(data.data);
            } else if (data.type === 'cron_ping') {
              api.getStats().then((s) => setStats(s));
            } else if (data.type === 'broadcast_progress' || data.type === 'broadcast_completed') {
              api.getBroadcasts().then((b) => setBroadcasts(b));
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    }

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Handlers
  const handleSendMessage = async (jid: string, text: string) => {
    try {
      const res = await api.sendWhatsAppMessage(jid, text);
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        setContacts((prev) =>
          prev.map((c) =>
            c.jid === jid
              ? {
                  ...c,
                  lastMessage: text,
                  lastMessageTimestamp: Date.now(),
                  updatedAt: Date.now(),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSaveContact = async (contactData: Partial<Contact>) => {
    try {
      const saved = await api.saveContact(contactData);
      setContacts((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id || c.jid === saved.jid);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Hapus kontak prospek ini dari CRM?')) {
      try {
        await api.deleteContact(id);
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImportContacts = async (newContacts: Partial<Contact>[]) => {
    try {
      await api.importContacts(newContacts);
      const updated = await api.getContacts();
      setContacts(updated);
      alert(`Berhasil mengimpor ${newContacts.length} kontak ke CRM!`);
    } catch (err: any) {
      alert('Gagal mengimpor kontak: ' + err?.message);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<BusinessSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (product: Partial<ProductItem>) => {
    try {
      const saved = await api.saveProduct(product);
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const list = [...prev];
          list[idx] = saved;
          return list;
        }
        return [...prev, saved];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Hapus produk ini dari katalog?')) {
      try {
        await api.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveQuickReply = async (qr: Partial<QuickReply>) => {
    try {
      const saved = await api.saveQuickReply(qr);
      setQuickReplies((prev) => {
        const idx = prev.findIndex((q) => q.id === saved.id);
        if (idx >= 0) {
          const list = [...prev];
          list[idx] = saved;
          return list;
        }
        return [...prev, saved];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuickReply = async (id: string) => {
    if (confirm('Hapus balasan cepat ini?')) {
      try {
        await api.deleteQuickReply(id);
        setQuickReplies((prev) => prev.filter((q) => q.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateBroadcast = async (data: {
    title: string;
    messageTemplate: string;
    targetTag?: string;
    targetStage?: string;
  }) => {
    try {
      const newBroadcast = await api.createBroadcast(data);
      setBroadcasts((prev) => [newBroadcast, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleResetSession = async () => {
    try {
      await api.resetWhatsApp();
      setViewMode('qr_landing');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.logoutWhatsApp();
      setWaStatus({
        state: 'disconnected',
        qrCodeUrl: null,
        pairingCode: null,
        connectedNumber: null,
        connectedName: null,
        lastConnectedAt: null,
        error: null,
      });
      setViewMode('qr_landing');
      await api.connectWhatsApp();
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Tampilan Pertama berupa QR Code Otentik WhatsApp Web
  if (viewMode === 'qr_landing') {
    return (
      <>
        <WhatsAppWebQrLanding
          waStatus={waStatus}
          stats={stats}
          onRefreshQr={() => api.connectWhatsApp()}
          onResetSession={handleResetSession}
          onDisconnect={handleDisconnect}
          onEnterDashboard={() => setViewMode('dashboard')}
        />
        <CronKeepAliveModal
          isOpen={isCronModalOpen}
          onClose={() => setIsCronModalOpen(false)}
        />
      </>
    );
  }

  // 2. Tampilan Utama: HANYA MENAMPILKAN CHAT SAJA (Layar Penuh WhatsApp Web)
  return (
    <div className="min-h-screen bg-[#111b21] text-slate-100 flex flex-col font-sans selection:bg-[#00a884] selection:text-white">
      
      {/* Top Header dengan Tombol Pengaturan Dropdown di Pojok Kanan Atas */}
      <Header
        waStatus={waStatus}
        stats={stats}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenCronModal={() => setIsCronModalOpen(true)}
        onOpenAntiSpamModal={() => setIsAntiSpamModalOpen(true)}
        onOpenCrmModal={() => setIsCrmModalOpen(true)}
        onOpenCatalogModal={() => setIsCatalogModalOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onSwitchToQrLanding={() => setViewMode('qr_landing')}
        onResetSession={handleResetSession}
        onDisconnect={handleDisconnect}
        aiEnabled={settings.aiEnabled}
        onToggleAi={() => handleUpdateSettings({ aiEnabled: !settings.aiEnabled })}
      />

      {/* Layar Utama: HANYA Menampilkan Chat WhatsApp Real-Time */}
      <main className="flex-1 overflow-hidden">
        <ChatView
          contacts={contacts}
          messages={messages}
          products={products}
          quickReplies={quickReplies}
          selectedContactJid={selectedContactJid}
          onSelectContact={(jid) => setSelectedContactJid(jid)}
          onSendMessage={handleSendMessage}
          onUpdateContact={handleSaveContact}
          onContactCreated={(c) => {
            setContacts((prev) => [c, ...prev]);
            setSelectedContactJid(c.jid);
          }}
        />
      </main>

      {/* ============================================================ */}
      {/* MODAL DIALOGS YANG DIAKSES DARI DROPDOWN PENGATURAN         */}
      {/* ============================================================ */}

      {/* Modal 1: Pengaturan Bot AI & Anti-Spam (Jeda & Proteksi Banned) */}
      <AntiSpamModal
        isOpen={isAntiSpamModalOpen}
        onClose={() => setIsAntiSpamModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Modal 2: CRM Kontak & Pipeline */}
      {isCrmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111b21] border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#202c33]">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Users className="w-5 h-5 text-blue-400" />
                <span>CRM Leads & Pipeline Penjualan</span>
              </div>
              <button
                onClick={() => setIsCrmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CrmPipelineView
                contacts={contacts}
                onOpenChat={(jid) => {
                  setSelectedContactJid(jid);
                  setIsCrmModalOpen(false);
                }}
                onSaveContact={handleSaveContact}
                onDeleteContact={handleDeleteContact}
                onImportContacts={handleImportContacts}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Katalog Produk & Profil Bisnis */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111b21] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#202c33]">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Store className="w-5 h-5 text-teal-400" />
                <span>Katalog Produk & Profil Bisnis</span>
              </div>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BusinessCatalogView
                settings={settings}
                products={products}
                quickReplies={quickReplies}
                onUpdateSettings={handleUpdateSettings}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onSaveQuickReply={handleSaveQuickReply}
                onDeleteQuickReply={handleDeleteQuickReply}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Broadcast Pesan Massal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111b21] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#202c33]">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Radio className="w-5 h-5 text-purple-400" />
                <span>Broadcast Pesan Massal</span>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BroadcastView
                contacts={contacts}
                broadcasts={broadcasts}
                onCreateBroadcast={handleCreateBroadcast}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: WhatsApp QR & Pairing Modal */}
      <WhatsAppConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        waStatus={waStatus}
        onRefresh={() => api.connectWhatsApp()}
      />

      {/* Modal 6: UptimeRobot Link Cron Keep-Alive Modal */}
      <CronKeepAliveModal
        isOpen={isCronModalOpen}
        onClose={() => setIsCronModalOpen(false)}
      />

    </div>
  );
}
