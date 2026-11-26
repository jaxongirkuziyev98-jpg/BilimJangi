import { create } from 'zustand';
import { getLevelFromXp } from '../shared/gifts';
import { soundEngine } from '../sounds/soundEngine';
import {
  AnswerResultPayload,
  AVATARS,
  IncomingGameInvite,
  Language,
  LeaderboardEntry,
  PublicQuestion,
  PublicRoomState,
  ServerQuestion,
  SubjectId,
  UserAuthProfile,
} from '../shared/types';

export type ScreenId =
  | 'login'
  | 'welcome'
  | 'profile'
  | 'create_room'
  | 'join_room'
  | 'lobby'
  | 'game'
  | 'results'
  | 'dashboard'
  | 'leaderboard';

export type FlowIntent = 'create' | 'join';
export type ThemeMode = 'light' | 'dark';

const AUTH_STORAGE_KEY = 'bilimjang_auth_v1';

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

function getPersistentPlayerToken(): string {
  if (typeof window === 'undefined') return 'server_token';
  const existingLocal = window.localStorage.getItem('bilimjang_user_token');
  if (existingLocal) return existingLocal;
  const existingSession = window.sessionStorage.getItem('bilimjang_tab_token');
  const token = existingSession || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem('bilimjang_user_token', token);
  window.sessionStorage.setItem('bilimjang_tab_token', token);
  return token;
}

function loadAuthProfile(): UserAuthProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserAuthProfile;
    if (parsed && parsed.firstName && parsed.lastName) {
      return parsed;
    }
  } catch {
    // Ignore invalid stored JSON
  }
  return null;
}

function saveAuthProfile(profile: UserAuthProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!profile) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
}

function getSavedRoomSession(): { code: string; token: string } | null {
  if (typeof window === 'undefined') return null;
  const code = window.sessionStorage.getItem('bilimjang_room_code');
  const token =
    window.localStorage.getItem('bilimjang_user_token') ||
    window.sessionStorage.getItem('bilimjang_tab_token');
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

  authProfile: UserAuthProfile | null;
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
  recordedMatchIds: string[];

  leaderboard: LeaderboardEntry[];
  incomingInvite: IncomingGameInvite | null;
  outgoingInviteInfo: { roomCode: string; targetName: string; delivered: boolean } | null;

  errorMessageKey: string | null;
  noticeBanner: string | null;

  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setConnected: (connected: boolean, reconnecting?: boolean) => void;
  setScreen: (screen: ScreenId) => void;
  setFlowIntent: (intent: FlowIntent) => void;
  setPrefilledCode: (code: string) => void;
  loginWithNames: (firstName: string, lastName: string) => UserAuthProfile;
  logoutProfile: () => void;
  setPlayerProfile: (name: string, avatar: string, subject: SubjectId) => void;
  setSelectedSubject: (subject: SubjectId) => void;
  setAvatar: (avatar: string) => void;
  setRoomSession: (room: PublicRoomState, playerId: string) => void;
  updateRoom: (room: PublicRoomState) => void;
  setTimeLeft: (timeLeft: number) => void;
  setQuestion: (question: PublicQuestion, round: number) => void;
  setAnswerResult: (result: AnswerResultPayload | null) => void;
  setCustomQuestions: (list: ServerQuestion[]) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setIncomingInvite: (invite: IncomingGameInvite | null) => void;
  setOutgoingInviteInfo: (
    info: { roomCode: string; targetName: string; delivered: boolean } | null
  ) => void;
  setError: (key: string | null) => void;
  setNotice: (msg: string | null) => void;
  clearRoomSession: () => void;
  getSavedSession: () => { code: string; token: string } | null;
}

const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);
const initialAuth = loadAuthProfile();
const persistentToken = getPersistentPlayerToken();

