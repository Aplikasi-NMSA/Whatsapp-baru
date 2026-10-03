import fs from 'fs';
import path from 'path';
import {
  Contact,
  ChatMessage,
  ProductItem,
  QuickReply,
  BroadcastCampaign,
  BusinessSettings,
  PingLog
} from './types';

interface StoreData {
  settings: BusinessSettings;
  contacts: Contact[];
  messages: ChatMessage[];
  products: ProductItem[];
  quickReplies: QuickReply[];
  broadcasts: BroadcastCampaign[];
  pingLogs: PingLog[];
  serverStartTime: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'crm_store.json');

const defaultSettings: BusinessSettings = {
  businessName: 'WhatsPro Store & Solution',
  tagline: 'Solusi Bisnis & Layanan Cepat Tanggap 24/7',
  category: 'Retail & Digital Agency',
  description: 'Kami menyediakan layanan produk digital, konsultasi bisnis, dan perlengkapan usaha dengan jaminan kualitas terbaik.',
  operatingHours: 'Senin - Sabtu: 08:30 - 21:00 WIB (Minggu: 10:00 - 17:00 WIB)',
  isAwayNow: false,
  address: 'Jl. Sudirman Bisnis Park No. 88, Jakarta Selatan',
  phone: '0812-3456-7890',
  email: 'info@whatspro.id',
  website: 'https://whatspro.id',
  instagram: '@whatspro.official',

  // AI Chatbot Settings
  aiEnabled: true,
  aiPersona: 'cs_friendly',
  aiPersonaCustomName: 'Siti AI CS',
  aiSystemPrompt: `Anda adalah Customer Service & Sales Assistant resmi bernama "Siti" dari WhatsPro Store.
Tugas Anda:
1. Menjawab pertanyaan calon pembeli atau pelanggan dengan ramah, sopan, antusias, dan menggunakan bahasa Indonesia yang natural (hangat, profesional, sesekali gunakan emotikon yang wajar 😊).
2. Membantu menjelaskan informasi produk, harga, dan cara pemesanan berdasarkan Katalog Produk dan Informasi Usaha yang tersedia.
3. Selalu tawarkan bantuan lanjutan dan dorong pelanggan untuk melakukan pemesanan jika mereka sudah tertarik.
4. Jika pelanggan bertanya hal di luar produk atau meminta berbicara dengan admin/manusia, beri tahu bahwa admin tim kami akan segera menghubungi mereka secara langsung.
5. Jaga jawaban tetap ringkas, padat, dan mudah dibaca di layar HP WhatsApp (hindari paragraf yang terlalu panjang).`,
  aiKnowledgeBase: `PRODUK & LAYANAN:
- Paket Starter: Rp 150.000 (Akses sistem dasar, 1 nomor, panduan lengkap)
- Paket Professional CRM: Rp 350.000 (Semua fitur Starter + AI Chatbot Gemini tanpa batas + CRM Leads)
- Paket Enterprise Custom: Rp 750.000 (Full setup, integrasi UptimeRobot, konsultasi 1-on-1)

METODE PEMBAYARAN:
- Transfer Bank BCA: 8830-192-881 a/n PT WhatsPro Digital
- Bank Mandiri: 137-00-1928-8812 a/n PT WhatsPro Digital
- QRIS (Bisa scan via GoPay, OVO, Dana, ShopeePay, Mobile Banking)

PENGIRIMAN & AKSES:
- Pengiriman instan digital langsung aktif via WhatsApp setelah konfirmasi transfer
- Garansi kepuasan 100% dan bantuan panduan teknis`,
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
  greetingMessage: 'Halo kak! Terima kasih telah menghubungi WhatsPro Store 😊. Ada yang bisa kami bantu seputar produk atau konsultasi hari ini?',
  awayMessageEnabled: true,
  awayMessage: 'Terima kasih telah menghubungi kami. Saat ini kami sedang di luar jam operasional kerja. Pesan kakak sudah tercatat dan tim kami akan segera merespons di jam kerja. Terima kasih!'
};

