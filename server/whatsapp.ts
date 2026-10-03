import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  WASocket,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { generateAiChatResponse } from './gemini';
import { WhatsAppConnectionStatus, ChatMessage } from './types';

const AUTH_DIR = path.resolve(process.cwd(), 'wa_auth');

export class WhatsAppService {
  private sock: WASocket | null = null;
  private status: WhatsAppConnectionStatus = {
    state: 'disconnected',
    qrCodeUrl: null,
    pairingCode: null,
    connectedNumber: null,
    connectedName: null,
    lastConnectedAt: null,
    error: null
  };
  private wsBroadcaster: ((event: string, data: any) => void) | null = null;
  private isInitializing = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 12;
  private reconnectTimer: NodeJS.Timeout | null = null;

  // Anti-Spam state tracking
  private lastReplyTimestamp = new Map<string, number>();
  private repliesThisMinute = 0;
  private minuteWindowStart = Date.now();

  constructor() {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
  }

  public setBroadcaster(broadcaster: (event: string, data: any) => void) {
    this.wsBroadcaster = broadcaster;
  }

  private broadcast(event: string, data: any) {
    if (this.wsBroadcaster) {
      this.wsBroadcaster(event, data);
    }
  }

  public getStatus(): WhatsAppConnectionStatus {
    return { ...this.status };
  }

  public async initWhatsApp(forceReset = false): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    if (forceReset) {
      this.clearAuthFolder();
    }

