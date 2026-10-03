import {
  Contact,
  ChatMessage,
  ProductItem,
  QuickReply,
  BroadcastCampaign,
  BusinessSettings,
  WhatsAppConnectionStatus,
  ServerStats,
  PingLog
} from '../types';

export const api = {
  // WhatsApp Status & Connection
  async getWhatsAppStatus(): Promise<WhatsAppConnectionStatus> {
    const res = await fetch('/api/whatsapp/status');
    return res.json();
  },

  async connectWhatsApp(): Promise<{ success: boolean; status: WhatsAppConnectionStatus }> {
    const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
    return res.json();
  },

  async resetWhatsApp(): Promise<{ success: boolean; status: WhatsAppConnectionStatus }> {
    const res = await fetch('/api/whatsapp/reset', { method: 'POST' });
    return res.json();
  },

  async requestPairingCode(phoneNumber: string): Promise<{ success: boolean; pairingCode: string }> {
    const res = await fetch('/api/whatsapp/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    return res.json();
  },

  async logoutWhatsApp(): Promise<{ success: boolean }> {
    const res = await fetch('/api/whatsapp/logout', { method: 'POST' });
    return res.json();
  },

  async sendWhatsAppMessage(jid: string, text: string): Promise<{ success: boolean; message: ChatMessage }> {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jid, text })
    });
    return res.json();
  },

  // CRM Contacts
  async getContacts(): Promise<Contact[]> {
    const res = await fetch('/api/crm/contacts');
    return res.json();
  },

  async saveContact(contact: Partial<Contact>): Promise<Contact> {
    const res = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    return res.json();
  },

  async deleteContact(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async importContacts(contacts: Partial<Contact>[]): Promise<{ success: boolean; importedCount: number }> {
    const res = await fetch('/api/crm/contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts })
    });
    return res.json();
  },

  // Messages
  async getMessages(jid?: string): Promise<ChatMessage[]> {
    const url = jid ? `/api/crm/messages?jid=${encodeURIComponent(jid)}` : '/api/crm/messages';
    const res = await fetch(url);
    return res.json();
  },

  async markAsRead(jid: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/crm/messages/${encodeURIComponent(jid)}/read`, { method: 'POST' });
    return res.json();
  },

  // Products
  async getProducts(): Promise<ProductItem[]> {
    const res = await fetch('/api/crm/products');
    return res.json();
  },

  async saveProduct(product: Partial<ProductItem>): Promise<ProductItem> {
    const res = await fetch('/api/crm/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/crm/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Quick Replies
  async getQuickReplies(): Promise<QuickReply[]> {
    const res = await fetch('/api/crm/quick-replies');
    return res.json();
  },

  async saveQuickReply(qr: Partial<QuickReply>): Promise<QuickReply> {
    const res = await fetch('/api/crm/quick-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qr)
    });
    return res.json();
  },

  async deleteQuickReply(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/crm/quick-replies/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Business Settings
  async getSettings(): Promise<BusinessSettings> {
    const res = await fetch('/api/crm/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const res = await fetch('/api/crm/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // AI Sandbox Test
  async testAiChat(prompt: string, senderName?: string): Promise<{ success: boolean; response: string }> {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, senderName })
    });
    return res.json();
  },

  // Broadcasts
  async getBroadcasts(): Promise<BroadcastCampaign[]> {
    const res = await fetch('/api/crm/broadcasts');
    return res.json();
  },

  async createBroadcast(data: {
    title: string;
    messageTemplate: string;
    targetTag?: string;
    targetStage?: string;
  }): Promise<BroadcastCampaign> {
    const res = await fetch('/api/crm/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Keep-Alive & Cron Logs
  async pingKeepAlive(): Promise<any> {
    const res = await fetch('/api/cron/keepalive');
    return res.json();
  },

  async getCronLogs(): Promise<{ logs: PingLog[]; stats: ServerStats }> {
    const res = await fetch('/api/cron/logs');
    return res.json();
  },

  async getStats(): Promise<ServerStats> {
    const res = await fetch('/api/crm/stats');
    return res.json();
  }
};
