import { motion } from 'motion/react';
import { TRANSLATIONS } from '../../i18n/translations';
import { Player, PublicRoomState } from '../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface ArenaProps {
  room: PublicRoomState;
  myId: string | null;
}

function PullerFigure({
  player,
  side,
  index,
  isMe,
  youLabel,
}: {
  player: Player;
  side: 'A' | 'B';
  index: number;
  isMe: boolean;
  youLabel: string;
}) {
  const isLeft = side === 'A';
  // Left team wears dark navy/blue sports jerseys; Right team wears crisp white/orange jerseys (like the reference photo)
  const shirtColor = isLeft ? '#1E3A8A' : '#FFFFFF';
  const shirtStroke = isLeft ? '#60A5FA' : '#EA580C';
  const pantsColor = isLeft ? '#0F172A' : '#334155';
  const shoeColor = index % 2 === 0 ? '#FFFFFF' : '#111827';

  return (
    <div className="flex flex-col items-center shrink-0 select-none">
      {/* Player Name + Avatar Tag */}
      <div className="mb-1 flex items-center gap-1 rounded-md bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <span className="text-xs leading-none">{player.avatar}</span>
        <span
          className={`text-[10px] font-bold max-w-[60px] truncate ${
            isLeft ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'
          }`}
        >
          {player.name}
          {isMe ? ` (${youLabel})` : ''}
        </span>
      </div>

      {/* SVG Leaning Tug-of-War Athlete */}
      <svg
        viewBox="0 0 64 78"
        className={`h-16 w-12 sm:h-20 sm:w-16 drop-shadow-sm ${
          isLeft ? '' : '-scale-x-100'
        }`}
      >
        {/* Back Leg braced on grass */}
        <path
          d="M32 45 L18 68 L11 68"
          fill="none"
          stroke={pantsColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Front Leg pushing */}
        <path
          d="M34 45 L45 68 L52 68"
          fill="none"
          stroke={pantsColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sneakers */}
        <ellipse cx="12" cy="70" rx="6" ry="3.2" fill={shoeColor} />
        <ellipse cx="52" cy="70" rx="6" ry="3.2" fill={shoeColor} />

        {/* Torso leaning back to pull left */}
        <path
          d="M23 24 L36 22 L38 47 L26 48 Z"
          fill={shirtColor}
          stroke={shirtStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Head */}
        <circle cx="27" cy="14" r="7.5" fill="#FDBA74" />
        {/* Hair */}
        <path
          d="M20 13 C20 6, 34 6, 34 12 C31 9, 24 9, 20 13 Z"
          fill="#1E293B"
        />

        {/* Arms gripping the rope forward */}
        <path
          d="M33 27 L48 34 L56 34"
          fill="none"
          stroke="#FDBA74"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="56" cy="34" r="3.5" fill="#FDBA74" />
      </svg>
    </div>
  );
}

function RefereeFigure({
  ropePosition,
  label,
}: {
  ropePosition: number;
  label: string;
}) {
  return (
    <motion.div
      animate={{
        rotate: ropePosition === 0 ? 0 : ropePosition < 0 ? -3 : 3,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className="flex flex-col items-center select-none"
    >
      <span className="mb-1 rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
        {label}
      </span>
      <svg viewBox="0 0 90 105" className="h-24 w-20 sm:h-28 sm:w-24 drop-shadow-md">
        {/* Outstretched Referee Arms */}
        <path
          d="M26 38 L6 43"
          stroke="#FDBA74"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M64 38 L84 43"
          stroke="#FDBA74"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Sleeves */}
        <path d="M28 34 L18 39" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
        <path d="M62 34 L72 39" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />

        {/* Pants & Legs */}
        <path
          d="M38 62 L32 95"
          stroke="#0F172A"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M52 62 L58 95"
          stroke="#0F172A"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* White Referee Sneakers */}
        <ellipse cx="30" cy="97" rx="7" ry="3.5" fill="#FFFFFF" />
        <ellipse cx="60" cy="97" rx="7" ry="3.5" fill="#FFFFFF" />

        {/* Black & White Striped Referee Jersey */}
        <rect x="29" y="30" width="32" height="34" rx="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="35" y1="31" x2="35" y2="63" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="42" y1="31" x2="42" y2="63" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="49" y1="31" x2="49" y2="63" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="56" y1="31" x2="56" y2="63" stroke="#0F172A" strokeWidth="3.5" />

        {/* Head */}
        <circle cx="45" cy="18" r="9" fill="#FDBA74" />
        {/* Hair */}
        <path
          d="M36 16 C36 7, 54 7, 54 16 C50 12, 40 12, 36 16 Z"
          fill="#0F172A"
        />
        {/* Whistle */}
        <circle cx="45" cy="24" r="2.3" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
        <line x1="45" y1="26" x2="45" y2="33" stroke="#334155" strokeWidth="1.2" />
      </svg>
    </motion.div>
  );
}

