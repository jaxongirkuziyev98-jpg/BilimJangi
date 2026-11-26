import { Server, Socket } from 'socket.io';
import { getLevelFromXp, pickRandomWinnerGift } from '../shared/gifts';
import { getCountryNameById } from '../shared/mapCountries';
import { getMatchQuestions, toPublicQuestion } from '../shared/questions';
import {
  AnswerAttempt,
  CustomQuestionInput,
  Difficulty,
  DuelSide,
  GameType,
  GiftReward,
  IncomingGameInvite,
  Language,
  LeaderboardEntry,
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
  attempts: AnswerAttempt[];
  earnedGift?: GiftReward | null;
  earnedXp?: number;
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
  winnerGift: GiftReward | null;
  matchId: string;
  timerInterval?: NodeJS.Timeout;
  countdownTimeout?: NodeJS.Timeout;
  roundAdvanceTimeout?: NodeJS.Timeout;
}

interface RegistryRecord extends LeaderboardEntry {
  socketIds: Set<string>;
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

function toPublicPlayer(p: InternalPlayer, includeAttempts = false): Player {
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
    ...(includeAttempts ? { attempts: p.attempts, earnedGift: p.earnedGift, earnedXp: p.earnedXp } : {}),
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
    players: room.players.map((p) => toPublicPlayer(p, room.status === 'finished')),
    customQuestionsCount: room.customQuestions.length,
    winner: room.winner,
    mvpPlayerId: room.mvpPlayerId,
    winReason: room.winReason,
    winnerGift: room.winnerGift,
    matchId: room.matchId,
  };
}