const defaultQuickReplies: QuickReply[] = [
  {
    id: 'qr-1',
    shortcut: '/halo',
    title: 'Salam Sambutan',
    content: 'Halo kak! Selamat datang di WhatsPro Store 😊 Ada yang bisa saya bantu hari ini?'
  },
  {
    id: 'qr-2',
    shortcut: '/harga',
    title: 'Daftar Harga & Paket',
    content: 'Berikut daftar paket kami:\n1. Paket Starter: Rp 150.000\n2. Paket Pro CRM + AI: Rp 350.000\n3. Paket Enterprise: Rp 750.000\n\nKira-kira kakak membutuhkan paket yang mana?'
  },
  {
    id: 'qr-3',
    shortcut: '/rekening',
    title: 'Informasi Rekening',
    content: 'Untuk pembayaran dapat ditransfer ke:\n🏦 BCA: 8830-192-881\n🏦 Mandiri: 137-00-1928-8812\na/n PT WhatsPro Digital\n\nSetelah transfer, mohon kirim bukti transfer ke chat ini ya kak 🙏'
  },
  {
    id: 'qr-4',
    shortcut: '/lokasi',
    title: 'Alamat Kantor',
    content: 'Kantor WhatsPro berlokasi di Jl. Sudirman Bisnis Park No. 88, Jakarta Selatan (Buka Senin-Sabtu 08:30 - 21:00 WIB).'
  },
  {
    id: 'qr-5',
    shortcut: '/terimakasih',
    title: 'Ucapan Terima Kasih',
    content: 'Terima kasih banyak atas pesan dan kepercayaannya kak! Jika butuh bantuan lagi, jangan ragu untuk hubungi kami kapan saja ya 😊'
  }
];

const defaultProducts: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Paket WhatsPro Pro CRM + AI',
    sku: 'WP-PRO-CRM',
    price: 350000,
    description: 'Lisensi WhatsApp Business Premium lengkap dengan AI Chatbot Gemini 3.8 Flash otomatis, CRM kontak, kanban leads, dan link cron UptimeRobot 24/7.',
    category: 'Software & CRM',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    stockStatus: 'in_stock'
  },
  {
    id: 'prod-2',
    name: 'Paket Starter Basic WhatsApp Web',
    sku: 'WP-STARTER',
    price: 150000,
    description: 'Solusi dasar WhatsApp Web multi-device dengan auto-reply pesan sambutan dan manajemen kontak sederhana.',
    category: 'Software & CRM',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    stockStatus: 'in_stock'
  },
  {
    id: 'prod-3',
    name: 'Setup Enterprise UptimeRobot 24/7 + Custom Bot',
    sku: 'WP-ENTERPRISE',
    price: 750000,
    description: 'Setup server dedicated, konfigurasi keep-alive uptime monitor 24/7 tanpa putus, dan prompt AI custom sesuai spesifik bisnis Anda.',
    category: 'Konsultasi & Setup',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
    stockStatus: 'in_stock'
  }
];

const defaultContacts: Contact[] = [
  {
    id: 'c-1',
    jid: '6281298765432@s.whatsapp.net',
    name: 'Budi Pratama (PT Sinar Maju)',
    phone: '+62 812-9876-5432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    tags: ['Hot Prospect', 'VIP', 'Enterprise'],
    pipelineStage: 'penawaran',
    dealValue: 750000,
    notes: 'Tertarik pasang untuk 3 CS kantor. Sudah minta proposal resmi, minta dihubungi Senin jam 10 pagi.',
    email: 'budi.pratama@sinarmaju.co.id',
    address: 'Kuningan, Jakarta Selatan',
    unreadCount: 0,
    lastMessage: 'Halo kak, apakah AI bot ini bisa jalan terus 24 jam dengan UptimeRobot?',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 15,
    aiAutoReplyEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 15
  },
  {
    id: 'c-2',
    jid: '6285712348899@s.whatsapp.net',
    name: 'Dewi Lestari (Fashion Store)',
    phone: '+62 857-1234-8899',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    tags: ['Pelanggan', 'Fashion'],
    pipelineStage: 'closing_won',
    dealValue: 350000,
    notes: 'Sudah bayar via Transfer BCA Paket Pro CRM. Sangat puas dengan respons bot otomatis.',
    email: 'dewilestari@boutique.id',
    address: 'Bandung Kota',
    unreadCount: 0,
    lastMessage: 'Terima kasih min, AI nya sudah aktif balas chat customer toko saya otomatis!',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 2,
    aiAutoReplyEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'c-3',
    jid: '6287811223344@s.whatsapp.net',
    name: 'Rian Kurniawan',
    phone: '+62 878-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    tags: ['Lead Baru'],
    pipelineStage: 'lead_baru',
    dealValue: 150000,
    notes: 'Tanya info perbedaan nomor biasa dan fitur bisnis.',
    email: 'rian.k@gmail.com',
    unreadCount: 1,
    lastMessage: 'Permisi mau tanya, nomor WA biasa saya apa benar bisa otomatis punya fitur bisnis ini?',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 5,
    aiAutoReplyEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 5
  }
];

