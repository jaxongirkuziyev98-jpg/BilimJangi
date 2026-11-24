import { Flag } from 'lucide-react';
import { motion } from 'motion/react';
import { useId } from 'react';
import { TRANSLATIONS } from '../../i18n/translations';
import { PublicRoomState } from '../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface ArenaProps {
  room: PublicRoomState;
  myId: string | null;
}

function SportsCarSvg({ variant }: { variant: 'blue' | 'orange' }) {
  const uid = useId().replace(/:/g, '');
  const bodyLight = variant === 'blue' ? '#60A5FA' : '#FB923C';
  const bodyMid = variant === 'blue' ? '#2563EB' : '#EA580C';
  const bodyDark = variant === 'blue' ? '#1E3A8A' : '#9A3412';
  const rimGlow = variant === 'blue' ? '#93C5FD' : '#FDBA74';

  return (
    <svg
      viewBox="0 0 120 54"
      className="h-7 w-16 sm:h-10 sm:w-22 drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)] select-none"
    >
      <defs>
        <linearGradient id={`car-body-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bodyLight} />
          <stop offset="52%" stopColor={bodyMid} />
          <stop offset="100%" stopColor={bodyDark} />
        </linearGradient>
        <linearGradient id={`car-glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Asphalt Shadow Under Car */}
      <ellipse cx="62" cy="48" rx="48" ry="4.5" fill="rgba(0,0,0,0.55)" />

      {/* Rear GT Wing Spoiler */}
      <path d="M12 16 L24 14 L26 22 L16 24 Z" fill="#0F172A" />
      <path d="M9 13 L25 11 L24 15 L10 17 Z" fill="#1E293B" stroke={rimGlow} strokeWidth="0.8" />

      {/* Main Sculpted Coupe Chassis */}
      <path
        d="M15 26 C18 22, 28 20, 36 18 L50 9 C60 6, 76 7, 86 17 L106 23 C112 25, 114 31, 112 37 L105 40 L16 39 C13 36, 13 30, 15 26 Z"
        fill={`url(#car-body-${uid})`}
      />

      {/* Side Window & Windshield */}
      <path
        d="M42 18 L52 11 C61 9, 73 10, 81 17 L64 20 L42 20 Z"
        fill={`url(#car-glass-${uid})`}
      />
      {/* Side Mirror */}
      <ellipse cx="75" cy="21" rx="3.2" ry="2" fill={bodyLight} />

      {/* Hood & Side Aero Highlight */}
      <path
        d="M28 29 Q56 26 98 28"
        fill="none"
        stroke={rimGlow}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M52 24 L68 24 L65 34 L48 33 Z"
        fill={bodyDark}
        opacity="0.45"
      />

      {/* Glowing Headlight */}
      <path d="M105 25 L112 27 L109 32 L102 29 Z" fill="#FEF08A" />

      {/* Rear Taillight Glow */}
      <rect x="13" y="26" width="4" height="5" rx="1.5" fill="#EF4444" />

      {/* Rear Wheel */}
      <g>
        <circle cx="33" cy="39" r="9.5" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle cx="33" cy="39" r="5.5" fill="#94A3B8" />
        <circle cx="33" cy="39" r="2.2" fill="#0F172A" />
      </g>

      {/* Front Wheel */}
      <g>
        <circle cx="91" cy="39" r="9.5" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
        <circle cx="91" cy="39" r="5.5" fill="#94A3B8" />
        <circle cx="91" cy="39" r="2.2" fill="#0F172A" />
      </g>
    </svg>
  );
}

function CheckeredFlagSvg() {
  return (
    <svg viewBox="0 0 28 28" className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow">
      <line x1="4" y1="3" x2="4" y2="26" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" />
      <g transform="translate(5, 3)">
        <rect x="0" y="0" width="18" height="13" rx="1.5" fill="#FFFFFF" />
        <rect x="0" y="0" width="4.5" height="4.3" fill="#0F172A" />
        <rect x="9" y="0" width="4.5" height="4.3" fill="#0F172A" />
        <rect x="4.5" y="4.3" width="4.5" height="4.3" fill="#0F172A" />
        <rect x="13.5" y="4.3" width="4.5" height="4.3" fill="#0F172A" />
        <rect x="0" y="8.6" width="4.5" height="4.4" fill="#0F172A" />
        <rect x="9" y="8.6" width="4.5" height="4.4" fill="#0F172A" />
      </g>
    </svg>
  );
}

