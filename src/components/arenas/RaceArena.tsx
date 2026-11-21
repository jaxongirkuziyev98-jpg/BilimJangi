import { Flag } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../../i18n/translations';
import { Player, PublicRoomState } from '../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface ArenaProps {
  room: PublicRoomState;
  playerA?: Player;
  playerB?: Player;
  myId: string | null;
}

export function RaceArena({ room, playerA, playerB, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  const finish = Math.max(1, room.raceFinishLine);
  const progA = playerA?.progress ?? 0;
  const progB = playerB?.progress ?? 0;
  const pctA = Math.min(92, (progA / finish) * 88);
  const pctB = Math.min(92, (progB / finish) * 88);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          🏎️ {t.games.race.name}
        </h3>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
          <Flag className="h-3.5 w-3.5 text-emerald-500" />
          {t.finishLine}: {finish} {t.stepsLabel}
        </span>
      </div>

      <div className="space-y-3">
        {/* Lane A */}
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-900/60 bg-slate-100 dark:bg-slate-950 p-3 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-blue-700 dark:text-blue-400">
              {playerA?.avatar} {playerA?.name ?? 'Player 1'}
              {playerA?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
              {progA} / {finish}
            </span>
          </div>
          <div className="relative h-9 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 flex items-center px-2">
            <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-slate-400/50" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-base">🏁</div>
            <motion.div
              animate={{ left: `${pctA}%` }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              className="relative z-10 flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow"
            >
              <span className="inline-block -scale-x-100 text-base leading-none">🏎️</span>
            </motion.div>
          </div>
        </div>

        {/* Lane B */}
        <div className="relative rounded-xl border border-orange-200 dark:border-orange-900/60 bg-slate-100 dark:bg-slate-950 p-3 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-orange-700 dark:text-orange-400">
              {playerB?.avatar} {playerB?.name ?? 'Player 2'}
              {playerB?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
              {progB} / {finish}
            </span>
          </div>
          <div className="relative h-9 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 flex items-center px-2">
            <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-slate-400/50" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-base">🏁</div>
            <motion.div
              animate={{ left: `${pctB}%` }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              className="relative z-10 flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow"
            >
              <span className="inline-block -scale-x-100 text-base leading-none">🏎️</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
