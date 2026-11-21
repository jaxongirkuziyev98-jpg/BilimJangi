export type Language = 'uz' | 'ru' | 'en';

export type SubjectId =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'literature'
  | 'history'
  | 'geography'
  | 'informatics';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameType = 'subject_battle' | 'tug_of_war' | 'race' | 'quick_answer';

export type DuelSide = 'A' | 'B';

export type RoomStatus = 'lobby' | 'countdown' | 'playing' | 'paused' | 'finished';

export type QuestionMode = 'auto' | 'custom';

export type MathInputMode = 'choice' | 'numeric';

export interface SubjectMeta {
  id: SubjectId;
  emoji: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderClass: string;
  gradientClass: string;
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'math',
    emoji: '➗',
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderClass: 'border-blue-500',
    gradientClass: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'physics',
    emoji: '⚛️',
    color: '#7C3AED',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderClass: 'border-violet-500',
    gradientClass: 'from-violet-500 to-purple-600',
  },
  {
    id: 'chemistry',
    emoji: '🧪',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderClass: 'border-emerald-500',
    gradientClass: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'biology',
    emoji: '🧬',
    color: '#0D9488',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    borderClass: 'border-teal-500',
    gradientClass: 'from-teal-500 to-green-600',
  },
  {
    id: 'english',
    emoji: '🔤',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    borderClass: 'border-sky-500',
    gradientClass: 'from-sky-500 to-blue-600',
  },
  {
    id: 'literature',
    emoji: '📖',
    color: '#D97706',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderClass: 'border-amber-500',
    gradientClass: 'from-amber-500 to-orange-600',
  },
  {
    id: 'history',
    emoji: '🏛️',
    color: '#EA580C',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    borderClass: 'border-orange-500',
    gradientClass: 'from-orange-500 to-red-600',
  },
  {
    id: 'geography',
    emoji: '🌍',
    color: '#0891B2',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderClass: 'border-cyan-500',
    gradientClass: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'informatics',
    emoji: '💻',
    color: '#4F46E5',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    borderClass: 'border-indigo-500',
    gradientClass: 'from-indigo-500 to-blue-700',
  },
];

export const AVATARS = [
  '🦁',
  '🐼',
  '🦊',
  '🐯',
  '🐸',
  '🦄',
  '🐙',
  '🦅',
  '🐺',
  '🐲',
  '🤖',
  '👽',
];

export interface ServerQuestion {
  id: string;
  subject: SubjectId;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  numericAnswer?: number;
  difficulty: Difficulty;
}

export interface PublicQuestion {
  id: string;
  subject: SubjectId;
  text: string;
  options: [string, string, string, string];
  difficulty: Difficulty;
  supportsNumeric: boolean;
}

export interface CustomQuestionInput {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  side: DuelSide;
  isHost: boolean;
  score: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
  bestStreak: number;
  progress: number;
  connected: boolean;
}

export interface QuickRoundWinner {
  playerId: string;
  name: string;
  avatar: string;
  side: DuelSide;
}

export interface PublicRoomState {
  code: string;
  hostId: string;
  subject: SubjectId;
  difficulty: Difficulty;
  durationMinutes: 1 | 2 | 3;
  gameType: GameType;
  questionMode: QuestionMode;
  wrongPenalty: boolean;
  mathInputMode: MathInputMode;
  shuffleQuestions: boolean;
  status: RoomStatus;
  timeLeft: number;
  totalTime: number;
  ropePosition: number; // -8 (A wins) to +8 (B wins)
  ropeLimit: number;
  raceFinishLine: number;
  quickRound: number;
  quickTotalRounds: number;
  quickRoundWinner: QuickRoundWinner | null;
  quickRoundLockedPlayerIds: string[];
  players: Player[];
  customQuestionsCount: number;
  winner: DuelSide | 'draw' | null;
  mvpPlayerId: string | null;
  winReason: 'score' | 'rope' | 'race' | 'rounds' | 'accuracy' | 'draw' | 'host_ended' | null;
}

export interface AnswerResultPayload {
  questionId: string;
  correct: boolean;
  pointsDelta: number;
  streakBonus: number;
  newScore: number;
  streak: number;
  correctIndex: number;
}