export function attachGameServer(
  io: Server
): { getLeaderboard: () => LeaderboardEntry[] } {
  const rooms = new Map<string, InternalRoom>();
  const socketToSession = new Map<string, { code: string; token: string }>();
  const socketToToken = new Map<string, string>();
  const playerRegistry = new Map<string, RegistryRecord>();

  // Built-in AI sparring partner entry (playable bot opponent)
  playerRegistry.set('bilimbot_ai', {
    playerToken: 'bilimbot_ai',
    fullName: 'BilimBot AI',
    firstName: 'BilimBot',
    lastName: 'AI',
    avatar: '🤖',
    favoriteSubject: 'math',
    xp: 240,
    level: getLevelFromXp(240).level,
    wins: 2,
    matchesPlayed: 4,
    correctTotal: 22,
    wrongTotal: 6,
    giftsCount: 2,
    online: true,
    isBot: true,
    socketIds: new Set<string>(),
  });

  function getSortedLeaderboard(): LeaderboardEntry[] {
    const entries = Array.from(playerRegistry.values())
      .map((rec) => {
        const roomEntry = Array.from(rooms.values()).find(
          (r) => r.status === 'lobby' && r.players.some((p) => p.token === rec.playerToken)
        );
        return {
          playerToken: rec.playerToken,
          fullName: rec.fullName,
          firstName: rec.firstName,
          lastName: rec.lastName,
          avatar: rec.avatar,
          favoriteSubject: rec.favoriteSubject,
          xp: rec.xp,
          level: getLevelFromXp(rec.xp).level,
          wins: rec.wins,
          matchesPlayed: rec.matchesPlayed,
          correctTotal: rec.correctTotal,
          wrongTotal: rec.wrongTotal,
          giftsCount: rec.giftsCount,
          online: rec.isBot ? true : rec.socketIds.size > 0,
          isBot: rec.isBot,
          inRoomCode: roomEntry?.code,
        } satisfies LeaderboardEntry;
      })
      .sort((a, b) => b.xp - a.xp || b.wins - a.wins || b.correctTotal - a.correctTotal);

    return entries.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  function broadcastLeaderboard(): void {
    io.emit('leaderboard_update', getSortedLeaderboard());
  }

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
      const more = getMatchQuestions(
        room.gameType,
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
        const more = getMatchQuestions(
          room.gameType,
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
      const more = getMatchQuestions(
        room.gameType,
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
    room.winnerGift = finalWinner !== 'draw' ? pickRandomWinnerGift(Date.now()) : null;
    room.matchId = `match_${room.code}_${Date.now()}`;

    for (const p of room.players) {
      const isWinner = finalWinner !== 'draw' && p.side === finalWinner;
      const isMvp = mvp?.id === p.id && finalWinner !== 'draw';
      const giftBonus = isWinner && room.winnerGift ? room.winnerGift.xpBonus : 0;
      const xpEarned =
        15 +
        p.correctCount * 10 +
        (isWinner ? 50 + giftBonus : 0) +
        (isMvp ? 25 : 0);

      p.earnedGift = isWinner ? room.winnerGift : null;
      p.earnedXp = xpEarned;

      if (!p.isBot) {
        const existing = playerRegistry.get(p.token);
        if (existing) {
          existing.xp += xpEarned;
          existing.level = getLevelFromXp(existing.xp).level;
          existing.matchesPlayed += 1;
          if (isWinner) existing.wins += 1;
          existing.correctTotal += p.correctCount;
          existing.wrongTotal += p.wrongCount;
          if (isWinner && room.winnerGift) existing.giftsCount += 1;
          existing.favoriteSubject = room.subject;
        }
      } else {
        const botRec = playerRegistry.get('bilimbot_ai');
        if (botRec && p.id === room.players.find((rp) => rp.isBot)?.id) {
          botRec.xp += xpEarned;
          botRec.level = getLevelFromXp(botRec.xp).level;
          botRec.matchesPlayed += 1;
          if (isWinner) botRec.wins += 1;
          botRec.correctTotal += p.correctCount;
          botRec.wrongTotal += p.wrongCount;
          if (isWinner && room.winnerGift) botRec.giftsCount += 1;
        }
      }
    }

    const pub = toPublicRoom(room);
    io.to(room.code).emit('room_state', pub);
    io.to(room.code).emit('game_ended', pub);
    broadcastLeaderboard();
  }

  function evaluateQuestionAnswer(
    q: ServerQuestion,
    payload: {
      optionIndex?: number;
      numericValue?: number;
      countryId?: string;
      textAnswer?: string;
      language?: Language;
    }
  ): boolean {
    if (q.mapCountryId && typeof payload.countryId === 'string') {
      return payload.countryId === q.mapCountryId;
    }
    if (q.zoomWord && typeof payload.textAnswer === 'string') {
      const normalized = payload.textAnswer.trim().toUpperCase();
      return Object.values(q.zoomWord).some((w) => w.toUpperCase() === normalized);
    }
    if (typeof payload.numericValue === 'number' && typeof q.numericAnswer === 'number') {
      return payload.numericValue === q.numericAnswer;
    }
    return payload.optionIndex === q.correctIndex;
  }

  function recordAttempt(
    room: InternalRoom,
    player: InternalPlayer,
    q: ServerQuestion,
    payload: {
      optionIndex?: number;
      numericValue?: number;
      countryId?: string;
      textAnswer?: string;
      language?: Language;
    },
    isCorrect: boolean
  ): void {
    if (player.isBot) return;
    const lang: Language = payload.language || 'uz';
    const isNumeric = typeof payload.numericValue === 'number' && typeof q.numericAnswer === 'number';
    const isMap = Boolean(q.mapCountryId && typeof payload.countryId === 'string');
    const isZoom = Boolean(q.zoomWord);

    let chosenIndex = -1;
    let chosenText = '—';
    let correctText = q.options[q.correctIndex] ?? '';

    if (isMap) {
      chosenIndex = isCorrect ? q.correctIndex : -1;
      chosenText = getCountryNameById(payload.countryId, lang) || String(payload.countryId);
      correctText = getCountryNameById(q.mapCountryId, lang) || correctText;
    } else if (isZoom && q.zoomWord) {
      chosenIndex = isCorrect ? 0 : -1;
      chosenText = String(payload.textAnswer ?? '').trim().toUpperCase() || '—';
      correctText = q.zoomWord[lang];
    } else if (isNumeric) {
      chosenIndex = isCorrect ? q.correctIndex : -1;
      chosenText = String(payload.numericValue);
      correctText = String(q.numericAnswer);
    } else {
      chosenIndex = typeof payload.optionIndex === 'number' ? payload.optionIndex : -1;
      chosenText = q.options[chosenIndex] ?? '—';
    }

    player.attempts.push({
      questionId: q.id,
      subject: room.subject,
      text: q.text,
      options: q.options,
      chosenIndex,
      chosenText,
      correctIndex: q.correctIndex,
      correctText,
      correct: isCorrect,
      localized: q.localized,
    });
  }

  function processPlayerAnswer(
    room: InternalRoom,
    player: InternalPlayer,
    payload: {
      questionId: string;
      optionIndex?: number;
      numericValue?: number;
      countryId?: string;
      textAnswer?: string;
      language?: Language;
    },
    emitterSocket?: Socket
  ): void {
    if (room.status !== 'playing') return;

    if (room.gameType === 'quick_answer') {
      if (room.quickRoundWinner) return;
      if (room.quickRoundLockedPlayerIds.includes(player.id)) return;

      const qIdx = Math.max(0, room.quickRound - 1);
      const q = room.deck[qIdx];
      if (!q || q.id !== payload.questionId) return;

      const isCorrect = evaluateQuestionAnswer(q, payload);
      recordAttempt(room, player, q, payload, isCorrect);

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
          correctCountryId: q.mapCountryId,
          chosenCountryId: payload.countryId,
          correctWord: q.zoomWord?.[payload.language || 'uz'],
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
          correctCountryId: q.mapCountryId,
          chosenCountryId: payload.countryId,
          correctWord: q.zoomWord?.[payload.language || 'uz'],
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

    // Individual-paced modes: subject_battle, tug_of_war, race, map_hunt, zoom_guess, true_false
    if (player.answeredQuestionIds.has(payload.questionId)) return;
    const currentQ = ensurePlayerQuestion(room, player);
    if (currentQ.id !== payload.questionId) return;

    player.answeredQuestionIds.add(currentQ.id);

    const isCorrect = evaluateQuestionAnswer(currentQ, payload);
    recordAttempt(room, player, currentQ, payload, isCorrect);

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
      correctCountryId: currentQ.mapCountryId,
      chosenCountryId: payload.countryId,
      correctWord: currentQ.zoomWord?.[payload.language || 'uz'],
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
      const revealPause = currentQ.mapCountryId || currentQ.zoomWord ? 1150 : 850;
      setTimeout(() => {
        if (rooms.has(room.code) && room.status === 'playing') {
          sendCurrentQuestionToPlayer(room, player);
        }
      }, revealPause);
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

      const buildBotPayload = (q: ServerQuestion) => {
        if (q.mapCountryId) {
          return {
            questionId: q.id,
            countryId: pickCorrect ? q.mapCountryId : '000',
          };
        }
        if (q.zoomWord) {
          return {
            questionId: q.id,
            textAnswer: pickCorrect ? q.zoomWord.uz : 'WRONG',
          };
        }
        const optCount = q.isTrueFalse ? 2 : 4;
        const wrongIdx = (q.correctIndex + 1 + Math.floor(Math.random() * (optCount - 1))) % optCount;
        return {
          questionId: q.id,
          optionIndex: pickCorrect ? q.correctIndex : wrongIdx,
        };
      };

      if (room.gameType === 'quick_answer') {
        const qIdx = Math.max(0, room.quickRound - 1);
        const q = room.deck[qIdx];
        if (
          q &&
          !room.quickRoundWinner &&
          !room.quickRoundLockedPlayerIds.includes(bot.id)
        ) {
          processPlayerAnswer(room, bot, buildBotPayload(q));
        }
        return;
      }

      const currentQ = ensurePlayerQuestion(room, bot);
      processPlayerAnswer(room, bot, buildBotPayload(currentQ));

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
    room.winnerGift = null;
    room.matchId = `match_${room.code}_${Date.now()}`;

    room.deck = getMatchQuestions(
      room.gameType,
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
      p.attempts = [];
      p.earnedGift = null;
      p.earnedXp = 0;
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
      'register_profile',
      (payload: {
        token: string;
        firstName: string;
        lastName: string;
        fullName: string;
        avatar: string;
        favoriteSubject: SubjectId;
        xp?: number;
        wins?: number;
        matchesPlayed?: number;
        correctTotal?: number;
        wrongTotal?: number;
        giftsCount?: number;
      }) => {
        const token = String(payload.token || socket.id).trim();
        const firstName = String(payload.firstName || '').trim().slice(0, 20);
        const lastName = String(payload.lastName || '').trim().slice(0, 20);
        const fullName = String(payload.fullName || `${firstName} ${lastName}`)
          .trim()
          .slice(0, 36);
        if (fullName.length < 2) return;

        socketToToken.set(socket.id, token);
        const existing = playerRegistry.get(token);

        if (existing) {
          existing.firstName = firstName || existing.firstName;
          existing.lastName = lastName || existing.lastName;
          existing.fullName = fullName;
          existing.avatar = payload.avatar || existing.avatar;
          existing.favoriteSubject = payload.favoriteSubject || existing.favoriteSubject;
          existing.xp = Math.max(existing.xp, Number(payload.xp) || 0);
          existing.wins = Math.max(existing.wins, Number(payload.wins) || 0);
          existing.matchesPlayed = Math.max(
            existing.matchesPlayed,
            Number(payload.matchesPlayed) || 0
          );
          existing.correctTotal = Math.max(
            existing.correctTotal,
            Number(payload.correctTotal) || 0
          );
          existing.wrongTotal = Math.max(existing.wrongTotal, Number(payload.wrongTotal) || 0);
          existing.giftsCount = Math.max(existing.giftsCount, Number(payload.giftsCount) || 0);
          existing.level = getLevelFromXp(existing.xp).level;
          existing.online = true;
          existing.socketIds.add(socket.id);
        } else {
          const xp = Math.max(0, Number(payload.xp) || 0);
          playerRegistry.set(token, {
            playerToken: token,
            firstName: firstName || fullName,
            lastName,
            fullName,
            avatar: payload.avatar || '🦁',
            favoriteSubject: payload.favoriteSubject || 'math',
            xp,
            level: getLevelFromXp(xp).level,
            wins: Math.max(0, Number(payload.wins) || 0),
            matchesPlayed: Math.max(0, Number(payload.matchesPlayed) || 0),
            correctTotal: Math.max(0, Number(payload.correctTotal) || 0),
            wrongTotal: Math.max(0, Number(payload.wrongTotal) || 0),
            giftsCount: Math.max(0, Number(payload.giftsCount) || 0),
            online: true,
            socketIds: new Set([socket.id]),
          });
        }

        broadcastLeaderboard();
      }
    );

    socket.on('update_favorite_subject', (payload: { token: string; subject: SubjectId }) => {
      const rec = playerRegistry.get(payload.token);
      if (rec) {
        rec.favoriteSubject = payload.subject;
        broadcastLeaderboard();
      }
    });

    socket.on('get_leaderboard', () => {
      socket.emit('leaderboard_update', getSortedLeaderboard());
    });

    socket.on(
      'send_game_invite',
      (payload: { targetToken: string; subject?: SubjectId; gameType?: GameType }) => {
        const senderToken = socketToToken.get(socket.id);
        const senderRec = senderToken ? playerRegistry.get(senderToken) : undefined;
        if (!senderToken || !senderRec) return;

        // Check if sender already hosts or is in a lobby room
        const existingSession = socketToSession.get(socket.id);
        let room = existingSession ? rooms.get(existingSession.code) : undefined;

        if (!room || room.status !== 'lobby') {
          const code = generateRoomCode(new Set(rooms.keys()));
          const hostPlayer: InternalPlayer = {
            id: `p_${Math.random().toString(36).slice(2, 10)}`,
            token: senderToken,
            socketId: socket.id,
            name: senderRec.fullName,
            avatar: senderRec.avatar,
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
            attempts: [],
          };

          room = {
            code,
            hostToken: senderToken,
            subject: payload.subject || senderRec.favoriteSubject || 'math',
            difficulty: 'medium',
            durationMinutes: 2,
            gameType: payload.gameType || 'tug_of_war',
            questionMode: 'auto',
            wrongPenalty: false,
            mathInputMode: 'choice',
            shuffleQuestions: true,
            status: 'lobby',
            timeLeft: 120,
            totalTime: 120,
            ropePosition: 0,
            ropeLimit: 8,
            raceFinishLine: 20,
            quickRound: 1,
            quickTotalRounds: 10,
            quickRoundWinner: null,
            quickRoundLockedPlayerIds: [],
            players: [hostPlayer],
            customQuestions: [],
            deck: [],
            winner: null,
            mvpPlayerId: null,
            winReason: null,
            winnerGift: null,
            matchId: `match_${code}_${Date.now()}`,
          };

          rooms.set(code, room);
          socketToSession.set(socket.id, { code, token: senderToken });
          socket.join(code);
          socket.emit('room_created', { room: toPublicRoom(room), playerId: hostPlayer.id });
        }

        // If inviting BilimBot directly, add BilimBot to Team B
        if (payload.targetToken === 'bilimbot_ai') {
          if (!room.players.some((p) => p.isBot)) {
            const botPlayer: InternalPlayer = {
              id: `bot_${Math.random().toString(36).slice(2, 9)}`,
              token: `bot_tok_${Date.now()}_0`,
              socketId: '',
              name: BOT_NAMES[0],
              avatar: BOT_AVATARS[0],
              side: 'B',
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
              attempts: [],
            };
            room.players.push(botPlayer);
            broadcastRoom(room);
          }
          socket.emit('invite_sent', {
            roomCode: room.code,
            targetName: 'BilimBot AI',
            delivered: true,
          });
          broadcastLeaderboard();
          return;
        }

        const targetRec = playerRegistry.get(payload.targetToken);
        const invitePayload: IncomingGameInvite = {
          inviteId: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          fromToken: senderToken,
          fromName: senderRec.fullName,
          fromAvatar: senderRec.avatar,
          roomCode: room.code,
          subject: room.subject,
          gameType: room.gameType,
          createdAt: Date.now(),
        };

        let delivered = false;
        if (targetRec && targetRec.socketIds.size > 0) {
          for (const targetSid of targetRec.socketIds) {
            io.to(targetSid).emit('incoming_invite', invitePayload);
            delivered = true;
          }
        }

        socket.emit('invite_sent', {
          roomCode: room.code,
          targetName: targetRec?.fullName ?? '',
          delivered,
        });
        broadcastLeaderboard();
      }
    );

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
        const cleanName = String(payload.name ?? '').trim().slice(0, 36);
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
          attempts: [],
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
          winnerGift: null,
          matchId: `match_${code}_${Date.now()}`,
        };

        rooms.set(code, room);
        socketToSession.set(socket.id, { code, token });
        socket.join(code);

        const reg = playerRegistry.get(token);
        if (reg) {
          reg.favoriteSubject = room.subject;
          broadcastLeaderboard();
        }

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

        const cleanName = String(payload.name ?? '').trim().slice(0, 36);
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
          attempts: [],
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
        attempts: [],
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
      (payload: {
        questionId: string;
        optionIndex?: number;
        numericValue?: number;
        countryId?: string;
        textAnswer?: string;
        language?: Language;
      }) => {
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
      room.winnerGift = null;

      for (const p of room.players) {
        p.score = 0;
        p.correctCount = 0;
        p.wrongCount = 0;
        p.streak = 0;
        p.bestStreak = 0;
        p.progress = 0;
        p.attempts = [];
        p.earnedGift = null;
        p.earnedXp = 0;
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
        broadcastLeaderboard();
        return;
      }

      room.players = room.players.filter((p) => p.token !== session.token);
      const humanCount = room.players.filter((p) => !p.isBot).length;
      if (humanCount === 0) {
        clearRoomTimers(room);
        rooms.delete(room.code);
        broadcastLeaderboard();
        return;
      }
      broadcastRoom(room);
    });

    socket.on('disconnect', () => {
      const tok = socketToToken.get(socket.id);
      socketToToken.delete(socket.id);
      if (tok) {
        const reg = playerRegistry.get(tok);
        if (reg) {
          reg.socketIds.delete(socket.id);
          reg.online = reg.socketIds.size > 0;
          broadcastLeaderboard();
        }
      }

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

  return {
    getLeaderboard: getSortedLeaderboard,
  };
}