const defaultMessages: ChatMessage[] = [
  {
    id: 'm-1',
    jid: '6281298765432@s.whatsapp.net',
    fromMe: false,
    senderName: 'Budi Pratama',
    text: 'Halo kak, apakah AI bot ini bisa jalan terus 24 jam dengan UptimeRobot?',
    timestamp: Date.now() - 1000 * 60 * 15,
    status: 'read'
  },
  {
    id: 'm-2',
    jid: '6281298765432@s.whatsapp.net',
    fromMe: true,
    senderName: 'Siti AI CS',
    text: 'Halo Pak Budi! Tentu saja bisa banget 😊. WhatsPro sudah dilengkapi link cron khusus (/api/cron/keepalive). Cukup masukkan link tersebut ke UptimeRobot dengan interval 5 menit, server akan selalu aktif 24/7 dan WhatsApp tidak akan putus atau idle!',
    timestamp: Date.now() - 1000 * 60 * 14,
    status: 'delivered',
    isAiGenerated: true
  },
  {
    id: 'm-3',
    jid: '6287811223344@s.whatsapp.net',
    fromMe: false,
    senderName: 'Rian Kurniawan',
    text: 'Permisi mau tanya, nomor WA biasa saya apa benar bisa otomatis punya fitur bisnis ini?',
    timestamp: Date.now() - 1000 * 60 * 5,
    status: 'delivered'
  },
  {
    id: 'm-4',
    jid: '6287811223344@s.whatsapp.net',
    fromMe: true,
    senderName: 'Siti AI CS',
    text: 'Halo Mas Rian! Benar sekali 👍. Anda tidak perlu mengganti nomor menjadi akun WhatsApp Business resmi. Cukup scan QR Code 1x dengan WhatsApp pribadi Anda, sistem WhatsPro langsung mengubahnya memiliki fitur CRM, AI Auto-Reply cerdas, dan katalog bisnis premium!',
    timestamp: Date.now() - 1000 * 60 * 4,
    status: 'delivered',
    isAiGenerated: true
  }
];

