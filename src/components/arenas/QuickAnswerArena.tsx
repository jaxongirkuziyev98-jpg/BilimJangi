import { Zap } from 'lucide-react';
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

export function QuickAnswerArena({ room, playerA, playerB, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.games.quick_answer.name}
          </h3>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">
          {t.roundLabel} {room.quickRound} / {room.quickTotalRounds}
        </span>
      </div>

      {/* Duelist Score Strip */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{playerA?.avatar ?? '🦁'}</span>
            <span className="truncate font-display text-sm font-bold text-slate-900 dark:text-white">
              {playerA?.name ?? 'Player 1'}
              {playerA?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
          </div>
          <span className="font-display text-2xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
            {playerA?.score ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 px-4 py-3">
          <span className="font-display text-2xl font-extrabold tabular-nums text-orange-600 dark:text-orange-400">
            {playerB?.score ?? 0}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-display text-sm font-bold text-slate-900 dark:text-white">
              {playerB?.name ?? 'Player 2'}
              {playerB?.id === myId ? ` (${t.youBadge})` : ''}
            </span>
            <span className="text-2xl">{playerB?.avatar ?? '🐼'}</span>
          </div>
        </div>
      </div>

      {/* First-to-Answer Round Winner Banner */}
      {room.quickRoundWinner && (
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-xl px-4 py-3 text-center font-display font-bold text-white shadow-sm ${
            room.quickRoundWinner.side === 'A' ? 'bg-blue-600' : 'bg-orange-600'
          }`}
        >
          ⚡ {room.quickRoundWinner.avatar} {room.quickRoundWinner.name} {t.firstAnswered} (+10)
        </motion.div>
      )}
    </div>
  );
}
