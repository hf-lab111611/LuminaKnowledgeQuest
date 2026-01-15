
export enum GameStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum MessageRole {
  USER = 'user',
  LUMINA = 'model'
}

export type MascotAction = 'GREET' | 'THINKING' | 'SUCCESS' | 'IDLE' | 'ANGRY';

export interface GameState {
  currentLevel: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
  levelTitle: string;
  isBossFight: boolean;
  corePillars: string[];
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface ChallengeData {
  title: string;
  description: string; // The question content
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'BOSS';
  xpReward: number; // Potential XP gain
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string; // Markdown content (Narrative)
  flashcards?: Flashcard[];
  challenge?: ChallengeData; // New: Specific container for Quiz/Questions
  timestamp: number;
}

// The structure we expect Gemini to return (embedded in JSON)
export interface LuminaResponse {
  markdown_response: string; // Narasi/Penjelasan
  flashcards?: Flashcard[];
  mascot_action?: MascotAction;
  
  // New Fields for Logic
  quiz_result?: 'CORRECT' | 'WRONG' | 'NEUTRAL'; // Evaluasi jawaban user sebelumnya
  active_challenge?: ChallengeData; // Jika AI memberikan pertanyaan baru
  
  game_state_update?: {
    current_level?: number;
    level_title?: string;
    xp_gained?: number; // Bisa negatif untuk pengurangan poin
    is_boss_fight?: boolean;
    core_pillars?: string[];
  };
}
