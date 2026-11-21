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

export function TugOfWarArena({ room, playerA, playerB, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  // ropePosition ranges from -ropeLimit (A wins) to +ropeLimit (B wins)
  const ratio = room.ropePosition / Math.max(1, room.ropeLimit); // -1 .. +1
  const offsetPercent = ratio * 38; // moves flag up to ±38% from center

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          🪢 {t.games.tug_of_war.name}
        </h3>
        <span className="font-mono text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
          {room.ropePosition === 0
            ? t.ropeCenter
            : room.ropePosition < 0
              ? `${playerA?.name ?? 'P1'} +${Math.abs(room.ropePosition)}`
              : `${playerB?.name ?? 'P2'} +${room.ropePosition}`}
        </span>
      </div>

      {/* Arena Stage */}
      <div className="relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-6">
        {/* Win Threshold Lines */}
        <div className="absolute inset-y-2 left-[10%] w-0.5 border-l-2 border-dashed border-blue-500/60" />
        <div className="absolute inset-y-2 left-1/2 w-0.5 -translate-x-1/2 bg-slate-300 dark:bg-slate-700" />
        <div className="absolute inset-y-2 right-[10%] w-0.5 border-r-2 border-dashed border-orange-500/60" />

        {/* Duelists + Animated Rope */}
        <div className="relative flex items-center justify-between gap-2">
          {/* Player A */}
          <motion.div
            animate={{ x: offsetPercent * 0.35 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="z-10 flex flex-col items-center shrink-0"
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl sm:text-3xl shadow-md">
              {playerA?.avatar ?? '🦁'}
            </div>
            <span className="mt-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 max-w-[84px] truncate">
              {playerA?.name ?? 'P1'}
              {playerA?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
          </motion.div>

          {/* Rope Track */}
          <div className="relative flex-1 h-10 flex items-center">
            {/* Rope SVG */}
            <svg
              viewBox="0 0 400 20"
              preserveAspectRatio="none"
              className="w-full h-3 overflow-visible"
            >
              <line
                x1="0"
                y1="10"
                x2="400"
                y2="10"
                stroke="#B45309"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <line
                x1="0"
                y1="10"
                x2="400"
                y2="10"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Red Knot / Flag */}
            <motion.div
              animate={{
                left: `${50 + offsetPercent}%`,
                scale: [1, 1.12, 1],
              }}
              transition={{ type: 'spring', stiffness: 210, damping: 16 }}
              style={{ transform: 'translate(-50%, -50%)' }}
              className="absolute top-1/2 z-20 flex flex-col items-center"
            >
              <div className="h-7 w-3 rounded-full bg-red-600 border-2 border-white dark:border-slate-900 shadow-md" />
            </motion.div>
          </div>

          {/* Player B */}
          <motion.div
            animate={{ x: offsetPercent * 0.35 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="z-10 flex flex-col items-center shrink-0"
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-orange-600 text-2xl sm:text-3xl shadow-md">
              {playerB?.avatar ?? '🐼'}
            </div>
            <span className="mt-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 max-w-[84px] truncate">
              {playerB?.name ?? 'P2'}
              {playerB?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
