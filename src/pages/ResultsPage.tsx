import confetti from 'canvas-confetti';
import { Crown, Home, LayoutGrid, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function ResultsPage() {
  const { language, room, playerId } = useGameStore();
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!room || room.status !== 'finished') return;
    if (room.winner !== 'draw') {
      try {
        confetti({
          particleCount: 95,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti failures
      }
    }
  }, [room?.status, room?.winner]);

  if (!room) return null;

  const isHost = playerId === room.hostId;
  const playerA = room.players.find((p) => p.side === 'A');
  const playerB = room.players.find((p) => p.side === 'B');
  const winnerPlayer =
    room.winner === 'A' ? playerA : room.winner === 'B' ? playerB : null;
  const subjectMeta = SUBJECTS.find((s) => s.id === room.subject);

  const reasonMap = {
    score: t.winReasonScore,
    rope: t.winReasonRope,
    race: t.winReasonRace,
    rounds: t.winReasonRounds,
    accuracy: t.winReasonAccuracy,
    host_ended: t.winReasonHostEnded,
    draw: '',
  };

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-6"
    >
      {/* Winner Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
          {room.winner === 'draw' ? (
            <span className="text-4xl">🤝</span>
          ) : (
            <Trophy className="h-9 w-9" />
          )}
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          {subjectMeta?.emoji} {t.subjects[room.subject].name} · {t.games[room.gameType].name}
        </p>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          {room.winner === 'draw'
            ? t.resultsDraw
            : `${t.resultsWinnerPrefix} ${winnerPlayer?.avatar ?? ''} ${winnerPlayer?.name ?? ''}!`}
        </h1>

        {room.winReason && reasonMap[room.winReason] && (
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {reasonMap[room.winReason]}
          </p>
        )}

        {/* 1v1 Score Comparison */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {[playerA, playerB].map((p, idx) => {
            if (!p) return null;
            const isBlue = p.side === 'A';
            const isWin = room.winner === p.side;
            return (
              <div
                key={p.id || idx}
                className={`rounded-2xl border-2 p-5 transition-all ${
                  isWin
                    ? isBlue
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                      : 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="text-left">
                      <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBlue ? t.player1Label : t.player2Label}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-display text-3xl font-extrabold tabular-nums ${
                      isBlue
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {p.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Duel Statistics Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60">
                <th className="px-5 py-3.5">{t.playerCol}</th>
                <th className="px-4 py-3.5 text-right">{t.correctCol}</th>
                <th className="px-4 py-3.5 text-right">{t.wrongCol}</th>
                <th className="px-4 py-3.5 text-right">{t.accuracyCol}</th>
                <th className="px-4 py-3.5 text-right">{t.streakCol}</th>
                <th className="px-5 py-3.5 text-right">{t.scoreCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
              {sortedPlayers.map((p) => {
                const totalAns = p.correctCount + p.wrongCount;
                const accuracy =
                  totalAns === 0 ? 0 : Math.round((p.correctCount / totalAns) * 100);
                const isMvp = p.id === room.mvpPlayerId && room.winner !== 'draw';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5 font-display font-bold text-slate-900 dark:text-white">
                            <span>{p.name}</span>
                            {isMvp && (
                              <span
                                title={t.mvpLabel}
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-500"
                              >
                                <Crown className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          {p.id === playerId && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {t.youBadge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {p.correctCount}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                      {p.wrongCount}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {accuracy}%
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {p.bestStreak}
                    </td>
                    <td className="px-5 py-4 text-right font-display text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
                      {p.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {isHost && (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.playAgain();
              }}
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t.playAgain}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.returnToLobby();
              }}
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 font-display text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>{t.changeGameReturnLobby}</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.click();
            socketActions.leaveRoom();
          }}
          className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 font-display text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Home className="h-4 w-4" />
          <span>{t.backHome}</span>
        </button>
      </div>
    </motion.main>
  );
}