class StorageService {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
          contacts: parsed.contacts?.length ? parsed.contacts : defaultContacts,
          messages: parsed.messages?.length ? parsed.messages : defaultMessages,
          products: parsed.products?.length ? parsed.products : defaultProducts,
          quickReplies: parsed.quickReplies?.length ? parsed.quickReplies : defaultQuickReplies,
          broadcasts: parsed.broadcasts || [],
          pingLogs: parsed.pingLogs || [],
          serverStartTime: parsed.serverStartTime || Date.now()
        };
      }
    } catch (err) {
      console.error('Error loading CRM store, falling back to defaults:', err);
    }

    const initial: StoreData = {
      settings: defaultSettings,
      contacts: defaultContacts,
      messages: defaultMessages,
      products: defaultProducts,
      quickReplies: defaultQuickReplies,
      broadcasts: [],
      pingLogs: [],
      serverStartTime: Date.now()
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to CRM store:', err);
    }
  }

  // Settings
  getSettings(): BusinessSettings {
    return this.data.settings;
  }

  updateSettings(newSettings: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  // Contacts
  getContacts(): Contact[] {
    return this.data.contacts;
  }

  getContactByJid(jid: string): Contact | undefined {
    return this.data.contacts.find(c => c.jid === jid);
  }

  saveContact(contact: Contact): Contact {
    const idx = this.data.contacts.findIndex(c => c.id === contact.id || c.jid === contact.jid);
    if (idx >= 0) {
      this.data.contacts[idx] = { ...this.data.contacts[idx], ...contact, updatedAt: Date.now() };
    } else {
      this.data.contacts.unshift({ ...contact, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveData();
    return idx >= 0 ? this.data.contacts[idx] : this.data.contacts[0];
  }

  deleteContact(id: string): boolean {
    const initialLen = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    if (this.data.contacts.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Messages
  getMessages(jid?: string): ChatMessage[] {
    if (!jid) return this.data.messages;
    return this.data.messages.filter(m => m.jid === jid);
  }

  addMessage(msg: ChatMessage): ChatMessage {
    this.data.messages.push(msg);

    // Update contact's lastMessage and timestamp
    const contact = this.data.contacts.find(c => c.jid === msg.jid);
    if (contact) {
      contact.lastMessage = msg.text;
      contact.lastMessageTimestamp = msg.timestamp;
      if (!msg.fromMe) {
        contact.unreadCount = (contact.unreadCount || 0) + 1;
      }
      contact.updatedAt = Date.now();
    } else {
      // Auto-create contact from incoming message!
      const phoneDigits = msg.jid.replace('@s.whatsapp.net', '');
      this.data.contacts.unshift({
        id: 'c-' + Date.now(),
        jid: msg.jid,
        name: msg.senderName || `+${phoneDigits}`,
        phone: `+${phoneDigits}`,
        tags: ['Lead Baru'],
        pipelineStage: 'lead_baru',
        dealValue: 0,
        notes: 'Kontak baru masuk otomatis dari WhatsApp.',
        unreadCount: msg.fromMe ? 0 : 1,
        lastMessage: msg.text,
        lastMessageTimestamp: msg.timestamp,
        aiAutoReplyEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    this.saveData();
    return msg;
  }

  markMessagesRead(jid: string) {
    const contact = this.data.contacts.find(c => c.jid === jid);
    if (contact) {
      contact.unreadCount = 0;
      this.saveData();
    }
  }

  // Products
  getProducts(): ProductItem[] {
    return this.data.products;
  }

  saveProduct(prod: ProductItem): ProductItem {
    const idx = this.data.products.findIndex(p => p.id === prod.id);
    if (idx >= 0) {
      this.data.products[idx] = prod;
    } else {
      this.data.products.push(prod);
    }
    this.saveData();
    return prod;
  }

  deleteProduct(id: string): boolean {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveData();
    return true;
  }

  // Quick Replies
  getQuickReplies(): QuickReply[] {
    return this.data.quickReplies;
  }

  saveQuickReply(qr: QuickReply): QuickReply {
    const idx = this.data.quickReplies.findIndex(q => q.id === qr.id);
    if (idx >= 0) {
      this.data.quickReplies[idx] = qr;
    } else {
      this.data.quickReplies.push(qr);
    }
    this.saveData();
    return qr;
  }

  deleteQuickReply(id: string): boolean {
    this.data.quickReplies = this.data.quickReplies.filter(q => q.id !== id);
    this.saveData();
    return true;
  }

  // Broadcasts
  getBroadcasts(): BroadcastCampaign[] {
    return this.data.broadcasts;
  }

  addBroadcast(b: BroadcastCampaign): BroadcastCampaign {
    this.data.broadcasts.unshift(b);
    this.saveData();
    return b;
  }

  updateBroadcast(id: string, updates: Partial<BroadcastCampaign>) {
    const idx = this.data.broadcasts.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.data.broadcasts[idx] = { ...this.data.broadcasts[idx], ...updates };
      this.saveData();
    }
  }

  // Uptime Ping Logs
  recordPing(ip: string, userAgent: string, responseTimeMs: number): PingLog {
    const log: PingLog = {
      id: 'ping-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ip: ip || 'unknown',
      userAgent: userAgent || 'UptimeRobot/2.0',
      status: '200 OK',
      responseTimeMs
    };
    this.data.pingLogs.unshift(log);
    // Keep last 100 ping logs
    if (this.data.pingLogs.length > 100) {
      this.data.pingLogs = this.data.pingLogs.slice(0, 100);
    }
    this.saveData();
    return log;
  }

  getPingLogs(): PingLog[] {
    return this.data.pingLogs;
  }

  getServerStats() {
    const uptimeSec = Math.floor((Date.now() - this.data.serverStartTime) / 1000);
    const totalPings = this.data.pingLogs.length;
    const lastPing = this.data.pingLogs[0] || null;
    const totalMessages = this.data.messages.length;
    const aiMessages = this.data.messages.filter(m => m.isAiGenerated).length;
    const totalDeals = this.data.contacts.reduce((acc, c) => acc + (c.dealValue || 0), 0);
    const wonDeals = this.data.contacts
      .filter(c => c.pipelineStage === 'closing_won')
      .reduce((acc, c) => acc + (c.dealValue || 0), 0);

    return {
      uptimeSec,
      totalPings,
      lastPing,
      totalContacts: this.data.contacts.length,
      totalMessages,
      aiMessages,
      totalDeals,
      wonDeals
    };
  }
}

export const storage = new StorageService();
