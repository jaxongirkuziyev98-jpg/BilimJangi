import confetti from 'canvas-confetti';
import { Award, Crown, Gift, Home, LayoutGrid, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { AiMistakeTutor } from '../components/AiMistakeTutor';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function ResultsPage() {
  const { language, room, playerId, setScreen } = useGameStore();
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
  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const subjectMeta = SUBJECTS.find((s) => s.id === room.subject);
  const myPlayer = room.players.find((p) => p.id === playerId);
  const didIWin = Boolean(myPlayer && room.winner !== 'draw' && myPlayer.side === room.winner);
  const awardedGift = myPlayer?.earnedGift ?? (didIWin ? room.winnerGift : null);

  let headline = t.resultsDraw;
  if (room.winner === 'A') {
    headline =
      teamA.length === 1
        ? `${t.resultsWinnerPrefix} ${teamA[0].avatar} ${teamA[0].name}!`
        : `🏆 ${t.resultsTeamAWon}`;
  } else if (room.winner === 'B') {
    headline =
      teamB.length === 1
        ? `${t.resultsWinnerPrefix} ${teamB[0].avatar} ${teamB[0].name}!`
        : `🏆 ${t.resultsTeamBWon}`;
  }

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
      className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10 space-y-5 sm:space-y-6"
    >
      {/* Winner Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
          {room.winner === 'draw' ? (
            <span className="text-3xl sm:text-4xl">🤝</span>
          ) : (
            <Trophy className="h-7 w-7 sm:h-9 sm:w-9" />
          )}
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
          {subjectMeta?.emoji} {t.subjects[room.subject].name} · {t.games[room.gameType].name}
        </p>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {headline}
        </h1>

        {room.winReason && reasonMap[room.winReason] && (
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-300">
            {reasonMap[room.winReason]}
          </p>
        )}

        {/* Winner Gift Reveal & XP Reward */}
        {(awardedGift || (myPlayer?.earnedXp ?? 0) > 0) && (
          <div className="mt-5 mx-auto max-w-lg rounded-2xl border border-amber-300 dark:border-amber-700/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/30 p-4 text-left shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-3xl">
                  {awardedGift ? awardedGift.icon : <Sparkles className="h-6 w-6 text-amber-500" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Gift className="h-3.5 w-3.5" />
                    <span>{awardedGift ? t.winnerGiftTitle : t.xpEarnedLabel}</span>
                  </div>
                  <p className="font-display text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {awardedGift ? awardedGift.name[language] : `+${myPlayer?.earnedXp ?? 15} XP`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {awardedGift ? awardedGift.desc[language] : t.statsSubtitle}
                  </p>
                </div>
              </div>

              {myPlayer?.earnedXp && (
                <div className="shrink-0 text-right">
                  <span className="font-mono text-base sm:text-lg font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                    +{myPlayer.earnedXp} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Score Comparison */}
        <div className="mt-5 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 max-w-xl mx-auto">
          {[
            { side: 'A' as const, members: teamA, score: room.teamAScore, label: t.teamALabel },
            { side: 'B' as const, members: teamB, score: room.teamBScore, label: t.teamBLabel },
          ].map((team) => {
            const isBlue = team.side === 'A';
            const isWin = room.winner === team.side;
            return (
              <div
                key={team.side}
                className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-5 transition-all ${
                  isWin
                    ? isBlue
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                      : 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex -space-x-2 shrink-0">
                      {team.members.slice(0, 2).map((m) => (
                        <span key={m.id} className="text-xl sm:text-2xl">
                          {m.avatar}
                        </span>
                      ))}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-display text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {team.members.length === 1 ? team.members[0].name : team.label}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        {team.members.length} {t.duelReadyCount}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-display text-2xl sm:text-3xl font-extrabold tabular-nums shrink-0 ${
                      isBlue
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {team.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Leaderboard Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60">
                <th className="px-3 sm:px-5 py-3 sm:py-3.5">{t.playerCol}</th>
                <th className="px-2 sm:px-4 py-3 sm:py-3.5 text-right">{t.correctCol}</th>
                <th className="hidden sm:table-cell px-4 py-3.5 text-right">{t.wrongCol}</th>
                <th className="px-2 sm:px-4 py-3 sm:py-3.5 text-right">{t.accuracyCol}</th>
                <th className="hidden sm:table-cell px-4 py-3.5 text-right">{t.streakCol}</th>
                <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-right">{t.scoreCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs sm:text-sm">
              {sortedPlayers.map((p) => {
                const totalAns = p.correctCount + p.wrongCount;
                const accuracy =
                  totalAns === 0 ? 0 : Math.round((p.correctCount / totalAns) * 100);
                const isMvp = p.id === room.mvpPlayerId && room.winner !== 'draw';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">{p.avatar}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 font-display font-bold text-slate-900 dark:text-white truncate">
                            <span className="truncate">{p.name}</span>
                            {isMvp && (
                              <span
                                title={t.mvpLabel}
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0"
                              >
                                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs font-medium ${
                              p.side === 'A'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {[
                              p.side === 'A' ? t.teamALabel : t.teamBLabel,
                              p.id === playerId ? t.youBadge : null,
                              p.isBot ? t.botBadge : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-right font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {p.correctCount}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                      {p.wrongCount}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-right font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {accuracy}%
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-right font-mono font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {p.bestStreak}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-right font-display text-base sm:text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
                      {p.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Mistake Explainer & Tutor (Written, Visual Sketch & Voice Audio) */}
      {myPlayer && (
        <AiMistakeTutor
          playerName={myPlayer.name}
          subject={room.subject}
          language={language}
          correctCount={myPlayer.correctCount}
          wrongCount={myPlayer.wrongCount}
          attempts={myPlayer.attempts ?? []}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pb-4">
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
            setScreen('dashboard');
          }}
          className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-6 py-3 font-display text-sm font-bold text-amber-800 dark:text-amber-300 hover:brightness-95 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Award className="h-4 w-4" />
          <span>{t.navProfile}</span>
        </button>

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
