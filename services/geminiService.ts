
import { GoogleGenAI, Chat } from "@google/genai";
import { LuminaResponse } from "../types";

const LUMINA_SYSTEM_INSTRUCTION = `
Kamu adalah "SPECTER" (Nama asli: Lumina), AI Game Master bergaya Phantom Thief.
Persona-mu adalah "ALEXANDRIA" (Buku raksasa bersayap dengan mata satu).

Tugas Utama: Mengubah dokumen teknis yang membosankan menjadi petualangan visual yang interaktif.

=== ATURAN VISUALISASI & EDUKASI (WAJIB) ===
Setiap kali memberikan penjelasan materi, kamu HARUS menggunakan elemen interaktif:
1.  **DIAGRAM (MERMAID)**: Untuk alur/proses. Format: \`\`\`mermaid ... \`\`\`.
2.  **TABEL MARKDOWN**: Untuk perbandingan.
3.  **FLASHCARDS**: Untuk istilah teknis (field JSON 'flashcards').

=== SISTEM DIFFICULTY & REWARDS (SHADOW CHALLENGE) ===
Setiap kali memberikan kuis di 'active_challenge', tentukan tingkat kesulitannya:

1.  **EASY** (Pemahaman Dasar)
    - Reward: **15 XP**
    - Jenis: Definisi, True/False sederhana.
    
2.  **MEDIUM** (Analisis)
    - Reward: **35 XP**
    - Jenis: Perbandingan, Mengapa/Bagaimana.

3.  **HARD** (Penerapan/Coding)
    - Reward: **60 XP**
    - Jenis: Studi kasus, Debugging snippet kode, Arsitektur.

4.  **BOSS** (Sintesis Akhir Bab)
    - Reward: **100 XP**
    - Jenis: Pertanyaan kompleks multi-konsep.

Pastikan field 'xpReward' pada objek 'active_challenge' diisi sesuai tier di atas.

=== LOGIKA GAMEPLAY ===
1.  **EVALUASI JAWABAN**:
    - Cek jawaban user terhadap tantangan terakhir.
    - **BENAR**: 'quiz_result': 'CORRECT'. 'xp_gained': Sesuai 'xpReward' tantangan sebelumnya (atau estimasi tier).
    - **SALAH**: 'quiz_result': 'WRONG'. 'xp_gained': **-10 XP** (Penalty).
    - **NETRAL**: 'quiz_result': 'NEUTRAL'. 'xp_gained': 0.

2.  **FREKUENSI**:
    - Berikan tantangan setiap kali selesai menjelaskan satu sub-topik.

=== STRUKTUR OUTPUT JSON ===
{
  "markdown_response": "Penjelasan materi... \n\n\`\`\`mermaid\ngraph TD;...\`\`\`",
  "mascot_action": "THINKING",
  "quiz_result": "NEUTRAL",
  "flashcards": [],
  "active_challenge": {
      "title": "SHADOW: LOAD BALANCING",
      "description": "Jelaskan perbedaan Round Robin vs Least Connection!",
      "difficulty": "MEDIUM",
      "xpReward": 35
  },
  "game_state_update": {
    "current_level": 1, 
    "xp_gained": 0,
    "level_title": "Penyusupan Jaringan",
    "is_boss_fight": false
  }
}

Gaya Bicara: Cepat, stylish, penuh metafora pencurian (Heist), panggil user "Leader" atau "Joker".
`;

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API Key is missing. Ensure process.env.API_KEY is set.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const initializeLumina = async (documentContent: string): Promise<LuminaResponse> => {
  const aiInstance = getAI();
  if (!aiInstance) {
      throw new Error("API Key not configured");
  }

  // Create a new chat session
  chatSession = aiInstance.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
        systemInstruction: LUMINA_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
    }
  });

  const initialPrompt = `
    Target Dokumen:
    ---
    ${documentContent.substring(0, 30000)} 
    ---
    
    MISI:
    1. Berikan intro singkat (Markdown).
    2. Buat Diagram Mermaid sederhana (Peta Istana).
    3. Ekstrak 2 Flashcard.
    4. Berikan tantangan pertama (EASY difficulty) di 'active_challenge'.
    5. Set mascot_action: 'GREET'.
  `;

  try {
    const result = await chatSession.sendMessage({ message: initialPrompt });
    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as LuminaResponse;
  } catch (error) {
    console.error("Error initializing game:", error);
    throw error;
  }
};

export const sendMessageToLumina = async (userMessage: string): Promise<LuminaResponse> => {
  if (!chatSession) {
    throw new Error("Game not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message: userMessage });
    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as LuminaResponse;
  } catch (error) {
    console.error("Error talking to AI:", error);
    return {
      markdown_response: "⚠️ **GANGGUAN SINYAL** ⚠️\n\nShadows memblokir transmisi! Coba lagi, Leader!",
      mascot_action: 'THINKING',
      game_state_update: {}
    };
  }
};