    try {
      this.status.state = 'connecting';
      this.status.error = null;
      this.broadcast('status_update', this.status);

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      let version: [number, number, number] = [2, 3000, 1015901307];
      try {
        const versionInfo = await fetchLatestBaileysVersion();
        version = versionInfo.version;
      } catch {
        // fallback to standard version
      }

      const logger = pino({ level: 'silent' });

      // Use Browsers.ubuntu('Chrome') for recognized desktop multi-device signature
      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        generateHighQualityLinkPreview: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, {
              width: 400,
              margin: 1,
              errorCorrectionLevel: 'M',
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            });
            this.status.qrCodeUrl = qrDataUrl;
            this.status.state = 'qr_ready';
            this.broadcast('status_update', this.status);
            this.broadcast('qr_received', { qrUrl: qrDataUrl, rawQr: qr });
          } catch (err) {
            console.error('Failed to generate QR Code Data URL:', err);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log(`WhatsApp connection closed. Status code: ${statusCode}, Reconnect: ${shouldReconnect}`);

          if (statusCode === DisconnectReason.loggedOut) {
            this.status = {
              state: 'disconnected',
              qrCodeUrl: null,
              pairingCode: null,
              connectedNumber: null,
              connectedName: null,
              lastConnectedAt: null,
              error: 'Sesi telah keluar dari perangkat WhatsApp. Silakan scan ulang.'
            };
            this.clearAuthFolder();
            this.broadcast('status_update', this.status);
          } else if (shouldReconnect) {
            this.status.state = 'connecting';
            this.status.error = 'Koneksi terputus sementara. Menghubungkan kembali...';
            this.broadcast('status_update', this.status);

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              const delay = Math.min(3000 * Math.pow(1.4, this.reconnectAttempts), 20000);
              this.reconnectAttempts++;
              if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
              this.reconnectTimer = setTimeout(() => {
                this.isInitializing = false;
                this.initWhatsApp();
              }, delay);
            }
          }
        } else if (connection === 'open') {
          console.log('WhatsApp connection opened successfully!');
          this.reconnectAttempts = 0;
          const userJid = this.sock?.user?.id || '';
          const phone = userJid.split(':')[0].split('@')[0];
          const name = this.sock?.user?.name || `WhatsApp (+${phone})`;

          this.status = {
            state: 'connected',
            qrCodeUrl: null,
            pairingCode: null,
            connectedNumber: `+${phone}`,
            connectedName: name,
            lastConnectedAt: new Date().toISOString(),
            platform: 'Multi-Device Web',
            error: null
          };
          this.broadcast('status_update', this.status);
          this.broadcast('ready', this.status);
        }
      });

      // Sync contacts from WhatsApp
      this.sock.ev.on('contacts.upsert', (newContacts) => {
        for (const c of newContacts) {
          if (!c.id || c.id.endsWith('@broadcast')) continue;
          const phoneDigits = c.id.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
          if (!phoneDigits) continue;

          storage.saveContact({
            id: 'c-' + phoneDigits,
            jid: c.id,
            name: c.name || c.notify || `+${phoneDigits}`,
            phone: `+${phoneDigits}`,
            tags: ['WhatsApp Sync'],
            pipelineStage: 'lead_baru',
            dealValue: 0,
            notes: 'Disinkronkan otomatis dari kontak WhatsApp.',
            unreadCount: 0,
            aiAutoReplyEnabled: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }
      });

      // Handle incoming messages
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          await this.handleIncomingMessage(msg);
        }
      });

    } catch (err: any) {
      console.error('Error in WhatsApp service initialization:', err);
      this.status.state = 'disconnected';
      this.status.error = err?.message || 'Gagal memulai koneksi WhatsApp';
      this.broadcast('status_update', this.status);
    } finally {
      this.isInitializing = false;
    }
  }

  public async requestPairingCode(phoneNumber: string): Promise<string> {
    // Normalize phone number to country code format without leading zero or plus
    let cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '62' + cleanedPhone.slice(1);
    } else if (cleanedPhone.startsWith('8')) {
      cleanedPhone = '62' + cleanedPhone;
    }

    if (!cleanedPhone || cleanedPhone.length < 8) {
      throw new Error('Nomor WhatsApp tidak valid. Masukkan minimal 8 digit nomor HP aktif.');
    }

    if (!this.sock) {
      await this.initWhatsApp();
    }

    // Wait 2s for WebSocket Noise handshake to complete with WhatsApp server
    await new Promise((r) => setTimeout(r, 2000));

    if (!this.sock) {
      throw new Error('WhatsApp socket belum siap. Silakan ulangi sesaat lagi.');
    }

    try {
      const code = await this.sock.requestPairingCode(cleanedPhone);
      const formattedCode = code && code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : (code || '');
      this.status.pairingCode = formattedCode;
      this.broadcast('status_update', this.status);
      this.broadcast('pairing_code', { code: formattedCode, rawCode: code });
      return formattedCode;
    } catch (err: any) {
      console.error('Failed to request pairing code:', err);
      // Re-initialize freshly if handshake was rejected
      await this.initWhatsApp(true);
      throw new Error(err?.message || 'Gagal meminta kode penautan. Periksa apakah nomor HP sudah benar.');
    }
  }

  private async handleIncomingMessage(msg: proto.IWebMessageInfo) {
    if (!msg.key || !msg.message) return;

    const jid = msg.key.remoteJid;
    if (!jid || jid.endsWith('@broadcast')) {
      return;
    }
    const safeJid: string = jid;

    const fromMe = Boolean(msg.key.fromMe);
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      '';

    if (!text.trim()) return;

    const isGroup = safeJid.endsWith('@g.us');
    const senderName = msg.pushName || (fromMe ? 'Saya' : safeJid.replace('@s.whatsapp.net', ''));
    const timestamp = Number(msg.messageTimestamp) ? Number(msg.messageTimestamp) * 1000 : Date.now();

    const chatMsg: ChatMessage = {
      id: msg.key.id || 'msg-' + Date.now(),
      jid: safeJid,
      fromMe,
      senderName,
      text,
      timestamp,
      status: fromMe ? 'sent' : 'delivered',
      isAiGenerated: false
    };

    // Save to CRM store
    storage.addMessage(chatMsg);
    this.broadcast('new_message', chatMsg);

    // AI Auto-Responder with Anti-Spam protection
    if (!fromMe) {
      const settings = storage.getSettings();

      // Check if global AI is on
      if (!settings.aiEnabled) return;

      // Check group reply setting
      if (isGroup && !settings.antiSpamReplyGroups) {
        return;
      }

      // Check blacklisted / ignored numbers
      if (settings.antiSpamIgnoredNumbers) {
        const ignored = settings.antiSpamIgnoredNumbers
          .split(',')
          .map(s => s.trim().replace(/[^0-9]/g, ''))
          .filter(Boolean);
        const senderDigits = safeJid.replace(/[^0-9]/g, '');
        if (ignored.some(ig => senderDigits.includes(ig))) {
          return;
        }
      }

      // Check contact-specific toggle
      const contact = storage.getContactByJid(safeJid);
      const isContactAllowed = contact ? contact.aiAutoReplyEnabled : true;
      if (!isContactAllowed) return;

      // Rate limit check: Max replies per minute
      const now = Date.now();
      if (now - this.minuteWindowStart > 60000) {
        this.minuteWindowStart = now;
        this.repliesThisMinute = 0;
      }
      if (this.repliesThisMinute >= (settings.antiSpamMaxPerMinute || 15)) {
        console.log('Anti-Spam: Batas pengiriman per menit tercapai. Menunda auto-reply...');
        return;
      }

      // Cooldown check per sender JID
      const lastReply = this.lastReplyTimestamp.get(safeJid) || 0;
      const cooldownMs = (settings.antiSpamCooldownSec || 5) * 1000;
      if (now - lastReply < cooldownMs) {
        console.log(`Anti-Spam: Kontak ${safeJid} masih dalam masa jeda cooldown (${settings.antiSpamCooldownSec}s).`);
        return;
      }

      // Asynchronous AI Auto-Responder execution
      setTimeout(async () => {
        try {
          // Calculate realistic randomized human delay
          const minSec = settings.antiSpamMinDelaySec || 3;
          const maxSec = Math.max(minSec, settings.antiSpamMaxDelaySec || 7);
          const randomizedDelayMs = Math.floor((minSec + Math.random() * (maxSec - minSec)) * 1000);

          // Get Gemini AI context & answer
          const recentHistory = storage.getMessages(safeJid);
          const aiReply = await generateAiChatResponse(text, senderName, safeJid, recentHistory);

          if (!aiReply) return;

          // Simulate human typing presence based on message length
          if (settings.antiSpamHumanTyping && this.sock) {
            await this.sock.sendPresenceUpdate('composing', safeJid);
            // Simulate 25ms per character typing duration
            const typingDurationMs = Math.min(6000, Math.max(2000, aiReply.length * 25));
            await new Promise(r => setTimeout(r, typingDurationMs));
          } else {
            await new Promise(r => setTimeout(r, randomizedDelayMs));
          }

          // Send reply via WhatsApp socket
          if (this.sock && this.status.state === 'connected') {
            const sentResult = await this.sock.sendMessage(safeJid, { text: aiReply });
            if (this.sock) {
              await this.sock.sendPresenceUpdate('available', safeJid);
            }

            this.lastReplyTimestamp.set(safeJid, Date.now());
            this.repliesThisMinute++;

            const aiChatMsg: ChatMessage = {
              id: sentResult?.key?.id || 'ai-' + Date.now(),
              jid: safeJid,
              fromMe: true,
              senderName: settings.aiPersonaCustomName || 'WhatsPro AI CS',
              text: aiReply,
              timestamp: Date.now(),
              status: 'delivered',
              isAiGenerated: true
            };

            storage.addMessage(aiChatMsg);
            this.broadcast('new_message', aiChatMsg);
          }
        } catch (aiErr) {
          console.error('Error in WhatsApp AI auto-responder:', aiErr);
        }
      }, 300);
    }
  }

  public async sendMessage(toJid: string, text: string): Promise<ChatMessage> {
    let jid = toJid;
    if (!jid.includes('@')) {
      const digits = jid.replace(/[^0-9]/g, '');
      const formatted = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
      jid = `${formatted}@s.whatsapp.net`;
    }

    const chatMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      jid,
      fromMe: true,
      senderName: 'Saya (Admin)',
      text,
      timestamp: Date.now(),
      status: 'pending',
      isAiGenerated: false
    };

    if (this.sock && this.status.state === 'connected') {
      try {
        const sent = await this.sock.sendMessage(jid, { text });
        if (sent?.key?.id) {
          chatMsg.id = sent.key.id;
          chatMsg.status = 'sent';
        }
      } catch (err: any) {
        console.error('Failed to send WhatsApp message via socket:', err);
        chatMsg.status = 'failed';
      }
    } else {
      chatMsg.status = 'sent';
    }

    storage.addMessage(chatMsg);
    this.broadcast('new_message', chatMsg);
    return chatMsg;
  }

  public async pingSocket(): Promise<boolean> {
    if (this.sock && this.status.state === 'connected') {
      try {
        await this.sock.sendPresenceUpdate('available');
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  public async logout(): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch {}
      this.sock = null;
    }
    this.clearAuthFolder();
    this.status = {
      state: 'disconnected',
      qrCodeUrl: null,
      pairingCode: null,
      connectedNumber: null,
      connectedName: null,
      lastConnectedAt: null,
      error: null
    };
    this.broadcast('status_update', this.status);
  }

  public clearAuthFolder() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to clear auth folder:', err);
    }
  }
}

export const whatsappService = new WhatsAppService();
