import { GoogleGenAI } from '@google/genai';
import { storage } from './storage';
import { ChatMessage } from './types';

// Initialize Google Gen AI client with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function generateAiChatResponse(
  incomingMessage: string,
  senderName: string,
  jid: string,
  recentHistory: ChatMessage[] = []
): Promise<string> {
  const settings = storage.getSettings();
  const products = storage.getProducts();

  // If business is set to away and away message enabled
  if (settings.isAwayNow && settings.awayMessageEnabled && settings.awayMessage) {
    return settings.awayMessage;
  }

  // Construct Products Catalog Context
  const productCatalogText = products.map((p, i) => {
    return `${i + 1}. ${p.name} (SKU: ${p.sku})
   - Harga: Rp ${p.price.toLocaleString('id-ID')}
   - Status: ${p.stockStatus === 'in_stock' ? 'Ready Stock' : p.stockStatus === 'pre_order' ? 'Pre-Order' : 'Stok Habis'}
   - Deskripsi: ${p.description}`;
  }).join('\n\n');

  // Build persona instructions
  let personaInstruction = '';
  switch (settings.aiPersona) {
    case 'sales_closer':
      personaInstruction = 'Anda adalah Sales Closing Specialist yang persuasif, solutif, percaya diri, dan selalu mengarahkan calon pembeli untuk segera melakukan pemesanan paket/produk dengan sopan.';
      break;
    case 'tech_support':
      personaInstruction = 'Anda adalah Technical Support Specialist yang detail, sabar, ahli menjelaskan langkah demi langkah, dan sangat membantu mengatasi kendala teknis.';
      break;
    case 'business_consultant':
      personaInstruction = 'Anda adalah Konsultan Bisnis Profesional yang analitis, berwawasan luas, berorientasi solusi, dan memberikan saran strategis dengan bahasa formal dan terpercaya.';
      break;
    case 'custom':
      personaInstruction = `Persona Anda: ${settings.aiPersonaCustomName || 'Asisten AI'}.`;
      break;
    case 'cs_friendly':
    default:
      personaInstruction = 'Anda adalah Customer Service yang sangat ramah, hangat, sopan, antusias, solutif, dan cepat tanggap melayani pertanyaan pelanggan.';
      break;
  }

  const systemPrompt = `Anda adalah asisten WhatsApp Business pintar untuk "${settings.businessName}".
${personaInstruction}

PROFIL USAHA:
- Nama Bisnis: ${settings.businessName}
- Tagline: ${settings.tagline}
- Kategori Usaha: ${settings.category}
- Deskripsi: ${settings.description}
- Jam Operasional: ${settings.operatingHours}
- Alamat: ${settings.address}
- Kontak / WA: ${settings.phone} | Email: ${settings.email}
- Website: ${settings.website} | Instagram: ${settings.instagram}

INSTRUKSI KHUSUS DARI PEMILIK BISNIS:
${settings.aiSystemPrompt}

DATA PENGETAHUAN & FAQ BISNIS:
${settings.aiKnowledgeBase}

KATALOG PRODUK TERKINI:
${productCatalogText || 'Belum ada produk spesifik.'}

ATURAN MENJAWAB WHATSAPP:
1. Jawablah langsung kepada pengirim bernama "${senderName}".
2. Gunakan Bahasa Indonesia yang natural, mengalir, ramah, dan manusiawi (tidak kaku seperti robot).
3. Berikan informasi harga, paket, dan detail sesuai katalog di atas. Jika tidak ada di data, sampaikan dengan jujur bahwa admin tim akan segera mengonfirmasi.
4. Jawab secara ringkas, to the point, dan rapi dalam format pesan chat WhatsApp yang nyaman dibaca di layar HP (maksimal 2-4 paragraf singkat).
5. Jangan pernah menyebut bahwa Anda adalah model bahasa buatan pihak ketiga. Anda adalah representasi Customer Service AI dari "${settings.businessName}".`;

  // Format chat history context
  const historySnippet = recentHistory.slice(-6).map(m => {
    return `${m.fromMe ? 'WhatsPro CS' : senderName}: ${m.text}`;
  }).join('\n');

  const userPrompt = `${historySnippet ? `RIWAYAT PERCAKAPAN SEBELUMNYA:\n${historySnippet}\n\n` : ''}PESAN TERBARU DARI PELANGGAN (${senderName}):
"${incomingMessage}"

Balaslah pesan ini sekarang sebagai Customer Service WhatsApp:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    const reply = response.text?.trim();
    if (reply) {
      return reply;
    }
  } catch (err: any) {
    console.error('Gemini API call error:', err?.message || err);
  }

  // Graceful rule-based fallback if API key is not yet set or rate limited
  return generateRuleBasedFallback(incomingMessage, settings, products);
}

function generateRuleBasedFallback(message: string, settings: any, products: any[]): string {
  const lower = message.toLowerCase();

  if (lower.includes('halo') || lower.includes('hai') || lower.includes('assalamu') || lower.includes('selamat')) {
    return `Halo kak! Terima kasih telah menghubungi ${settings.businessName} 😊. Ada yang bisa kami bantu seputar produk atau layanan kami?`;
  }
  if (lower.includes('harga') || lower.includes('biaya') || lower.includes('paket') || lower.includes('pricelist')) {
    const list = products.slice(0, 3).map(p => `• ${p.name}: Rp ${p.price.toLocaleString('id-ID')}`).join('\n');
    return `Berikut informasi paket & produk kami kak:\n${list}\n\nKakak tertarik dengan paket yang mana? Silakan tanyakan ya!`;
  }
  if (lower.includes('bayar') || lower.includes('rekening') || lower.includes('transfer') || lower.includes('rek')) {
    return `Untuk pembayaran bisa ditransfer ke Rekening Resmi kami:\n🏦 BCA: 8830-192-881\n🏦 Mandiri: 137-00-1928-8812\na/n PT WhatsPro Digital. Mohon sertakan bukti transfer setelah transfer ya kak 🙏`;
  }
  if (lower.includes('alamat') || lower.includes('lokasi') || lower.includes('kantor') || lower.includes('buka')) {
    return `Kantor ${settings.businessName} beralamat di: ${settings.address}.\nJam Operasional: ${settings.operatingHours}.`;
  }
  if (lower.includes('cron') || lower.includes('uptime') || lower.includes('aktif') || lower.includes('robot')) {
    return `WhatsPro dilengkapi endpoint Keep-Alive khusus untuk UptimeRobot (/api/cron/keepalive). Cukup daftarkan link tersebut dengan interval 5 menit agar WhatsApp dan AI bot Anda tetap siaga 24 jam penuh!`;
  }

  return `Terima kasih atas pesan kakak di ${settings.businessName} 😊. Tim kami atau asisten AI kami siap membantu. Ada hal spesifik mengenai produk atau solusi kami yang ingin kakak ketahui?`;
}
