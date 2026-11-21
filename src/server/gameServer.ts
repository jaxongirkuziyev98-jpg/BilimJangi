import { Server, Socket } from 'socket.io';
import { getSubjectQuestions, toPublicQuestion } from '../shared/questions';
import {
  CustomQuestionInput,
  Difficulty,
  DuelSide,
  GameType,
  MathInputMode,
  Player,
  PublicRoomState,
  QuestionMode,
  ServerQuestion,
  SubjectId,
} from '../shared/types';

interface InternalPlayer extends Player {
  token: string;
  socketId: string;
  questionCursor: number;
  answeredQuestionIds: Set<string>;
  disconnectTimer?: NodeJS.Timeout;
}

interface InternalRoom {
  code: string;
  hostToken: string;
  subject: SubjectId;
  difficulty: Difficulty;
  durationMinutes: 1 | 2 | 3;
  gameType: GameType;
  questionMode: QuestionMode;
  wrongPenalty: boolean;
  mathInputMode: MathInputMode;
  shuffleQuestions: boolean;
  status: PublicRoomState['status'];
  timeLeft: number;
  totalTime: number;
  ropePosition: number;
  ropeLimit: number;
  raceFinishLine: number;
  quickRound: number;
  quickTotalRounds: number;
  quickRoundWinner: PublicRoomState['quickRoundWinner'];
  quickRoundLockedPlayerIds: string[];
  players: InternalPlayer[];
  customQuestions: ServerQuestion[];
  deck: ServerQuestion[];
  winner: DuelSide | 'draw' | null;
  mvpPlayerId: string | null;
  winReason: PublicRoomState['winReason'];
  timerInterval?: NodeJS.Timeout;
  countdownTimeout?: NodeJS.Timeout;
  roundAdvanceTimeout?: NodeJS.Timeout;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(existing: Set<string>): string {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  } while (existing.has(code));
  return code;
}

function toPublicPlayer(p: InternalPlayer): Player {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    side: p.side,
    isHost: p.isHost,
    score: p.score,
    correctCount: p.correctCount,
    wrongCount: p.wrongCount,
    streak: p.streak,
    bestStreak: p.bestStreak,
    progress: p.progress,
    connected: p.connected,
  };
}

function toPublicRoom(room: InternalRoom): PublicRoomState {
  const host = room.players.find((p) => p.token === room.hostToken);
  return {
    code: room.code,
    hostId: host?.id ?? '',
    subject: room.subject,
    difficulty: room.difficulty,
    durationMinutes: room.durationMinutes,
    gameType: room.gameType,
    questionMode: room.questionMode,
    wrongPenalty: room.wrongPenalty,
    mathInputMode: room.mathInputMode,
    shuffleQuestions: room.shuffleQuestions,
    status: room.status,
    timeLeft: room.timeLeft,
    totalTime: room.totalTime,
    ropePosition: room.ropePosition,
    ropeLimit: room.ropeLimit,
    raceFinishLine: room.raceFinishLine,
    quickRound: room.quickRound,
    quickTotalRounds: room.quickTotalRounds,
    quickRoundWinner: room.quickRoundWinner,
    quickRoundLockedPlayerIds: [...room.quickRoundLockedPlayerIds],
    players: room.players.map(toPublicPlayer),
    customQuestionsCount: room.customQuestions.length,
    winner: room.winner,
    mvpPlayerId: room.mvpPlayerId,
    winReason: room.winReason,
  };
}