export function RaceArena({ room, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const me = room.players.find((p) => p.id === myId);

  const finish = Math.max(1, room.raceFinishLine);
  const progA = room.teamAProgress;
  const progB = room.teamBProgress;

  const ratioA = Math.min(1, progA / finish);
  const ratioB = Math.min(1, progB / finish);
  const trailWidthA = 18 + ratioA * 82;
  const trailWidthB = 18 + ratioB * 82;

  const teamAName = teamA.length === 1 ? teamA[0].name : `${t.teamALabel} (${teamA.length})`;
  const teamBName = teamB.length === 1 ? teamB[0].name : `${t.teamBLabel} (${teamB.length})`;
  const teamAHasBot = teamA.some((p) => p.isBot);
  const teamBHasBot = teamB.some((p) => p.isBot);

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-3 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
        <h3 className="font-display text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
          🏎️ {t.games.race.name}
        </h3>
        <span className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap shrink-0">
          <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
          {t.finishLine}: {finish} {t.stepsLabel}
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* Lane A (Neon Sky Blue Sports Car) */}
        <div className="rounded-xl border border-blue-500/40 bg-slate-950 p-2 sm:p-3 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold mb-1.5 sm:mb-2">
            <span className="flex items-center gap-1.5 text-sky-400 truncate">
              <span className="shrink-0">{teamA.slice(0, 2).map((p) => p.avatar).join(' ')}</span>
              <span className="truncate">
                {teamAName}
                {me?.side === 'A' ? ` (${t.youBadge})` : ''}
              </span>
              {teamAHasBot && <span className="shrink-0">🤖</span>}
            </span>
            <span className="font-mono tabular-nums text-slate-200 shrink-0">
              {progA} / {finish}
            </span>
          </div>

          {/* Dark Asphalt Road Track */}
          <div className="relative h-9 sm:h-12 rounded-full bg-[#070B13] border border-slate-800/80 flex items-center px-1.5 overflow-hidden">
            {/* Dashed Road Markings */}
            <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-400/45" />

            {/* Checkered Flag */}
            <div className="pointer-events-none absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-10">
              <CheckeredFlagSvg />
            </div>

            {/* Bounded Track Span so Car Nose Finishes Cleanly at the Flag on All Screens */}
            <div className="relative z-20 flex items-center w-[calc(100%-78px)] sm:w-[calc(100%-108px)]">
              <motion.div
                animate={{ width: `${trailWidthA}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="relative h-6 sm:h-8 rounded-full border-2 border-sky-400 bg-gradient-to-r from-blue-950/60 via-blue-600/30 to-sky-400/50 shadow-[0_0_14px_rgba(56,189,248,0.65)] shrink-0"
              >
                <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3 sm:h-4 w-7 sm:w-10 rounded-full bg-gradient-to-r from-transparent via-sky-300/80 to-white blur-[2px]" />
              </motion.div>

              <motion.div
                animate={{ x: progA > 0 ? [0, 2, 0] : 0 }}
                transition={{ duration: 0.25 }}
                className="relative z-20 -ml-2 sm:-ml-2.5 shrink-0"
              >
                <SportsCarSvg variant="blue" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Lane B (Neon Flame Orange Sports Car) */}
        <div className="rounded-xl border border-orange-500/40 bg-slate-950 p-2 sm:p-3 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold mb-1.5 sm:mb-2">
            <span className="flex items-center gap-1.5 text-orange-400 truncate">
              <span className="shrink-0">{teamB.slice(0, 2).map((p) => p.avatar).join(' ')}</span>
              <span className="truncate">
                {teamBName}
                {me?.side === 'B' ? ` (${t.youBadge})` : ''}
              </span>
              {teamBHasBot && <span className="shrink-0">🤖</span>}
            </span>
            <span className="font-mono tabular-nums text-slate-200 shrink-0">
              {progB} / {finish}
            </span>
          </div>

          {/* Dark Asphalt Road Track */}
          <div className="relative h-9 sm:h-12 rounded-full bg-[#070B13] border border-slate-800/80 flex items-center px-1.5 overflow-hidden">
            {/* Dashed Road Markings */}
            <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-400/45" />

            {/* Checkered Flag */}
            <div className="pointer-events-none absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-10">
              <CheckeredFlagSvg />
            </div>

            <div className="relative z-20 flex items-center w-[calc(100%-78px)] sm:w-[calc(100%-108px)]">
              <motion.div
                animate={{ width: `${trailWidthB}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="relative h-6 sm:h-8 rounded-full border-2 border-orange-400 bg-gradient-to-r from-orange-950/60 via-orange-600/30 to-amber-400/50 shadow-[0_0_14px_rgba(251,146,60,0.65)] shrink-0"
              >
                <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3 sm:h-4 w-7 sm:w-10 rounded-full bg-gradient-to-r from-transparent via-amber-300/80 to-white blur-[2px]" />
              </motion.div>

              <motion.div
                animate={{ x: progB > 0 ? [0, 2, 0] : 0 }}
                transition={{ duration: 0.25 }}
                className="relative z-20 -ml-2 sm:-ml-2.5 shrink-0"
              >
                <SportsCarSvg variant="orange" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
