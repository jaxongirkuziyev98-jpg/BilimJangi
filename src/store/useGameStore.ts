import { create } from 'zustand';
import { soundEngine } from '../sounds/soundEngine';
import {
  AnswerResultPayload,
  AVATARS,
  Language,
  PublicQuestion,
  PublicRoomState,
  ServerQuestion,
  SubjectId,
} from '../shared/types';

export type ScreenId =
  | 'welcome'
  | 'profile'
  | 'create_room'
  | 'join_room'
  | 'lobby'
  | 'game'
  | 'results';

export type FlowIntent = 'create' | 'join';
export type ThemeMode = 'light' | 'dark';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'uz';
  const stored = window.localStorage.getItem('bilimjang_lang');
  if (stored === 'uz' || stored === 'ru' || stored === 'en') return stored;
  return 'uz';
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('bilimjang_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialSound(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem('bilimjang_sound');
  const val = stored !== 'false';
  soundEngine.setEnabled(val);
  return val;
}

function getTabPlayerToken(): string {
  if (typeof window === 'undefined') return 'server_token';
  const existing = window.sessionStorage.getItem('bilimjang_tab_token');
  if (existing) return existing;
  const generated = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem('bilimjang_tab_token', generated);
  return generated;
}

function getSavedRoomSession(): { code: string; token: string } | null {
  if (typeof window === 'undefined') return null;
  const code = window.sessionStorage.getItem('bilimjang_room_code');
  const token = window.sessionStorage.getItem('bilimjang_tab_token');
  if (code && token) return { code, token };
  return null;
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

interface GameStoreState {
  language: Language;
  theme: ThemeMode;
  soundEnabled: boolean;
  connected: boolean;
  reconnecting: boolean;
  screen: ScreenId;
  flowIntent: FlowIntent;
  prefilledCode: string;

  playerName: string;
  playerAvatar: string;
  selectedSubject: SubjectId;
  playerToken: string;
  playerId: string | null;

  room: PublicRoomState | null;
  currentQuestion: PublicQuestion | null;
  questionRound: number;
  lastAnswerResult: AnswerResultPayload | null;
  customQuestions: ServerQuestion[];

  errorMessageKey: string | null;
  noticeBanner: string | null;

  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setConnected: (connected: boolean, reconnecting?: boolean) => void;
  setScreen: (screen: ScreenId) => void;
  setFlowIntent: (intent: FlowIntent) => void;
  setPrefilledCode: (code: string) => void;
  setPlayerProfile: (name: string, avatar: string, subject: SubjectId) => void;
  setSelectedSubject: (subject: SubjectId) => void;
  setRoomSession: (room: PublicRoomState, playerId: string) => void;
  updateRoom: (room: PublicRoomState) => void;
  setTimeLeft: (timeLeft: number) => void;
  setQuestion: (question: PublicQuestion, round: number) => void;
  setAnswerResult: (result: AnswerResultPayload | null) => void;
  setCustomQuestions: (list: ServerQuestion[]) => void;
  setError: (key: string | null) => void;
  setNotice: (msg: string | null) => void;
  clearRoomSession: () => void;
  getSavedSession: () => { code: string; token: string } | null;
}

const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);

export const useGameStore = create<GameStoreState>((set) => ({
  language: getInitialLanguage(),
  theme: initialTheme,
  soundEnabled: getInitialSound(),
  connected: false,
  reconnecting: false,
  screen: 'welcome',
  flowIntent: 'create',
  prefilledCode: '',

  playerName:
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('bilimjang_name') ?? ''
      : '',
  playerAvatar:
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('bilimjang_avatar') ?? AVATARS[0]
      : AVATARS[0],
  selectedSubject:
    (typeof window !== 'undefined'
      ? (window.sessionStorage.getItem('bilimjang_subject') as SubjectId | null)
      : null) ?? 'math',
  playerToken: getTabPlayerToken(),
  playerId: null,

  room: null,
  currentQuestion: null,
  questionRound: 1,
  lastAnswerResult: null,
  customQuestions: [],

  errorMessageKey: null,
  noticeBanner: null,

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bilimjang_lang', lang);
    }
    set({ language: lang });
  },

  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bilimjang_theme', next);
      }
      applyThemeToDocument(next);
      return { theme: next };
    }),

  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      soundEngine.setEnabled(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bilimjang_sound', String(next));
      }
      if (next) soundEngine.click();
      return { soundEnabled: next };
    }),

  setConnected: (connected, reconnecting = false) => set({ connected, reconnecting }),

  setScreen: (screen) => set({ screen, errorMessageKey: null }),

  setFlowIntent: (flowIntent) => set({ flowIntent }),

  setPrefilledCode: (prefilledCode) => set({ prefilledCode }),

  setPlayerProfile: (playerName, playerAvatar, selectedSubject) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_name', playerName);
      window.sessionStorage.setItem('bilimjang_avatar', playerAvatar);
      window.sessionStorage.setItem('bilimjang_subject', selectedSubject);
    }
    set({ playerName, playerAvatar, selectedSubject });
  },

  setSelectedSubject: (selectedSubject) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_subject', selectedSubject);
    }
    set({ selectedSubject });
  },

  setRoomSession: (room, playerId) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_room_code', room.code);
    }
    let nextScreen: ScreenId = 'lobby';
    if (room.status === 'countdown' || room.status === 'playing' || room.status === 'paused') {
      nextScreen = 'game';
    } else if (room.status === 'finished') {
      nextScreen = 'results';
    }
    set({
      room,
      playerId,
      screen: nextScreen,
      errorMessageKey: null,
      selectedSubject: room.subject,
    });
  },

  updateRoom: (room) =>
    set((state) => {
      let nextScreen = state.screen;
      if (room.status === 'lobby') {
        nextScreen = 'lobby';
      } else if (
        room.status === 'countdown' ||
        room.status === 'playing' ||
        room.status === 'paused'
      ) {
        nextScreen = 'game';
      } else if (room.status === 'finished') {
        nextScreen = 'results';
      }
      return {
        room,
        screen: nextScreen,
        selectedSubject: room.subject,
      };
    }),

  setTimeLeft: (timeLeft) =>
    set((state) => ({
      room: state.room ? { ...state.room, timeLeft } : null,
    })),

  setQuestion: (currentQuestion, questionRound) =>
    set({
      currentQuestion,
      questionRound,
      lastAnswerResult: null,
    }),

  setAnswerResult: (lastAnswerResult) => set({ lastAnswerResult }),

  setCustomQuestions: (customQuestions) => set({ customQuestions }),

  setError: (errorMessageKey) => set({ errorMessageKey }),

  setNotice: (noticeBanner) => set({ noticeBanner }),

  clearRoomSession: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('bilimjang_room_code');
    }
    set({
      room: null,
      playerId: null,
      currentQuestion: null,
      lastAnswerResult: null,
      customQuestions: [],
      screen: 'welcome',
      errorMessageKey: null,
    });
  },

  getSavedSession: getSavedRoomSession,
}));
