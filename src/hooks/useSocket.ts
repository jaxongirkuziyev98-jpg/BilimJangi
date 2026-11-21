import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { TRANSLATIONS } from '../i18n/translations';
import { soundEngine } from '../sounds/soundEngine';
import {
  AnswerResultPayload,
  CustomQuestionInput,
  Difficulty,
  GameType,
  MathInputMode,
  PublicQuestion,
  PublicRoomState,
  QuestionMode,
  ServerQuestion,
  SubjectId,
} from '../shared/types';
import { useGameStore } from '../store/useGameStore';

let socketInstance: Socket | null = null;
let listenersBound = false;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
    });
  }
  return socketInstance;
}

export function useSocketSync(): void {
  useEffect(() => {
    const socket = getSocket();

    // Check URL ?code=XXXXXX invite link once on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code')?.trim().toUpperCase();
      if (urlCode && urlCode.length >= 4) {
        const store = useGameStore.getState();
        store.setPrefilledCode(urlCode);
        store.setFlowIntent('join');
        if (!store.room) {
          store.setScreen('profile');
        }
      }
    }

    if (listenersBound) return;
    listenersBound = true;

    socket.on('connect', () => {
      const store = useGameStore.getState();
      store.setConnected(true, false);

      // Reconnect existing session if page refreshed or network dropped
      const saved = store.getSavedSession();
      if (saved && (store.room || saved.code)) {
        socket.emit('reconnect_session', saved);
      }
    });

    socket.on('disconnect', () => {
      const store = useGameStore.getState();
      store.setConnected(false, Boolean(store.room));
    });

    socket.on('connect_error', () => {
      const store = useGameStore.getState();
      store.setConnected(false, Boolean(store.room));
    });

    socket.on('room_created', (data: { room: PublicRoomState; playerId: string }) => {
      useGameStore.getState().setRoomSession(data.room, data.playerId);
    });

    socket.on('room_joined', (data: { room: PublicRoomState; playerId: string }) => {
      useGameStore.getState().setRoomSession(data.room, data.playerId);
    });

    socket.on('room_state', (room: PublicRoomState) => {
      useGameStore.getState().updateRoom(room);
    });

    socket.on('player_joined', () => {
      soundEngine.click();
    });

    socket.on('game_started', (room: PublicRoomState) => {
      const store = useGameStore.getState();
      store.setQuestion(
        {
          id: 'loading',
          subject: room.subject,
          text: '',
          options: ['', '', '', ''],
          difficulty: room.difficulty,
          supportsNumeric: false,
        },
        1
      );
      store.setAnswerResult(null);
      store.updateRoom(room);
    });

    socket.on(
      'question_sent',
      (data: { question: PublicQuestion; round: number }) => {
        useGameStore.getState().setQuestion(data.question, data.round);
      }
    );

    socket.on('answer_result', (res: AnswerResultPayload) => {
      const store = useGameStore.getState();
      store.setAnswerResult(res);
      if (res.correct) {
        if (res.streakBonus > 0) {
          soundEngine.streak();
        } else {
          soundEngine.correct();
        }
        if (store.room?.gameType === 'tug_of_war') {
          soundEngine.pull();
        }
      } else {
        soundEngine.wrong();
      }
    });

    socket.on('timer_tick', (data: { timeLeft: number }) => {
      useGameStore.getState().setTimeLeft(data.timeLeft);
      if (data.timeLeft > 0 && data.timeLeft <= 10) {
        soundEngine.timerTick();
      }
    });

    socket.on('game_ended', (room: PublicRoomState) => {
      soundEngine.victory();
      useGameStore.getState().updateRoom(room);
    });

    socket.on('custom_questions_list', (list: ServerQuestion[]) => {
      useGameStore.getState().setCustomQuestions(list);
    });

    socket.on('room_error', (data: { code: string }) => {
      useGameStore.getState().setError(data.code);
    });

    socket.on('room_closed', () => {
      const store = useGameStore.getState();
      const t = TRANSLATIONS[store.language];
      store.clearRoomSession();
      store.setNotice(t.hostLeftClosed);
      setTimeout(() => useGameStore.getState().setNotice(null), 5000);
    });

    socket.on('kicked_from_room', () => {
      const store = useGameStore.getState();
      const t = TRANSLATIONS[store.language];
      store.clearRoomSession();
      store.setNotice(t.kickedMessage);
      setTimeout(() => useGameStore.getState().setNotice(null), 5000);
    });

    socket.on('session_expired', () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('bilimjang_room_code');
      }
      // Server qayta ishga tushgan yoki xona yopilgan bo'lsa, eskirgan ekranda qolib ketmaslik uchun
      const store = useGameStore.getState();
      if (store.room) {
        store.clearRoomSession();
      }
    });

    socket.on('player_disconnected', () => {
      const store = useGameStore.getState();
      const t = TRANSLATIONS[store.language];
      store.setNotice(t.opponentDisconnected);
    });

    socket.on('player_reconnected', () => {
      const store = useGameStore.getState();
      const t = TRANSLATIONS[store.language];
      store.setNotice(t.opponentReconnected);
      setTimeout(() => useGameStore.getState().setNotice(null), 3000);
    });
  }, []);
}

export const socketActions = {
  createRoom(payload: {
    subject: SubjectId;
    difficulty: Difficulty;
    durationMinutes: 1 | 2 | 3;
    questionMode: QuestionMode;
    wrongPenalty: boolean;
    mathInputMode: MathInputMode;
    shuffleQuestions: boolean;
    customQuestions?: CustomQuestionInput[];
  }) {
    const store = useGameStore.getState();
    getSocket().emit('create_room', {
      token: store.playerToken,
      name: store.playerName,
      avatar: store.playerAvatar,
      ...payload,
    });
  },

  joinRoom(code: string) {
    const store = useGameStore.getState();
    getSocket().emit('join_room', {
      code: code.trim().toUpperCase(),
      token: store.playerToken,
      name: store.playerName,
      avatar: store.playerAvatar,
    });
  },

  updateSettings(payload: {
    code: string;
    subject?: SubjectId;
    gameType?: GameType;
    difficulty?: Difficulty;
    durationMinutes?: 1 | 2 | 3;
    questionMode?: QuestionMode;
    wrongPenalty?: boolean;
    mathInputMode?: MathInputMode;
    shuffleQuestions?: boolean;
  }) {
    getSocket().emit('update_room_settings', payload);
  },

  switchSide() {
    getSocket().emit('switch_side');
  },

  addCustomQuestion(q: CustomQuestionInput) {
    getSocket().emit('add_custom_question', q);
  },

  getCustomQuestions() {
    getSocket().emit('get_custom_questions');
  },

  deleteCustomQuestion(questionId: string) {
    getSocket().emit('delete_custom_question', { questionId });
  },

  kickPlayer(playerId: string) {
    getSocket().emit('kick_player', { playerId });
  },

  startGame() {
    getSocket().emit('start_game');
  },

  submitAnswer(payload: { questionId: string; optionIndex?: number; numericValue?: number }) {
    getSocket().emit('submit_answer', payload);
  },

  pauseGame() {
    getSocket().emit('pause_game');
  },

  resumeGame() {
    getSocket().emit('resume_game');
  },

  endGame() {
    getSocket().emit('end_game');
  },

  playAgain() {
    getSocket().emit('play_again');
  },

  returnToLobby() {
    getSocket().emit('return_to_lobby');
  },

  leaveRoom() {
    getSocket().emit('leave_room');
    useGameStore.getState().clearRoomSession();
  },
};
