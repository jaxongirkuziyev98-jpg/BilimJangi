import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../../i18n/translations';
import { PublicRoomState, SUBJECTS } from '../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface ArenaProps {
  room: PublicRoomState;
  myId: string | null;
}

export function SubjectBattleArena({ room, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];
  const subjectMeta = SUBJECTS.find((s) => s.id === room.subject);

  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const scoreA = room.teamAScore;
  const scoreB = room.teamBScore;
  const total = scoreA + scoreB;
  const percentA = total === 0 ? 50 : Math.max(8, Math.min(92, (scoreA / total) * 100));
  const me = room.players.find((p) => p.id === myId);

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span className="text-lg sm:text-2xl shrink-0">{subjectMeta?.emoji}</span>
          <h3 className="font-display text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {t.subjectBattleName(t.subjects[room.subject].name)}
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          {t[room.difficulty]} · {room.players.length}
        </span>
      </div>

      {/* Team A vs Team B Score Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2.5 sm:mb-4">
        <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-2 sm:p-4 gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {teamA.slice(0, 2).map((p) => (
                <span key={p.id} className="text-lg sm:text-3xl">
                  {p.avatar}
                </span>
              ))}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xs sm:text-base font-bold text-slate-900 dark:text-white">
                {teamA.length === 1 ? teamA[0].name : `${t.teamALabel} (${teamA.length})`}
                {me?.side === 'A' ? ` (${t.youBadge})` : ''}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                <span className="tabular-nums">
                  ✓ {teamA.reduce((sum, p) => sum + p.correctCount, 0)}
                </span>
                {me?.side === 'A' && me.streak >= 2 && (
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
                    <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {me.streak}
                  </span>
                )}
              </div>
            </div>
          </div>
          <motion.span
            key={scoreA}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display text-xl sm:text-3xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400 shrink-0"
          >
            {scoreA}
          </motion.span>
        </div>

        <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-2 sm:p-4 gap-1.5">
          <motion.span
            key={scoreB}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display text-xl sm:text-3xl font-extrabold tabular-nums text-orange-600 dark:text-orange-400 shrink-0"
          >
            {scoreB}
          </motion.span>
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 text-right">
            <div className="min-w-0">
              <p className="truncate font-display text-xs sm:text-base font-bold text-slate-900 dark:text-white">
                {teamB.length === 1 ? teamB[0].name : `${t.teamBLabel} (${teamB.length})`}
                {me?.side === 'B' ? ` (${t.youBadge})` : ''}
              </p>
              <div className="flex items-center justify-end gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {me?.side === 'B' && me.streak >= 2 && (
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
                    <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {me.streak}
                  </span>
                )}
                <span className="tabular-nums">
                  ✓ {teamB.reduce((sum, p) => sum + p.correctCount, 0)}
                </span>
              </div>
            </div>
            <div className="flex -space-x-2 shrink-0">
              {teamB.slice(0, 2).map((p) => (
                <span key={p.id} className="text-lg sm:text-3xl">
                  {p.avatar}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dual-Color Power Bar */}
      <div className="relative h-2.5 sm:h-4 w-full overflow-hidden rounded-full bg-orange-500">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
          animate={{ width: `${percentA}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        />
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/80" />
      </div>
    </div>
  );
}