export function TugOfWarArena({ room, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const me = room.players.find((p) => p.id === myId);

  const labelA = teamA.length === 1 ? teamA[0].name : `${t.teamALabel} (${teamA.length})`;
  const labelB = teamB.length === 1 ? teamB[0].name : `${t.teamBLabel} (${teamB.length})`;

  const ratio = room.ropePosition / Math.max(1, room.ropeLimit);
  const offsetPercent = ratio * 36;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            🪢 {t.games.tug_of_war.name}
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            · {teamA.length} vs {teamB.length}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold tabular-nums">
          <span className="text-blue-600 dark:text-blue-400">
            {labelA}: {room.teamAScore}
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {room.ropePosition === 0
              ? t.ropeCenter
              : room.ropePosition < 0
                ? `◀ ${Math.abs(room.ropePosition)}`
                : `${room.ropePosition} ▶`}
          </span>
          <span className="text-orange-600 dark:text-orange-400">
            {labelB}: {room.teamBScore}
          </span>
        </div>
      </div>

      {/* Outdoor Field Stage (Inspired by reference photo) */}
      <div className="relative rounded-2xl border border-emerald-300/60 dark:border-emerald-900/60 overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 px-3 sm:px-5 pt-4 pb-5">
        {/* Background Trees Horizon */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 90"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-[38%] h-20 w-full opacity-45 dark:opacity-25"
        >
          <path
            d="M0,90 L0,50 Q35,18 75,45 Q115,12 165,42 Q220,10 270,48 Q330,18 390,45 Q450,8 515,44 Q575,15 635,46 Q700,12 755,44 L800,48 L800,90 Z"
            fill="#15803D"
          />
        </svg>

        {/* Green Grass Turf */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-b from-emerald-500/80 to-emerald-700/90 dark:from-emerald-900/80 dark:to-emerald-950"
        />

        {/* Win Threshold Lines & Center Field Line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[12%] h-[44%] w-0.5 border-l-2 border-dashed border-blue-200/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-[44%] w-0.5 -translate-x-1/2 bg-white/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-[12%] h-[44%] w-0.5 border-r-2 border-dashed border-orange-200/90"
        />

        {/* Referee Standing Behind the Center of the Rope */}
        <div className="relative z-10 flex justify-center -mb-14 sm:-mb-16">
          <RefereeFigure ropePosition={room.ropePosition} label={t.refereeLabel} />
        </div>

        {/* Rope + Pulling Teams Row */}
        <motion.div
          animate={{ x: `${offsetPercent * 0.28}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="relative z-20 flex items-end justify-between gap-2 pt-4"
        >
          {/* Left Team (Team A) */}
          <div className="flex items-end -space-x-2 sm:-space-x-1 shrink-0">
            {teamA.slice(0, 4).map((p, idx) => (
              <PullerFigure
                key={p.id}
                player={p}
                side="A"
                index={idx}
                isMe={p.id === me?.id}
                youLabel={t.youBadge}
              />
            ))}
          </div>

          {/* Center Braided Rope + Red Marker */}
          <div className="relative flex-1 h-16 flex items-center -mx-3">
            <svg
              viewBox="0 0 400 20"
              preserveAspectRatio="none"
              className="w-full h-3.5 overflow-visible drop-shadow"
            >
              <line
                x1="-20"
                y1="10"
                x2="420"
                y2="10"
                stroke="#92400E"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <line
                x1="-20"
                y1="10"
                x2="420"
                y2="10"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeDasharray="9 7"
                strokeLinecap="round"
              />
            </svg>

            {/* Red Ribbon Tied at the Center of the Rope */}
            <motion.div
              animate={{
                left: `${50 + offsetPercent * 0.72}%`,
              }}
              transition={{ type: 'spring', stiffness: 210, damping: 16 }}
              style={{ transform: 'translate(-50%, -45%)' }}
              className="absolute top-1/2 z-30 flex flex-col items-center"
            >
              <div className="h-4 w-3.5 rounded-sm bg-red-600 border border-white shadow" />
              <div className="h-5 w-2 rounded-b-sm bg-red-600 shadow" />
            </motion.div>
          </div>

          {/* Right Team (Team B) */}
          <div className="flex items-end -space-x-2 sm:-space-x-1 shrink-0">
            {teamB.slice(0, 4).map((p, idx) => (
              <PullerFigure
                key={p.id}
                player={p}
                side="B"
                index={idx}
                isMe={p.id === me?.id}
                youLabel={t.youBadge}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
