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
  botTimer?: NodeJS.Timeout;
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
const BOT_NAMES = ['BilimBot 🤖', 'Al-Xorazmiy Bot', 'SigmaBot', 'TurboBot'];
const BOT_AVATARS = ['🤖', '👾', '🦊', '🦉'];

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
    isBot: p.isBot,
    score: p.score,
    correctCount: p.correctCount,
    wrongCount: p.wrongCount,
    streak: p.streak,
    bestStreak: p.bestStreak,
    progress: p.progress,
    connected: p.connected,
  };
}

function getTeamTotals(room: InternalRoom) {
  let teamAScore = 0;
  let teamBScore = 0;
  let teamAProgress = 0;
  let teamBProgress = 0;
  let teamACorrect = 0;
  let teamBCorrect = 0;

  for (const p of room.players) {
    if (p.side === 'A') {
      teamAScore += p.score;
      teamAProgress += p.progress;
      teamACorrect += p.correctCount;
    } else {
      teamBScore += p.score;
      teamBProgress += p.progress;
      teamBCorrect += p.correctCount;
    }
  }

  return {
    teamAScore,
    teamBScore,
    teamAProgress,
    teamBProgress,
    teamACorrect,
    teamBCorrect,
  };
}

function toPublicRoom(room: InternalRoom): PublicRoomState {
  const host = room.players.find((p) => p.token === room.hostToken);
  const totals = getTeamTotals(room);

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
    teamAScore: totals.teamAScore,
    teamBScore: totals.teamBScore,
    teamAProgress: totals.teamAProgress,
    teamBProgress: totals.teamBProgress,
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

  function clearBotTimers(room: InternalRoom): void {
    for (const p of room.players) {
      if (p.botTimer) {
        clearTimeout(p.botTimer);
        p.botTimer = undefined;
      }
    }
  }

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
    clearBotTimers(room);
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
    if (player.isBot) return;
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

    const totals = getTeamTotals(room);
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
      } else if (totals.teamAScore > totals.teamBScore) {
        finalWinner = 'A';
        finalReason = 'score';
      } else if (totals.teamBScore > totals.teamAScore) {
        finalWinner = 'B';
        finalReason = 'score';
      } else {
        finalWinner = 'draw';
        finalReason = 'draw';
      }
    } else if (room.gameType === 'race') {
      if (totals.teamAProgress > totals.teamBProgress) {
        finalWinner = 'A';
        finalReason = 'race';
      } else if (totals.teamBProgress > totals.teamAProgress) {
        finalWinner = 'B';
        finalReason = 'race';
      } else if (totals.teamAScore > totals.teamBScore) {
        finalWinner = 'A';
        finalReason = 'score';
      } else if (totals.teamBScore > totals.teamAScore) {
        finalWinner = 'B';
        finalReason = 'score';
      } else {
        finalWinner = 'draw';
        finalReason = 'draw';
      }
    } else {
      if (totals.teamAScore > totals.teamBScore) {
        finalWinner = 'A';
        finalReason = room.gameType === 'quick_answer' ? 'rounds' : 'score';
      } else if (totals.teamBScore > totals.teamAScore) {
        finalWinner = 'B';
        finalReason = room.gameType === 'quick_answer' ? 'rounds' : 'score';
      } else if (totals.teamACorrect > totals.teamBCorrect) {
        finalWinner = 'A';
        finalReason = 'accuracy';
      } else if (totals.teamBCorrect > totals.teamACorrect) {
        finalWinner = 'B';
        finalReason = 'accuracy';
      } else {
        finalWinner = 'draw';
        finalReason = 'draw';
      }
    }

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

  function processPlayerAnswer(
    room: InternalRoom,
    player: InternalPlayer,
    payload: { questionId: string; optionIndex?: number; numericValue?: number },
    emitterSocket?: Socket
  ): void {
    if (room.status !== 'playing') return;

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

        emitterSocket?.emit('answer_result', {
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

        emitterSocket?.emit('answer_result', {
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
        player.progress += stepGain;
      }
    } else {
      player.wrongCount += 1;
      player.streak = 0;
      pointsDelta = room.wrongPenalty ? -2 : 0;
      player.score = Math.max(0, player.score + pointsDelta);

      if (room.gameType === 'tug_of_war') {
        room.ropePosition += player.side === 'A' ? 1 : -1;
        room.ropePosition = Math.max(-room.ropeLimit, Math.min(room.ropeLimit, room.ropePosition));
      }
    }

    emitterSocket?.emit('answer_result', {
      questionId: currentQ.id,
      correct: isCorrect,
      pointsDelta,
      streakBonus,
      newScore: player.score,
      streak: player.streak,
      correctIndex: currentQ.correctIndex,
    });

    broadcastRoom(room);

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
      const totals = getTeamTotals(room);
      if (totals.teamAProgress >= room.raceFinishLine) {
        finishGame(room, 'A', 'race');
        return;
      }
      if (totals.teamBProgress >= room.raceFinishLine) {
        finishGame(room, 'B', 'race');
        return;
      }
    }

    player.questionCursor += 1;
    if (!player.isBot) {
      setTimeout(() => {
        if (rooms.has(room.code) && room.status === 'playing') {
          sendCurrentQuestionToPlayer(room, player);
        }
      }, 850);
    }
  }

  function scheduleBotAnswer(room: InternalRoom, bot: InternalPlayer): void {
    if (bot.botTimer) {
      clearTimeout(bot.botTimer);
      bot.botTimer = undefined;
    }
    if (!bot.isBot || room.status !== 'playing') return;

    const minDelay = room.difficulty === 'easy' ? 4200 : room.difficulty === 'medium' ? 2900 : 1900;
    const maxDelay = room.difficulty === 'easy' ? 6800 : room.difficulty === 'medium' ? 4800 : 3400;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    bot.botTimer = setTimeout(() => {
      if (!rooms.has(room.code) || room.status !== 'playing') return;

      const accuracy = room.difficulty === 'easy' ? 0.62 : room.difficulty === 'medium' ? 0.78 : 0.9;
      const pickCorrect = Math.random() < accuracy;

      if (room.gameType === 'quick_answer') {
        const qIdx = Math.max(0, room.quickRound - 1);
        const q = room.deck[qIdx];
        if (
          q &&
          !room.quickRoundWinner &&
          !room.quickRoundLockedPlayerIds.includes(bot.id)
        ) {
          const wrongIdx = (q.correctIndex + 1 + Math.floor(Math.random() * 3)) % 4;
          processPlayerAnswer(room, bot, {
            questionId: q.id,
            optionIndex: pickCorrect ? q.correctIndex : wrongIdx,
          });
        }
        return;
      }

      const currentQ = ensurePlayerQuestion(room, bot);
      const wrongIdx = (currentQ.correctIndex + 1 + Math.floor(Math.random() * 3)) % 4;
      processPlayerAnswer(room, bot, {
        questionId: currentQ.id,
        optionIndex: pickCorrect ? currentQ.correctIndex : wrongIdx,
      });

      if (rooms.has(room.code) && room.status === 'playing') {
        scheduleBotAnswer(room, bot);
      }
    }, delay);
  }

  function scheduleAllBots(room: InternalRoom): void {
    for (const p of room.players) {
      if (p.isBot) {
        scheduleBotAnswer(room, p);
      }
    }
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
    scheduleAllBots(room);
  }

  function startMatchCountdown(room: InternalRoom): void {
    clearRoomTimers(room);

    // Ensure both sides have at least 1 participant if possible by balancing
    const sideACount = room.players.filter((p) => p.side === 'A').length;
    const sideBCount = room.players.filter((p) => p.side === 'B').length;
    if ((sideACount === 0 || sideBCount === 0) && room.players.length >= 2) {
      room.players.forEach((p, idx) => {
        p.side = idx % 2 === 0 ? 'A' : 'B';
      });
    }

    const finalA = room.players.filter((p) => p.side === 'A').length;
    const finalB = room.players.filter((p) => p.side === 'B').length;
    const maxTeamSize = Math.max(1, finalA, finalB);

    room.status = 'countdown';
    room.totalTime = room.durationMinutes * 60;
    room.timeLeft = room.totalTime;
    room.ropePosition = 0;
    room.ropeLimit = Math.max(8, Math.min(18, Math.round(room.players.length * 2.5)));
    room.raceFinishLine = Math.max(20, maxTeamSize * 15);
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
      60
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

      scheduleAllBots(room);

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

        const customList: ServerQuestion[] = (payload.customQuestions ?? []).map((q, idx) => ({
          id: `custom_${Date.now()}_${idx}`,
          subject: payload.subject,
          text: q.text.trim(),
          options: q.options,
          correctIndex: q.correctIndex,
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
          isBot: false,
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

        if (room.status !== 'lobby') {
          socket.emit('room_error', { code: 'room_already_started' });
          return;
        }

        const cleanName = String(payload.name ?? '').trim().slice(0, 15);
        if (cleanName.length < 2) {
          socket.emit('room_error', { code: 'invalid_name' });
          return;
        }

        // Auto-balance new joiner into whichever team currently has fewer players (unlimited cap!)
        const countA = room.players.filter((p) => p.side === 'A').length;
        const countB = room.players.filter((p) => p.side === 'B').length;
        const assignedSide: DuelSide = countB <= countA ? 'B' : 'A';

        const newPlayer: InternalPlayer = {
          id: `p_${Math.random().toString(36).slice(2, 10)}`,
          token,
          socketId: socket.id,
          name: cleanName,
          avatar: payload.avatar || '🐼',
          side: assignedSide,
          isHost: false,
          isBot: false,
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

    socket.on('switch_side', (payload?: { side?: DuelSide }) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.status !== 'lobby') return;

      const me = room.players.find((p) => p.token === session.token);
      if (!me) return;

      if (payload?.side === 'A' || payload?.side === 'B') {
        me.side = payload.side;
      } else {
        me.side = me.side === 'A' ? 'B' : 'A';
      }
      broadcastRoom(room);
    });

    socket.on('shuffle_teams', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'lobby') return;

      const shuffled = [...room.players].sort(() => Math.random() - 0.5);
      shuffled.forEach((p, idx) => {
        p.side = idx % 2 === 0 ? 'A' : 'B';
      });
      broadcastRoom(room);
    });

    socket.on('add_bot', (payload?: { side?: DuelSide }) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'lobby') return;

      const existingBotsCount = room.players.filter((p) => p.isBot).length;
      const countA = room.players.filter((p) => p.side === 'A').length;
      const countB = room.players.filter((p) => p.side === 'B').length;
      const side: DuelSide =
        payload?.side === 'A' || payload?.side === 'B'
          ? payload.side
          : countB <= countA
            ? 'B'
            : 'A';

      const botName =
        existingBotsCount === 0
          ? BOT_NAMES[0]
          : `${BOT_NAMES[existingBotsCount % BOT_NAMES.length]} #${existingBotsCount + 1}`;
      const botAvatar = BOT_AVATARS[existingBotsCount % BOT_AVATARS.length];

      const botPlayer: InternalPlayer = {
        id: `bot_${Math.random().toString(36).slice(2, 9)}`,
        token: `bot_tok_${Date.now()}_${existingBotsCount}`,
        socketId: '',
        name: botName,
        avatar: botAvatar,
        side,
        isHost: false,
        isBot: true,
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

      room.players.push(botPlayer);
      io.to(room.code).emit('player_joined', toPublicPlayer(botPlayer));
      broadcastRoom(room);
    });

    socket.on('add_custom_question', (payload: CustomQuestionInput) => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;

      const cleanText = String(payload.text ?? '').trim();
      if (!cleanText || payload.options.some((o) => !String(o).trim())) return;

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
      if (target.botTimer) clearTimeout(target.botTimer);

      room.players = room.players.filter((p) => p.id !== target.id);
      if (!target.isBot) {
        socketToSession.delete(target.socketId);
        io.to(target.socketId).emit('kicked_from_room');
        const targetSocket = io.sockets.sockets.get(target.socketId);
        targetSocket?.leave(room.code);
      }

      broadcastRoom(room);
    });

    socket.on('start_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token) return;
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

        processPlayerAnswer(room, player, payload, socket);
      }
    );

    socket.on('pause_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'playing') return;
      room.status = 'paused';
      clearBotTimers(room);
      broadcastRoom(room);
    });

    socket.on('resume_game', () => {
      const session = socketToSession.get(socket.id);
      if (!session) return;
      const room = rooms.get(session.code);
      if (!room || room.hostToken !== session.token || room.status !== 'paused') return;
      room.status = 'playing';
      broadcastRoom(room);
      scheduleAllBots(room);
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
      if (!room || room.hostToken !== session.token) return;
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
      const humanCount = room.players.filter((p) => !p.isBot).length;
      if (humanCount === 0) {
        clearRoomTimers(room);
        rooms.delete(room.code);
        return;
      }
      broadcastRoom(room);
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
          broadcastRoom(currentRoom);
        }
      }, 30000);
    });
  });
}
