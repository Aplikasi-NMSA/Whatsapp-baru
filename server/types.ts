export interface Contact {
  id: string;
  jid: string; // e.g., 628123456789@s.whatsapp.net
  name: string;
  phone: string;
  avatar?: string;
  tags: string[]; // e.g., ['Lead Baru', 'VIP', 'Follow Up']
  pipelineStage: 'lead_baru' | 'dihubungi' | 'penawaran' | 'negosiasi' | 'closing_won' | 'closing_lost';
  dealValue: number; // in IDR
  notes: string;
  email?: string;
  address?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  aiAutoReplyEnabled: boolean; // can be paused per-contact
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  jid: string;
  fromMe: boolean;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  isAiGenerated?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  stockStatus: 'in_stock' | 'pre_order' | 'out_of_stock';
}

export interface QuickReply {
  id: string;
  shortcut: string; // e.g. "/halo", "/harga"
  title: string;
  content: string;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  messageTemplate: string;
  targetTag?: string;
  targetStage?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'draft' | 'sending' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  category: string;
  description: string;
  operatingHours: string;
  isAwayNow: boolean;
  address: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;

  // AI Chatbot Settings
  aiEnabled: boolean;
  aiPersona: 'cs_friendly' | 'sales_closer' | 'tech_support' | 'business_consultant' | 'custom';
  aiPersonaCustomName: string;
  aiSystemPrompt: string;
  aiKnowledgeBase: string;
  aiResponseDelaySec: number;
  aiHumanTakeoverMinutes: number; // auto-pause AI if agent messages contact
  
  // Anti-Spam & Delivery Protection
  antiSpamEnabled: boolean;
  antiSpamMinDelaySec: number;
  antiSpamMaxDelaySec: number;
  antiSpamHumanTyping: boolean;
  antiSpamCooldownSec: number;
  antiSpamReplyGroups: boolean;
  antiSpamMaxPerMinute: number;
  antiSpamIgnoredNumbers: string;

  // Automated business messages
  greetingEnabled: boolean;
  greetingMessage: string;
  awayMessageEnabled: boolean;
  awayMessage: string;
}

export interface PingLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: string;
  responseTimeMs: number;
}

export interface WhatsAppConnectionStatus {
  state: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  qrCodeUrl: string | null;
  pairingCode: string | null;
  connectedNumber: string | null;
  connectedName: string | null;
  lastConnectedAt: string | null;
  batteryLevel?: number;
  platform?: string;
  error?: string | null;
}
