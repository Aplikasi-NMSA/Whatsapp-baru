import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { storage } from './server/storage';
import { whatsappService } from './server/whatsapp';
import { generateAiChatResponse } from './server/gemini';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup Socket.io Server for Real-Time WhatsApp Events
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.emit('status', whatsappService.getStatus());
  socket.emit('init', {
    whatsappStatus: whatsappService.getStatus(),
    stats: storage.getServerStats()
  });

  socket.on('request_qr', async () => {
    await whatsappService.initWhatsApp();
  });
});

// Setup Raw WebSocket Server for Compatibility
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  wsClients.add(ws);

  // Send initial state on connect
  ws.send(JSON.stringify({
    type: 'init',
    whatsappStatus: whatsappService.getStatus(),
    stats: storage.getServerStats()
  }));

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

function broadcastWs(type: string, data: any) {
  // Broadcast via Socket.io
  io.emit(type, data);
  if (type === 'status_update') {
    io.emit('status', data);
  } else if (type === 'qr_received') {
    io.emit('qr', data);
  }

  // Broadcast via raw WebSocket
  const payload = JSON.stringify({ type, data });
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

whatsappService.setBroadcaster(broadcastWs);

// ==========================================
// 1. LINK CRON & UPTIMEROBOT 24/7 KEEP-ALIVE
// ==========================================

// Endpoint specifically formatted for UptimeRobot, cron-job.org, or curl
app.get('/api/cron/keepalive', async (req, res) => {
  const startTime = Date.now();
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'UptimeRobot/2.0';

  // Ping WhatsApp socket to ensure connection stays active
  const isSocketAlive = await whatsappService.pingSocket();
  const responseTimeMs = Date.now() - startTime;

  // Record ping log
  const log = storage.recordPing(clientIp, userAgent, responseTimeMs);
  broadcastWs('cron_ping', log);

  const waStatus = whatsappService.getStatus();
  const stats = storage.getServerStats();

  return res.status(200).json({
    status: 'online',
    service: 'WhatsPro AI CRM Keep-Alive Daemon',
    timestamp: new Date().toISOString(),
    uptimeSeconds: stats.uptimeSec,
    totalPingsReceived: stats.totalPings,
    lastPing: log,
    whatsapp: {
      state: waStatus.state,
      connectedNumber: waStatus.connectedNumber,
      connectedName: waStatus.connectedName,
      socketAlive: isSocketAlive,
      persistentSession: true
    },
    cronInstructions: {
      recommendedService: 'UptimeRobot (https://uptimerobot.com)',
      monitorType: 'HTTP(s)',
      monitoringInterval: '5 minutes',
      notes: 'Link ini mencegah server cloud tidur/scale-to-zero dan menjaga koneksi WhatsApp selalu siaga 24 jam.'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSec: storage.getServerStats().uptimeSec
  });
});

app.get('/api/cron/logs', (req, res) => {
  const logs = storage.getPingLogs();
  const stats = storage.getServerStats();
  res.json({ logs, stats });
});

// ==========================================
// 2. WHATSAPP CONNECTION & PAIRING
// ==========================================

app.get('/api/whatsapp/status', (req, res) => {
  res.json(whatsappService.getStatus());
});

app.post('/api/whatsapp/connect', async (req, res) => {
  try {
    await whatsappService.initWhatsApp();
    res.json({ success: true, status: whatsappService.getStatus() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/whatsapp/reset', async (req, res) => {
  try {
    await whatsappService.initWhatsApp(true);
    res.json({ success: true, status: whatsappService.getStatus() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    await whatsappService.logout(true);
    res.json({ success: true, status: whatsappService.getStatus() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/whatsapp/pair', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Nomor WhatsApp wajib diisi' });
  }

  try {
    const code = await whatsappService.requestPairingCode(phoneNumber);
    res.json({ success: true, pairingCode: code });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Gagal meminta kode penautan' });
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  const { jid, text } = req.body;
  if (!jid || !text) {
    return res.status(400).json({ error: 'JID dan pesan wajib diisi' });
  }

  try {
    const msg = await whatsappService.sendMessage(jid, text);
    res.json({ success: true, message: msg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    await whatsappService.logout();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 3. CRM CONTACTS & PIPELINE
// ==========================================

app.get('/api/crm/contacts', (req, res) => {
  const contacts = storage.getContacts();
  res.json(contacts);
});

app.post('/api/crm/contacts', (req, res) => {
  const contact = req.body;
  if (!contact.phone || !contact.name) {
    return res.status(400).json({ error: 'Nama dan nomor telepon wajib diisi' });
  }

  const phoneDigits = contact.phone.replace(/[^0-9]/g, '');
  const formattedJid = contact.jid || `${phoneDigits.startsWith('0') ? '62' + phoneDigits.slice(1) : phoneDigits}@s.whatsapp.net`;

  const newContact = storage.saveContact({
    id: contact.id || 'c-' + Date.now(),
    jid: formattedJid,
    name: contact.name,
    phone: contact.phone,
    avatar: contact.avatar || undefined,
    tags: contact.tags || ['Lead Baru'],
    pipelineStage: contact.pipelineStage || 'lead_baru',
    dealValue: Number(contact.dealValue) || 0,
    notes: contact.notes || '',
    email: contact.email || '',
    address: contact.address || '',
    unreadCount: 0,
    aiAutoReplyEnabled: contact.aiAutoReplyEnabled !== false,
    createdAt: contact.createdAt || Date.now(),
    updatedAt: Date.now()
  });

  broadcastWs('contact_updated', newContact);
  res.json(newContact);
});

app.delete('/api/crm/contacts/:id', (req, res) => {
  const success = storage.deleteContact(req.params.id);
  if (success) {
    broadcastWs('contact_deleted', { id: req.params.id });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kontak tidak ditemukan' });
  }
});

app.post('/api/crm/contacts/import', (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Daftar kontak harus berupa array' });
  }

  let count = 0;
  for (const c of contacts) {
    if (c.name && c.phone) {
      const phoneDigits = c.phone.replace(/[^0-9]/g, '');
      const jid = `${phoneDigits.startsWith('0') ? '62' + phoneDigits.slice(1) : phoneDigits}@s.whatsapp.net`;
      storage.saveContact({
        id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        jid,
        name: c.name,
        phone: c.phone,
        tags: c.tags || ['Import'],
        pipelineStage: c.pipelineStage || 'lead_baru',
        dealValue: Number(c.dealValue) || 0,
        notes: c.notes || 'Diimpor secara massal.',
        email: c.email || '',
        unreadCount: 0,
        aiAutoReplyEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      count++;
    }
  }

  res.json({ success: true, importedCount: count });
});

// ==========================================
// 4. CHAT MESSAGES
// ==========================================

app.get('/api/crm/messages', (req, res) => {
  const jid = req.query.jid as string | undefined;
  const messages = storage.getMessages(jid);
  res.json(messages);
});

app.post('/api/crm/messages/:jid/read', (req, res) => {
  storage.markMessagesRead(req.params.jid);
  broadcastWs('messages_read', { jid: req.params.jid });
  res.json({ success: true });
});

// ==========================================
// 5. PRODUCTS CATALOG & QUICK REPLIES
// ==========================================

app.get('/api/crm/products', (req, res) => {
  res.json(storage.getProducts());
});

app.post('/api/crm/products', (req, res) => {
  const prod = req.body;
  const saved = storage.saveProduct({
    id: prod.id || 'prod-' + Date.now(),
    name: prod.name,
    sku: prod.sku || 'SKU-' + Date.now().toString().slice(-4),
    price: Number(prod.price) || 0,
    description: prod.description || '',
    category: prod.category || 'Umum',
    imageUrl: prod.imageUrl || '',
    stockStatus: prod.stockStatus || 'in_stock'
  });
  res.json(saved);
});

app.delete('/api/crm/products/:id', (req, res) => {
  const ok = storage.deleteProduct(req.params.id);
  res.json({ success: ok });
});

app.get('/api/crm/quick-replies', (req, res) => {
  res.json(storage.getQuickReplies());
});

app.post('/api/crm/quick-replies', (req, res) => {
  const qr = req.body;
  const saved = storage.saveQuickReply({
    id: qr.id || 'qr-' + Date.now(),
    shortcut: qr.shortcut.startsWith('/') ? qr.shortcut : '/' + qr.shortcut,
    title: qr.title,
    content: qr.content
  });
  res.json(saved);
});

app.delete('/api/crm/quick-replies/:id', (req, res) => {
  const ok = storage.deleteQuickReply(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 6. BUSINESS SETTINGS & AI SIMULATOR
// ==========================================

app.get('/api/crm/settings', (req, res) => {
  res.json(storage.getSettings());
});

app.post('/api/crm/settings', (req, res) => {
  const updated = storage.updateSettings(req.body);
  broadcastWs('settings_updated', updated);
  res.json(updated);
});

app.post('/api/ai/test', async (req, res) => {
  const { prompt, senderName } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt pertanyaan wajib diisi' });
  }

  try {
    const aiResponse = await generateAiChatResponse(
      prompt,
      senderName || 'Calon Pelanggan',
      'test@s.whatsapp.net',
      []
    );
    res.json({ success: true, response: aiResponse });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 7. BROADCAST ENGINE
// ==========================================

app.get('/api/crm/broadcasts', (req, res) => {
  res.json(storage.getBroadcasts());
});

app.post('/api/crm/broadcasts', async (req, res) => {
  const { title, messageTemplate, targetTag, targetStage } = req.body;
  if (!title || !messageTemplate) {
    return res.status(400).json({ error: 'Judul dan template pesan wajib diisi' });
  }

  let recipients = storage.getContacts();
  if (targetTag && targetTag !== 'all') {
    recipients = recipients.filter(c => c.tags.includes(targetTag));
  }
  if (targetStage && targetStage !== 'all') {
    recipients = recipients.filter(c => c.pipelineStage === targetStage);
  }

  const campaign = storage.addBroadcast({
    id: 'bc-' + Date.now(),
    title,
    messageTemplate,
    targetTag,
    targetStage,
    totalRecipients: recipients.length,
    sentCount: 0,
    failedCount: 0,
    status: 'sending',
    createdAt: Date.now()
  });

  res.json(campaign);

  // Background broadcast sender with human-like delays to prevent spam bans
  (async () => {
    let sent = 0;
    let failed = 0;
    const settings = storage.getSettings();

    for (const contact of recipients) {
      try {
        const text = messageTemplate
          .replace(/{nama}/g, contact.name)
          .replace(/{nomor}/g, contact.phone)
          .replace(/{bisnis}/g, settings.businessName);

        await whatsappService.sendMessage(contact.jid, text);
        sent++;
        storage.updateBroadcast(campaign.id, { sentCount: sent });
        broadcastWs('broadcast_progress', { id: campaign.id, sentCount: sent, total: recipients.length });

        // Safe delay 3-5s between messages
        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        failed++;
        storage.updateBroadcast(campaign.id, { failedCount: failed });
      }
    }

    storage.updateBroadcast(campaign.id, { status: 'completed' });
    broadcastWs('broadcast_completed', { id: campaign.id, sent, failed });
  })();
});

// ==========================================
// 8. STATS OVERVIEW
// ==========================================

app.get('/api/crm/stats', (req, res) => {
  res.json(storage.getServerStats());
});

// ==========================================
// 9. VITE INTEGRATION & STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[WhatsPro AI CRM] Server active on port ${PORT}`);
    console.log(`[Keep-Alive Endpoint] GET http://localhost:${PORT}/api/cron/keepalive`);

    // Auto-initialize WhatsApp connection so stored multi-device session restores seamlessly!
    whatsappService.initWhatsApp().catch(err => {
      console.warn('Initial WhatsApp auto-connect note:', err?.message);
    });
  });
}

startServer();