export function attachGameServer(io: Server): void {
  const rooms = new Map<string, InternalRoom>();
  const socketToSession = new Map<string, { code: string; token: string }>();

  function clearRoomTimers(room: InternalRoom): void {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = undefined;
    }
    if (room.countdownTimeout) {
      clearTimeout(room.countdownTimeout);
      room.countdownTimeout = undefined;
    }
    if (room.roundAdvanceTimeout) {
      clearTimeout(room.roundAdvanceTimeout);
      room.roundAdvanceTimeout = undefined;
    }
  }

  function broadcastRoom(room: InternalRoom): void {
    io.to(room.code).emit('room_state', toPublicRoom(room));
  }

  function ensurePlayerQuestion(room: InternalRoom, player: InternalPlayer): ServerQuestion {
    if (player.questionCursor >= room.deck.length) {
      const more = getSubjectQuestions(
        room.subject,
        room.difficulty,
        room.customQuestions,
        room.questionMode,
        true,
        30
      );
      room.deck.push(
        ...more.map((q, idx) => ({
          ...q,
          id: `${q.id}_ext_${room.deck.length + idx}`,
        }))
      );
    }
    return room.deck[player.questionCursor];
  }

  function sendCurrentQuestionToPlayer(room: InternalRoom, player: InternalPlayer): void {
    if (room.status !== 'playing' && room.status !== 'paused') return;
    if (room.gameType === 'quick_answer') {
      const qIdx = Math.max(0, room.quickRound - 1);
      if (qIdx >= room.deck.length) {
        const more = getSubjectQuestions(
          room.subject,
          room.difficulty,
          room.customQuestions,
          room.questionMode,
          true,
          20
        );
        room.deck.push(...more);
      }
      const q = room.deck[qIdx];
      if (q) {
        io.to(player.socketId).emit('question_sent', {
          question: toPublicQuestion(q),
          round: room.quickRound,
          totalRounds: room.quickTotalRounds,
        });
      }
      return;
    }

    const q = ensurePlayerQuestion(room, player);
    io.to(player.socketId).emit('question_sent', {
      question: toPublicQuestion(q),
      round: player.questionCursor + 1,
    });
  }

  function sendSharedQuickQuestion(room: InternalRoom): void {
    const qIdx = Math.max(0, room.quickRound - 1);
    if (qIdx >= room.deck.length) {
      const more = getSubjectQuestions(
        room.subject,
        room.difficulty,
        room.customQuestions,
        room.questionMode,
        true,
        20
      );
      room.deck.push(...more);
    }
    const q = room.deck[qIdx];
    if (q) {
      io.to(room.code).emit('question_sent', {
        question: toPublicQuestion(q),
        round: room.quickRound,
        totalRounds: room.quickTotalRounds,
      });
    }
  }

  function finishGame(
    room: InternalRoom,
    explicitWinner: DuelSide | 'draw' | null,
    winReason: PublicRoomState['winReason']
  ): void {
    if (room.status === 'finished') return;
    clearRoomTimers(room);
    room.status = 'finished';

    const playerA = room.players.find((p) => p.side === 'A');
    const playerB = room.players.find((p) => p.side === 'B');

    let finalWinner: DuelSide | 'draw' = 'draw';
    let finalReason = winReason;

    if (explicitWinner) {
      finalWinner = explicitWinner;
    } else if (room.gameType === 'tug_of_war') {
      if (room.ropePosition < 0) {
        finalWinner = 'A';
        finalReason = 'rope';
      } else if (room.ropePosition > 0) {
        finalWinner = 'B';
        finalReason = 'rope';
      } else {
        // Tiebreak by score then correct count
        const scoreA = playerA?.score ?? 0;
        const scoreB = playerB?.score ?? 0;
        if (scoreA > scoreB) {
          finalWinner = 'A';
          finalReason = 'score';
        } else if (scoreB > scoreA) {
          finalWinner = 'B';
          finalReason = 'score';
        } else {
          finalWinner = 'draw';
          finalReason = 'draw';
        }
      }
    } else if (room.gameType === 'race') {
      const progA = playerA?.progress ?? 0;
      const progB = playerB?.progress ?? 0;
      if (progA > progB) {
        finalWinner = 'A';
        finalReason = 'race';
      } else if (progB > progA) {
        finalWinner = 'B';
        finalReason = 'race';
      } else {
        const scoreA = playerA?.score ?? 0;
        const scoreB = playerB?.score ?? 0;
        if (scoreA > scoreB) {
          finalWinner = 'A';
          finalReason = 'score';
        } else if (scoreB > scoreA) {
          finalWinner = 'B';
          finalReason = 'score';
        } else {
          finalWinner = 'draw';
          finalReason = 'draw';
        }
      }
    } else {
      const scoreA = playerA?.score ?? 0;
      const scoreB = playerB?.score ?? 0;
      if (scoreA > scoreB) {
        finalWinner = 'A';
        finalReason = room.gameType === 'quick_answer' ? 'rounds' : 'score';
      } else if (scoreB > scoreA) {
        finalWinner = 'B';
        finalReason = room.gameType === 'quick_answer' ? 'rounds' : 'score';
      } else {
        const corrA = playerA?.correctCount ?? 0;
        const corrB = playerB?.correctCount ?? 0;
        if (corrA > corrB) {
          finalWinner = 'A';
          finalReason = 'accuracy';
        } else if (corrB > corrA) {
          finalWinner = 'B';
          finalReason = 'accuracy';
        } else {
          finalWinner = 'draw';
          finalReason = 'draw';
        }
      }
    }

    // MVP is the highest scoring player (tiebreak: correctCount)
    let mvp: InternalPlayer | null = null;
    for (const p of room.players) {
      if (
        !mvp ||
        p.score > mvp.score ||
        (p.score === mvp.score && p.correctCount > mvp.correctCount)
      ) {
        mvp = p;
      }
    }

    room.winner = finalWinner;
    room.winReason = finalReason;
    room.mvpPlayerId = mvp?.id ?? null;

    const pub = toPublicRoom(room);
    io.to(room.code).emit('room_state', pub);
    io.to(room.code).emit('game_ended', pub);
  }

  function startMatchCountdown(room: InternalRoom): void {
    clearRoomTimers(room);

    room.status = 'countdown';
    room.totalTime = room.durationMinutes * 60;
    room.timeLeft = room.totalTime;
    room.ropePosition = 0;
    room.quickRound = 1;
    room.quickRoundWinner = null;
    room.quickRoundLockedPlayerIds = [];
    room.winner = null;
    room.mvpPlayerId = null;
    room.winReason = null;

    room.deck = getSubjectQuestions(
      room.subject,
      room.difficulty,
      room.customQuestions,
      room.questionMode,
      room.shuffleQuestions,
      50
    );

    for (const p of room.players) {
      p.score = 0;
      p.correctCount = 0;
      p.wrongCount = 0;
      p.streak = 0;
      p.bestStreak = 0;
      p.progress = 0;
      p.questionCursor = 0;
      p.answeredQuestionIds = new Set<string>();
    }

    const pub = toPublicRoom(room);
    io.to(room.code).emit('room_state', pub);
    io.to(room.code).emit('game_started', pub);

    room.countdownTimeout = setTimeout(() => {
      if (!rooms.has(room.code) || room.status !== 'countdown') return;
      room.status = 'playing';
      broadcastRoom(room);

      if (room.gameType === 'quick_answer') {
        sendSharedQuickQuestion(room);
      } else {
        for (const p of room.players) {
          sendCurrentQuestionToPlayer(room, p);
        }
      }

      room.timerInterval = setInterval(() => {
        if (room.status !== 'playing') return;
        room.timeLeft = Math.max(0, room.timeLeft - 1);
        io.to(room.code).emit('timer_tick', { timeLeft: room.timeLeft });
        if (room.timeLeft <= 0) {
          finishGame(room, null, 'score');
        }
      }, 1000);
    }, 3600);
  }

  function advanceQuickRound(room: InternalRoom): void {
    if (room.status !== 'playing') return;
    if (room.quickRound >= room.quickTotalRounds) {
      finishGame(room, null, 'rounds');
      return;
    }
    room.quickRound += 1;
    room.quickRoundWinner = null;
    room.quickRoundLockedPlayerIds = [];
    broadcastRoom(room);
    sendSharedQuickQuestion(room);
  }

  io.on('connection', (socket: Socket) => {
    socket.on(
      'create_room',
      (payload: {
        token: string;
        name: string;
        avatar: string;
        subject: SubjectId;
        difficulty: Difficulty;
        durationMinutes: 1 | 2 | 3;
        questionMode: QuestionMode;
        wrongPenalty: boolean;
        mathInputMode: MathInputMode;
        shuffleQuestions: boolean;
        customQuestions?: CustomQuestionInput[];
      }) => {
        const cleanName = String(payload.name ?? '').trim().slice(0, 15);
        if (cleanName.length < 2) {
          socket.emit('room_error', { code: 'invalid_name' });
          return;
        }

        const existingCodes = new Set(rooms.keys());
        const code = generateRoomCode(existingCodes);
        const token = String(payload.token || socket.id);

        const customList: ServerQuestion[] = (payload.customQuestions ?? [])
          .filter(
            (q) =>
              q &&
              String(q.text ?? '').trim() &&
              Array.isArray(q.options) &&
              q.options.length === 4 &&
              q.options.every((o) => String(o ?? '').trim())
          )
          .map((q, idx) => ({
            id: `custom_${Date.now()}_${idx}`,
            subject: payload.subject,
            text: String(q.text).trim(),
            options: q.options.map((o) => String(o).trim()) as [string, string, string, string],
            correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
            difficulty: payload.difficulty,
          }));

        const hostPlayer: InternalPlayer = {
          id: `p_${Math.random().toString(36).slice(2, 10)}`,
          token,
          socketId: socket.id,
          name: cleanName,
          avatar: payload.avatar || '🦁',
          side: 'A',
          isHost: true,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          streak: 0,
          bestStreak: 0,
          progress: 0,
          connected: true,
          questionCursor: 0,
          answeredQuestionIds: new Set(),
        };

        const room: InternalRoom = {
          code,
          hostToken: token,
          subject: payload.subject || 'math',
          difficulty: payload.difficulty || 'medium',
          durationMinutes: payload.durationMinutes || 2,
          gameType: 'subject_battle',
          questionMode: payload.questionMode || 'auto',
          wrongPenalty: Boolean(payload.wrongPenalty),
          mathInputMode: payload.mathInputMode || 'choice',
          shuffleQuestions: payload.shuffleQuestions ?? true,
          status: 'lobby',
          timeLeft: (payload.durationMinutes || 2) * 60,
          totalTime: (payload.durationMinutes || 2) * 60,
          ropePosition: 0,
          ropeLimit: 8,
          raceFinishLine: 20,
          quickRound: 1,
          quickTotalRounds: 10,
          quickRoundWinner: null,
          quickRoundLockedPlayerIds: [],
          players: [hostPlayer],
          customQuestions: customList,
          deck: [],
          winner: null,
          mvpPlayerId: null,
          winReason: null,
        };

        rooms.set(code, room);
        socketToSession.set(socket.id, { code, token });
        socket.join(code);

        const pub = toPublicRoom(room);
        socket.emit('room_created', { room: pub, playerId: hostPlayer.id });
      }
    );

    socket.on(
      'join_room',
      (payload: { code: string; token: string; name: string; avatar: string }) => {
        const code = String(payload.code ?? '').trim().toUpperCase();
        const room = rooms.get(code);
        if (!room) {
          socket.emit('room_error', { code: 'room_not_found' });
          return;
        }

        const token = String(payload.token || socket.id);
        const existingPlayer = room.players.find((p) => p.token === token);

        // Reconnecting existing player
        if (existingPlayer) {
          if (existingPlayer.disconnectTimer) {
            clearTimeout(existingPlayer.disconnectTimer);
            existingPlayer.disconnectTimer = undefined;
          }
          existingPlayer.socketId = socket.id;
          existingPlayer.connected = true;
          socketToSession.set(socket.id, { code, token });
          socket.join(code);

          socket.emit('room_joined', { room: toPublicRoom(room), playerId: existingPlayer.id });
          broadcastRoom(room);
          io.to(code).emit('player_reconnected', { playerId: existingPlayer.id, name: existingPlayer.name });

          if (room.status === 'playing' || room.status === 'paused') {
            sendCurrentQuestionToPlayer(room, existingPlayer);
          }
          return;
        }

        if (room.players.length >= 2) {
          socket.emit('room_error', { code: 'room_full' });
          return;
        }

        if (room.status !== 'lobby') {
          socket.emit('room_error', { code: 'room_already_started' });
          return;
        }

        const cleanName = String(payload.name ?? '').trim().slice(0, 15);
        if (cleanName.length < 2) {
          socket.emit('room_error', { code: 'invalid_name' });
          return;
        }

        const takenSides = new Set(room.players.map((p) => p.side));
        const assignedSide: DuelSide = takenSides.has('A') ? 'B' : 'A';

        const newPlayer: InternalPlayer = {
          id: `p_${Math.random().toString(36).slice(2, 10)}`,
          token,
          socketId: socket.id,
          name: cleanName,
          avatar: payload.avatar || '🐼',
          side: assignedSide,
          isHost: false,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          streak: 0,
          bestStreak: 0,
          progress: 0,
          connected: true,
          questionCursor: 0,
          answeredQuestionIds: new Set(),
        };

        room.players.push(newPlayer);
        socketToSession.set(socket.id, { code, token });
        socket.join(code);

        const pub = toPublicRoom(room);
        socket.emit('room_joined', { room: pub, playerId: newPlayer.id });
        io.to(code).emit('player_joined', toPublicPlayer(newPlayer));
        broadcastRoom(room);
      }
    );

    socket.on('reconnect_session', (payload: { code: string; token: string }) => {
      const code = String(payload.code ?? '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        socket.emit('session_expired');
        return;
      }
      const player = room.players.find((p) => p.token === payload.token);
      if (!player) {
        socket.emit('session_expired');
        return;
      }

      if (player.disconnectTimer) {
        clearTimeout(player.disconnectTimer);
        player.disconnectTimer = undefined;
      }
      player.socketId = socket.id;
      player.connected = true;
      socketToSession.set(socket.id, { code, token: payload.token });
      socket.join(code);

      socket.emit('room_joined', { room: toPublicRoom(room), playerId: player.id });
      broadcastRoom(room);
      io.to(code).emit('player_reconnected', { playerId: player.id, name: player.name });

      if (room.status === 'playing' || room.status === 'paused') {
        sendCurrentQuestionToPlayer(room, player);
      }
    });

    socket.on(
      'update_room_settings',
      (payload: {
        code: string;
        subject?: SubjectId;
        gameType?: GameType;
        difficulty?: Difficulty;
        durationMinutes?: 1 | 2 | 3;
        questionMode?: QuestionMode;
        wrongPenalty?: boolean;
        mathInputMode?: MathInputMode;
        shuffleQuestions?: boolean;
      }) => {
        const session = socketToSession.get(socket.id);
        if (!session) return;
        const room = rooms.get(session.code);
        if (!room || room.hostToken !== session.token || room.status !== 'lobby') return;

        if (payload.subject) room.subject = payload.subject;
        if (payload.gameType) room.gameType = payload.gameType;
        if (payload.difficulty) room.difficulty = payload.difficulty;
        if (payload.durationMinutes) {
          room.durationMinutes = payload.durationMinutes;
          room.totalTime = payload.durationMinutes * 60;
          room.timeLeft = room.totalTime;
        }
        if (payload.questionMode) room.questionMode = payload.questionMode;
        if (typeof payload.wrongPenalty === 'boolean') room.wrongPenalty = payload.wrongPenalty;
        if (payload.mathInputMode) room.mathInputMode = payload.mathInputMode;
        if (typeof payload.shuffleQuestions === 'boolean') {
          room.shuffleQuestions = payload.shuffleQuestions;
        }

        broadcastRoom(room);
      }
    );

    socket.on('switch_side', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.status !== 'lobby') return;

      const me = room.players.find((p) => p.token === session.token);
      if (!me) return;

      const other = room.players.find((p) => p.token !== session.token);
      if (other) {
        // Swap sides cleanly between the 2 duelists (only host can trigger swap when full, or anyone swaps if empty)
        if (room.hostToken !== session.token) return;
        const prevSide = me.side;
        me.side = other.side;
        other.side = prevSide;
      } else {
        me.side = me.side === 'A' ? 'B' : 'A';
      }
      broadcastRoom(room);
    });

    socket.on('add_custom_question', (payload: CustomQuestionInput) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;

      const cleanText = String(payload.text ?? '').trim();
      if (
        !cleanText ||
        !Array.isArray(payload.options) ||
        payload.options.length !== 4 ||
        payload.options.some((o) => !String(o ?? '').trim())
      ) {
        return;
      }

      const newQ: ServerQuestion = {
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        subject: room.subject,
        text: cleanText,
        options: payload.options.map((o) => o.trim()) as [string, string, string, string],
        correctIndex: Math.min(3, Math.max(0, Number(payload.correctIndex) || 0)),
        difficulty: room.difficulty,
      };

      room.customQuestions.push(newQ);
      socket.emit('custom_questions_list', room.customQuestions);
      broadcastRoom(room);
    });

    socket.on('get_custom_questions', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;
      socket.emit('custom_questions_list', room.customQuestions);
    });

    socket.on('delete_custom_question', (payload: { questionId: string }) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;

      room.customQuestions = room.customQuestions.filter((q) => q.id !== payload.questionId);
      socket.emit('custom_questions_list', room.customQuestions);
      broadcastRoom(room);
    });

    socket.on('kick_player', (payload: { playerId: string }) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'lobby') return;

      const target = room.players.find((p) => p.id === payload.playerId && !p.isHost);
      if (!target) return;

      room.players = room.players.filter((p) => p.id !== target.id);
      socketToSession.delete(target.socketId);
      io.to(target.socketId).emit('kicked_from_room');
      const targetSocket = io.sockets.sockets.get(target.socketId);
      targetSocket?.leave(room.code);

      broadcastRoom(room);
    });

    socket.on('start_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'lobby') return;
      if (room.players.length < 2) {
        socket.emit('room_error', { code: 'need_two_players' });
        return;
      }
      startMatchCountdown(room);
    });

    socket.on(
      'submit_answer',
      (payload: { questionId: string; optionIndex?: number; numericValue?: number }) => {
        const session = socketToSession.get(socket.id);
        if (!session) return;
        const room = rooms.get(session.code);
        if (!room || room.status !== 'playing') return;

        const player = room.players.find((p) => p.token === session.token);
        if (!player) return;

        if (room.gameType === 'quick_answer') {
          if (room.quickRoundWinner) return;
          if (room.quickRoundLockedPlayerIds.includes(player.id)) return;

          const qIdx = Math.max(0, room.quickRound - 1);
          const q = room.deck[qIdx];
          if (!q || q.id !== payload.questionId) return;

          const isCorrect =
            typeof payload.numericValue === 'number' && typeof q.numericAnswer === 'number'
              ? payload.numericValue === q.numericAnswer
              : payload.optionIndex === q.correctIndex;

          if (isCorrect) {
            player.correctCount += 1;
            player.streak += 1;
            player.bestStreak = Math.max(player.bestStreak, player.streak);
            const streakBonus = player.streak > 0 && player.streak % 3 === 0 ? 5 : 0;
            const pointsDelta = 10 + streakBonus;
            player.score += pointsDelta;

            room.quickRoundWinner = {
              playerId: player.id,
              name: player.name,
              avatar: player.avatar,
              side: player.side,
            };

            socket.emit('answer_result', {
              questionId: q.id,
              correct: true,
              pointsDelta,
              streakBonus,
              newScore: player.score,
              streak: player.streak,
              correctIndex: q.correctIndex,
            });

            broadcastRoom(room);

            room.roundAdvanceTimeout = setTimeout(() => {
              advanceQuickRound(room);
            }, 1400);
          } else {
            player.wrongCount += 1;
            player.streak = 0;
            const penalty = room.wrongPenalty ? -2 : 0;
            player.score = Math.max(0, player.score + penalty);
            room.quickRoundLockedPlayerIds.push(player.id);

            socket.emit('answer_result', {
              questionId: q.id,
              correct: false,
              pointsDelta: penalty,
              streakBonus: 0,
              newScore: player.score,
              streak: 0,
              correctIndex: q.correctIndex,
            });

            broadcastRoom(room);

            if (room.quickRoundLockedPlayerIds.length >= room.players.length) {
              room.roundAdvanceTimeout = setTimeout(() => {
                advanceQuickRound(room);
              }, 1100);
            }
          }
          return;
        }

        // Individual-paced modes: subject_battle, tug_of_war, race
        if (player.answeredQuestionIds.has(payload.questionId)) return;
        const currentQ = ensurePlayerQuestion(room, player);
        if (currentQ.id !== payload.questionId) return;

        player.answeredQuestionIds.add(currentQ.id);

        const isCorrect =
          typeof payload.numericValue === 'number' && typeof currentQ.numericAnswer === 'number'
            ? payload.numericValue === currentQ.numericAnswer
            : payload.optionIndex === currentQ.correctIndex;

        let pointsDelta = 0;
        let streakBonus = 0;

        if (isCorrect) {
          player.correctCount += 1;
          player.streak += 1;
          player.bestStreak = Math.max(player.bestStreak, player.streak);
          streakBonus = player.streak > 0 && player.streak % 3 === 0 ? 5 : 0;
          pointsDelta = 10 + streakBonus;
          player.score += pointsDelta;

          if (room.gameType === 'tug_of_war') {
            room.ropePosition += player.side === 'A' ? -1 : 1;
            room.ropePosition = Math.max(-room.ropeLimit, Math.min(room.ropeLimit, room.ropePosition));
          } else if (room.gameType === 'race') {
            const stepGain =
              room.difficulty === 'easy' ? 1 : room.difficulty === 'medium' ? 2 : 3;
            player.progress = Math.min(room.raceFinishLine, player.progress + stepGain);
          }
        } else {
          player.wrongCount += 1;
          player.streak = 0;
          pointsDelta = room.wrongPenalty ? -2 : 0;
          player.score = Math.max(0, player.score + pointsDelta);

          if (room.gameType === 'tug_of_war') {
            // Wrong answer slips rope toward rival
            room.ropePosition += player.side === 'A' ? 1 : -1;
            room.ropePosition = Math.max(-room.ropeLimit, Math.min(room.ropeLimit, room.ropePosition));
          }
        }

        socket.emit('answer_result', {
          questionId: currentQ.id,
          correct: isCorrect,
          pointsDelta,
          streakBonus,
          newScore: player.score,
          streak: player.streak,
          correctIndex: currentQ.correctIndex,
        });

        broadcastRoom(room);

        // Check immediate win conditions
        if (room.gameType === 'tug_of_war') {
          if (room.ropePosition <= -room.ropeLimit) {
            finishGame(room, 'A', 'rope');
            return;
          }
          if (room.ropePosition >= room.ropeLimit) {
            finishGame(room, 'B', 'rope');
            return;
          }
        } else if (room.gameType === 'race') {
          if (player.progress >= room.raceFinishLine) {
            finishGame(room, player.side, 'race');
            return;
          }
        }

        player.questionCursor += 1;
        setTimeout(() => {
          if (rooms.has(room.code) && room.status === 'playing') {
            sendCurrentQuestionToPlayer(room, player);
          }
        }, 850);
      }
    );

    socket.on('pause_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'playing') return;
      room.status = 'paused';
      broadcastRoom(room);
    });

    socket.on('resume_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'paused') return;
      room.status = 'playing';
      broadcastRoom(room);

      // Pauza paytida o'tib ketgan "keyingi savol" taymerlari bekor bo'lgan,
      // shuning uchun o'yinni davom ettirganda savollarni qayta sinxronlaymiz.
      if (room.roundAdvanceTimeout) {
        clearTimeout(room.roundAdvanceTimeout);
        room.roundAdvanceTimeout = undefined;
      }
      if (room.gameType === 'quick_answer') {
        const allLocked = room.quickRoundLockedPlayerIds.length >= room.players.length;
        if (room.quickRoundWinner || allLocked) {
          advanceQuickRound(room);
        } else {
          sendSharedQuickQuestion(room);
        }
      } else {
        for (const p of room.players) {
          sendCurrentQuestionToPlayer(room, p);
        }
      }
    });

    socket.on('end_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;
      if (room.status === 'playing' || room.status === 'paused' || room.status === 'countdown') {
        finishGame(room, null, 'host_ended');
      }
    });

    socket.on('play_again', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'finished') return;
      if (room.players.length < 2) return;
      startMatchCountdown(room);
    });

    socket.on('return_to_lobby', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;

      clearRoomTimers(room);
      room.status = 'lobby';
      room.timeLeft = room.durationMinutes * 60;
      room.totalTime = room.timeLeft;
      room.ropePosition = 0;
      room.quickRound = 1;
      room.quickRoundWinner = null;
      room.quickRoundLockedPlayerIds = [];
      room.winner = null;
      room.mvpPlayerId = null;
      room.winReason = null;

      for (const p of room.players) {
        p.score = 0;
        p.correctCount = 0;
        p.wrongCount = 0;
        p.streak = 0;
        p.bestStreak = 0;
        p.progress = 0;
      }

      broadcastRoom(room);
    });

    socket.on('leave_room', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      socketToSession.delete(socket.id);
      socket.leave(session.code);
      if (!room) return;

      const leavingPlayer = room.players.find((p) => p.token === session.token);
      if (!leavingPlayer) return;
      if (leavingPlayer.disconnectTimer) clearTimeout(leavingPlayer.disconnectTimer);

      if (leavingPlayer.isHost) {
        clearRoomTimers(room);
        io.to(room.code).emit('room_closed', { reason: 'host_left' });
        rooms.delete(room.code);
        return;
      }

      room.players = room.players.filter((p) => p.token !== session.token);
      if (room.status === 'playing' || room.status === 'paused' || room.status === 'countdown') {
        finishGame(room, room.players[0]?.side ?? null, 'host_ended');
      } else {
        broadcastRoom(room);
      }
    });

    socket.on('disconnect', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      socketToSession.delete(socket.id);
      const room = rooms.get(session.code);
      if (!room) return;

      const player = room.players.find((p) => p.token === session.token);
      if (!player) return;

      player.connected = false;
      broadcastRoom(room);
      io.to(room.code).emit('player_disconnected', { playerId: player.id, name: player.name });

      player.disconnectTimer = setTimeout(() => {
        const currentRoom = rooms.get(session.code);
        if (!currentRoom) return;
        const p = currentRoom.players.find((item) => item.token === session.token);
        if (!p || p.connected) return;

        if (p.isHost) {
          clearRoomTimers(currentRoom);
          io.to(currentRoom.code).emit('room_closed', { reason: 'host_left' });
          rooms.delete(currentRoom.code);
        } else {
          currentRoom.players = currentRoom.players.filter((item) => item.token !== session.token);
          if (currentRoom.status === 'lobby') {
            broadcastRoom(currentRoom);
          } else {
            finishGame(currentRoom, currentRoom.players[0]?.side ?? null, 'host_ended');
          }
        }
      }, 30000);
    });
  });
}