export const useGameStore = create<GameStoreState>((set, get) => ({
  language: getInitialLanguage(),
  theme: initialTheme,
  soundEnabled: getInitialSound(),
  connected: false,
  reconnecting: false,
  screen: initialAuth ? 'welcome' : 'login',
  flowIntent: 'create',
  prefilledCode: '',

  authProfile: initialAuth,
  playerName:
    initialAuth?.fullName ??
    (typeof window !== 'undefined' ? window.sessionStorage.getItem('bilimjang_name') ?? '' : ''),
  playerAvatar:
    initialAuth?.avatar ??
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem('bilimjang_avatar') ?? AVATARS[0]
      : AVATARS[0]),
  selectedSubject:
    initialAuth?.favoriteSubject ??
    ((typeof window !== 'undefined'
      ? (window.sessionStorage.getItem('bilimjang_subject') as SubjectId | null)
      : null) ??
      'math'),
  playerToken: persistentToken,
  playerId: null,

  room: null,
  currentQuestion: null,
  questionRound: 1,
  lastAnswerResult: null,
  customQuestions: [],
  recordedMatchIds: [],

  leaderboard: [],
  incomingInvite: null,
  outgoingInviteInfo: null,

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

  loginWithNames: (firstName, lastName) => {
    const cleanFirst = firstName.trim().slice(0, 18);
    const cleanLast = lastName.trim().slice(0, 18);
    const fullName = `${cleanFirst} ${cleanLast}`.trim();
    const state = get();
    const existing = state.authProfile;

    const nextProfile: UserAuthProfile =
      existing && existing.firstName === cleanFirst && existing.lastName === cleanLast
        ? existing
        : {
            token: state.playerToken,
            firstName: cleanFirst,
            lastName: cleanLast,
            fullName,
            avatar: state.playerAvatar || AVATARS[0],
            favoriteSubject: state.selectedSubject || 'math',
            xp: 0,
            matchesPlayed: 0,
            wins: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalMinutesPlayed: 0,
            gifts: [],
          };

    saveAuthProfile(nextProfile);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_name', fullName);
    }

    const nextScreen: ScreenId = state.prefilledCode ? 'join_room' : 'welcome';
    set({
      authProfile: nextProfile,
      playerName: fullName,
      playerAvatar: nextProfile.avatar,
      selectedSubject: nextProfile.favoriteSubject,
      screen: nextScreen,
      errorMessageKey: null,
    });
    return nextProfile;
  },

  logoutProfile: () => {
    saveAuthProfile(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('bilimjang_room_code');
      window.sessionStorage.removeItem('bilimjang_name');
    }
    set({
      authProfile: null,
      playerName: '',
      room: null,
      playerId: null,
      currentQuestion: null,
      lastAnswerResult: null,
      screen: 'login',
      errorMessageKey: null,
    });
  },

  setPlayerProfile: (playerName, playerAvatar, selectedSubject) => {
    const state = get();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_name', playerName);
      window.sessionStorage.setItem('bilimjang_avatar', playerAvatar);
      window.sessionStorage.setItem('bilimjang_subject', selectedSubject);
    }
    let updatedAuth = state.authProfile;
    if (updatedAuth) {
      updatedAuth = {
        ...updatedAuth,
        fullName: playerName,
        avatar: playerAvatar,
        favoriteSubject: selectedSubject,
      };
      saveAuthProfile(updatedAuth);
    }
    set({ playerName, playerAvatar, selectedSubject, authProfile: updatedAuth });
  },

  setSelectedSubject: (selectedSubject) => {
    const state = get();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_subject', selectedSubject);
    }
    let updatedAuth = state.authProfile;
    if (updatedAuth) {
      updatedAuth = { ...updatedAuth, favoriteSubject: selectedSubject };
      saveAuthProfile(updatedAuth);
    }
    set({ selectedSubject, authProfile: updatedAuth });
  },

  setAvatar: (playerAvatar) => {
    const state = get();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('bilimjang_avatar', playerAvatar);
    }
    let updatedAuth = state.authProfile;
    if (updatedAuth) {
      updatedAuth = { ...updatedAuth, avatar: playerAvatar };
      saveAuthProfile(updatedAuth);
    }
    set({ playerAvatar, authProfile: updatedAuth });
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

      let updatedAuth = state.authProfile;
      let recordedMatchIds = state.recordedMatchIds;

      if (
        room.status === 'finished' &&
        room.matchId &&
        !state.recordedMatchIds.includes(room.matchId) &&
        updatedAuth
      ) {
        const me = room.players.find((p) => p.id === state.playerId);
        if (me) {
          const isWinner = room.winner !== 'draw' && me.side === room.winner;
          const xpGain = me.earnedXp ?? 15 + me.correctCount * 10;
          const nextGifts =
            isWinner && me.earnedGift
              ? [me.earnedGift, ...updatedAuth.gifts]
              : updatedAuth.gifts;

          updatedAuth = {
            ...updatedAuth,
            favoriteSubject: room.subject,
            xp: updatedAuth.xp + xpGain,
            matchesPlayed: updatedAuth.matchesPlayed + 1,
            wins: updatedAuth.wins + (isWinner ? 1 : 0),
            totalCorrect: updatedAuth.totalCorrect + me.correctCount,
            totalWrong: updatedAuth.totalWrong + me.wrongCount,
            totalMinutesPlayed: updatedAuth.totalMinutesPlayed + room.durationMinutes,
            gifts: nextGifts,
          };
          saveAuthProfile(updatedAuth);
          recordedMatchIds = [...state.recordedMatchIds, room.matchId];
        }
      }

      return {
        room,
        screen: nextScreen,
        selectedSubject: room.subject,
        authProfile: updatedAuth,
        recordedMatchIds,
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

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setIncomingInvite: (incomingInvite) => set({ incomingInvite }),

  setOutgoingInviteInfo: (outgoingInviteInfo) => set({ outgoingInviteInfo }),

  setError: (errorMessageKey) => set({ errorMessageKey }),

  setNotice: (noticeBanner) => set({ noticeBanner }),

  clearRoomSession: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('bilimjang_room_code');
    }
    const auth = get().authProfile;
    set({
      room: null,
      playerId: null,
      currentQuestion: null,
      lastAnswerResult: null,
      customQuestions: [],
      screen: auth ? 'welcome' : 'login',
      errorMessageKey: null,
    });
  },

  getSavedSession: getSavedRoomSession,
}));

export function getAuthLevelInfo(profile: UserAuthProfile | null) {
  return getLevelFromXp(profile?.xp ?? 0);
}
