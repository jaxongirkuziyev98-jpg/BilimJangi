import { motion } from 'motion/react';
import { useId } from 'react';
import { TRANSLATIONS } from '../../i18n/translations';
import { Player, PublicRoomState } from '../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface ArenaProps {
  room: PublicRoomState;
  myId: string | null;
}

function HumanPullerSvg({ side }: { side: 'A' | 'B' }) {
  const uid = useId().replace(/:/g, '');
  const isLeft = side === 'A';
  const shirtTop = isLeft ? '#60A5FA' : '#FB923C';
  const shirtBottom = isLeft ? '#2563EB' : '#EA580C';
  const shoeMain = isLeft ? '#3B82F6' : '#F97316';

  return (
    <svg
      viewBox="0 0 84 96"
      className={`h-13 w-11 sm:h-22 sm:w-19 drop-shadow-[0_4px_5px_rgba(0,0,0,0.35)] ${
        isLeft ? '' : '-scale-x-100'
      }`}
    >
      <defs>
        <radialGradient id={`skin-${uid}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE0C2" />
          <stop offset="65%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#EA8C55" />
        </radialGradient>
        <linearGradient id={`hair-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C4A2D" />
          <stop offset="55%" stopColor="#5B331C" />
          <stop offset="100%" stopColor="#3B1F0F" />
        </linearGradient>
        <linearGradient id={`shirt-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={shirtTop} />
          <stop offset="100%" stopColor={shirtBottom} />
        </linearGradient>
        <linearGradient id={`shorts-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="42" cy="91" rx="24" ry="4" fill="rgba(0,0,0,0.28)" />

      {/* Back Leg */}
      <path
        d="M36 62 L24 83"
        fill="none"
        stroke={`url(#skin-${uid})`}
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      {/* Back Shorts Leg */}
      <path d="M31 53 L41 55 L38 67 L28 64 Z" fill={`url(#shorts-${uid})`} />

      {/* Front Leg */}
      <path
        d="M46 62 L58 84"
        fill="none"
        stroke={`url(#skin-${uid})`}
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      {/* Front Shorts Leg */}
      <path d="M39 53 L50 53 L52 66 L41 66 Z" fill={`url(#shorts-${uid})`} />

      {/* Sneakers */}
      <g>
        <ellipse cx="22" cy="85" rx="9" ry="4.5" fill={shoeMain} />
        <path d="M13 86 Q22 89 31 86" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="86" rx="9.5" ry="4.5" fill={shoeMain} />
        <path d="M51 87 Q60 90 69 87" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>

      {/* Back Arm reaching forward to rope */}
      <path
        d="M45 38 L66 49"
        fill="none"
        stroke="#EA8C55"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Torso / T-Shirt */}
      <path
        d="M27 33 Q40 29 50 34 L51 56 Q39 59 29 56 Z"
        fill={`url(#shirt-${uid})`}
      />
      {/* Shirt Sleeve */}
      <path d="M30 33 L42 36 L40 46 L27 43 Z" fill={shirtTop} />

      {/* Head (Rounded 3D stylized kid) */}
      <circle cx="38" cy="20" r="14.5" fill={`url(#skin-${uid})`} />
      {/* Rosy Cheek */}
      <ellipse cx="44" cy="24" rx="3.2" ry="2" fill="#FB7185" opacity="0.45" />
      {/* Ear */}
      <circle cx="25.5" cy="21.5" r="3.2" fill="#F59E6C" />
      {/* Eyes */}
      <circle cx="42" cy="18.5" r="1.8" fill="#1E293B" />
      <circle cx="48.5" cy="18.5" r="1.7" fill="#1E293B" />
      <circle cx="42.5" cy="17.8" r="0.6" fill="#FFFFFF" />
      <circle cx="49" cy="17.8" r="0.6" fill="#FFFFFF" />
      {/* Happy Open Smile */}
      <path d="M41.5 25 Q45.5 28.5 49 25" fill="none" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />

      {/* Lush Swept Hair */}
      <path
        d="M23 19 C22 7, 36 3, 47 7 C52 9, 53 13, 50 15 C45 11, 36 12, 31 18 C29 21, 25 22, 23 19 Z"
        fill={`url(#hair-${uid})`}
      />

      {/* Front Arm gripping the rope */}
      <path
        d="M35 41 L55 51 L68 51"
        fill="none"
        stroke={`url(#skin-${uid})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hands gripping */}
      <circle cx="66" cy="51" r="4.5" fill="#FDBA74" />
      <circle cx="71" cy="51" r="4.5" fill="#FDBA74" />
    </svg>
  );
}

function RobotPullerSvg({ side }: { side: 'A' | 'B' }) {
  const uid = useId().replace(/:/g, '');
  const isLeft = side === 'A';
  const accentGlow = isLeft ? '#38BDF8' : '#60A5FA';

  return (
    <svg
      viewBox="0 0 84 96"
      className={`h-13 w-11 sm:h-22 sm:w-19 drop-shadow-[0_4px_6px_rgba(0,0,0,0.38)] ${
        isLeft ? '' : '-scale-x-100'
      }`}
    >
      <defs>
        <linearGradient id={`rbody-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id={`rjoint-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="42" cy="91" rx="24" ry="4" fill="rgba(0,0,0,0.28)" />

      {/* Back Leg */}
      <path
        d="M36 60 L25 83"
        fill="none"
        stroke={`url(#rjoint-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Front Leg */}
      <path
        d="M46 60 L57 83"
        fill="none"
        stroke={`url(#rbody-${uid})`}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Robot Boots */}
      <ellipse cx="23" cy="85" rx="9" ry="4.8" fill={`url(#rbody-${uid})`} stroke="#64748B" strokeWidth="1" />
      <ellipse cx="59" cy="85" rx="9.5" ry="4.8" fill={`url(#rbody-${uid})`} stroke="#64748B" strokeWidth="1" />

      {/* Back Arm */}
      <path
        d="M46 40 L67 50"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Pelvis / Waist Joint */}
      <rect x="31" y="53" width="20" height="8" rx="4" fill={`url(#rjoint-${uid})`} />

      {/* Rounded Robot Chest */}
      <rect
        x="26"
        y="33"
        width="27"
        height="22"
        rx="8"
        fill={`url(#rbody-${uid})`}
        stroke="#CBD5E1"
        strokeWidth="1.2"
      />
      {/* Glowing Blue Chest Power Core */}
      <rect x="34" y="38" width="13" height="8" rx="3" fill="#1E293B" />
      <rect x="36" y="40" width="9" height="4" rx="1.5" fill={accentGlow} />

      {/* Neck */}
      <rect x="36" y="29" width="10" height="6" rx="2" fill={`url(#rjoint-${uid})`} />

      {/* Rounded Robot Helmet Head */}
      <rect
        x="21"
        y="6"
        width="36"
        height="25"
        rx="10"
        fill={`url(#rbody-${uid})`}
        stroke="#CBD5E1"
        strokeWidth="1.2"
      />
      {/* Side Ear Pod */}
      <circle cx="20" cy="18.5" r="4.5" fill="#475569" />
      <circle cx="20" cy="18.5" r="2.2" fill={accentGlow} />
      {/* Small Antenna */}
      <line x1="39" y1="6" x2="39" y2="2" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="39" cy="2" r="2" fill={accentGlow} />

      {/* Glossy Dark LED Visor */}
      <rect x="27" y="10.5" width="26" height="16" rx="6" fill="#0F172A" />
      {/* Glowing Cyan Robot Eyes & Cute Smile */}
      <rect x="34" y="14.5" width="4" height="5" rx="2" fill="#38BDF8" />
      <rect x="44" y="14.5" width="4" height="5" rx="2" fill="#38BDF8" />
      <path d="M37 22 Q41 24.5 45 22" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />

      {/* Front Articulated Arm gripping the rope */}
      <circle cx="32" cy="40" r="4.2" fill={`url(#rjoint-${uid})`} />
      <path
        d="M32 40 L54 51 L68 51"
        fill="none"
        stroke={`url(#rbody-${uid})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Robot Hands gripping */}
      <circle cx="66" cy="51" r="4.5" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
      <circle cx="71" cy="51" r="4.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
    </svg>
  );
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
  return (
    <div
      className={`${
        index >= 3 ? 'hidden sm:flex' : 'flex'
      } flex-col items-center shrink-0 select-none`}
    >
      {/* Floating Dark Slate Player Badge (Matching Reference Image) */}
      <div className="mb-0.5 sm:mb-1 flex items-center gap-1 rounded-lg bg-slate-900/90 px-1.5 sm:px-2.5 py-0.5 sm:py-1 shadow-md border border-slate-700/75">
        <span className="text-[10px] sm:text-xs leading-none shrink-0">{player.avatar}</span>
        <span className="text-[9px] sm:text-[11px] font-bold text-white max-w-[60px] sm:max-w-[110px] truncate whitespace-nowrap">
          {player.name}
          {isMe ? ` (${youLabel})` : ''}
        </span>
        {player.isBot && (
          <span className="text-[10px] sm:text-xs leading-none shrink-0" aria-hidden="true">
            🤖
          </span>
        )}
      </div>

      {player.isBot ? <RobotPullerSvg side={side} /> : <HumanPullerSvg side={side} />}
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
  const uid = useId().replace(/:/g, '');
  return (
    <motion.div
      animate={{
        rotate: ropePosition === 0 ? 0 : ropePosition < 0 ? -3 : 3,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className="flex flex-col items-center select-none"
    >
      {/* Floating Dark Slate Hakam Pill */}
      <span className="mb-0.5 sm:mb-1 rounded-lg bg-slate-900/90 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold tracking-wide text-white shadow-md border border-slate-700/75 whitespace-nowrap">
        {label}
      </span>

      <svg
        viewBox="0 0 110 112"
        className="h-15 w-15 sm:h-28 sm:w-28 drop-shadow-[0_5px_6px_rgba(0,0,0,0.38)]"
      >
        <defs>
          <radialGradient id={`ref-skin-${uid}`} cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE0C2" />
            <stop offset="70%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#EA8C55" />
          </radialGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse cx="55" cy="107" rx="22" ry="4" fill="rgba(0,0,0,0.3)" />

        {/* Left Raised Arm + Yellow Flag */}
        <g>
          <line x1="20" y1="16" x2="20" y2="41" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M5 16 L20 16 L20 29 L5 29 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
          <path
            d="M36 46 L24 42 L20 36"
            fill="none"
            stroke={`url(#ref-skin-${uid})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="36" r="4" fill="#FDBA74" />
        </g>

        {/* Right Raised Arm + Metallic Whistle/Paddle */}
        <g>
          <line x1="90" y1="27" x2="90" y2="41" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="90" cy="24" rx="5.5" ry="6.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.4" />
          <path
            d="M74 46 L86 42 L90 36"
            fill="none"
            stroke={`url(#ref-skin-${uid})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="90" cy="36" r="4" fill="#FDBA74" />
        </g>

        {/* Referee Short Sleeves */}
        <path d="M36 40 L27 44 L31 52 L40 48 Z" fill="#1E293B" />
        <path d="M74 40 L83 44 L79 52 L70 48 Z" fill="#1E293B" />

        {/* Pants & Legs */}
        <path d="M46 68 L44 101" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />
        <path d="M64 68 L66 101" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />

        {/* Referee Sneakers */}
        <ellipse cx="42" cy="103" rx="7.5" ry="3.8" fill="#111827" />
        <path d="M35 104 Q42 106.5 49 104" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="68" cy="103" rx="7.5" ry="3.8" fill="#111827" />
        <path d="M61 104 Q68 106.5 75 104" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Striped Referee Jersey */}
        <rect
          x="38"
          y="39"
          width="34"
          height="32"
          rx="6"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
        <line x1="44" y1="40" x2="44" y2="70" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="51" y1="40" x2="51" y2="70" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="59" y1="40" x2="59" y2="70" stroke="#0F172A" strokeWidth="3.5" />
        <line x1="66" y1="40" x2="66" y2="70" stroke="#0F172A" strokeWidth="3.5" />
        {/* Chest Badge + Waist Belt */}
        <circle cx="62" cy="48" r="2.8" fill="#FACC15" stroke="#0F172A" strokeWidth="1" />
        <rect x="38" y="67" width="34" height="4" rx="1.5" fill="#0F172A" />

        {/* Head */}
        <circle cx="55" cy="24" r="12.5" fill={`url(#ref-skin-${uid})`} />
        <circle cx="42" cy="25" r="2.6" fill="#F59E6C" />
        <circle cx="68" cy="25" r="2.6" fill="#F59E6C" />
        {/* Rosy Cheeks */}
        <ellipse cx="48" cy="28" rx="2.4" ry="1.5" fill="#FB7185" opacity="0.45" />
        <ellipse cx="62" cy="28" rx="2.4" ry="1.5" fill="#FB7185" opacity="0.45" />
        {/* Eyes & Smile */}
        <circle cx="50.5" cy="23.5" r="1.6" fill="#0F172A" />
        <circle cx="59.5" cy="23.5" r="1.6" fill="#0F172A" />
        <path d="M51.5 29 Q55 32.5 58.5 29" fill="none" stroke="#9A3412" strokeWidth="1.7" strokeLinecap="round" />

        {/* Black Referee Cap */}
        <path d="M42 20 C42 9, 68 9, 68 20 Z" fill="#1E293B" />
        <ellipse cx="55" cy="19.5" rx="14.5" ry="3.2" fill="#0F172A" />
      </svg>
    </motion.div>
  );
}

export function TugOfWarArena({ room, myId }: ArenaProps) {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];
  const sceneId = useId().replace(/:/g, '');

  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const me = room.players.find((p) => p.id === myId);

  const labelA = teamA.length === 1 ? teamA[0].name : `${t.teamALabel} (${teamA.length})`;
  const labelB = teamB.length === 1 ? teamB[0].name : `${t.teamBLabel} (${teamB.length})`;

  const ratio = room.ropePosition / Math.max(1, room.ropeLimit);
  const offsetPercent = ratio * 34;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-5 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <h3 className="font-display text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            🪢 {t.games.tug_of_war.name}
          </h3>
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
            · {teamA.length} vs {teamB.length}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold tabular-nums">
          <span className="text-blue-600 dark:text-blue-400 truncate max-w-[90px] sm:max-w-none">
            {labelA}: {room.teamAScore}
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
            {room.ropePosition === 0
              ? t.ropeCenter
              : room.ropePosition < 0
                ? `◀ ${Math.abs(room.ropePosition)}`
                : `${room.ropePosition} ▶`}
          </span>
          <span className="text-orange-600 dark:text-orange-400 truncate max-w-[90px] sm:max-w-none">
            {labelB}: {room.teamBScore}
          </span>
        </div>
      </div>

      {/* Stylized 3D Twilight Forest & Green Hills Tug-of-War Stage */}
      <div className="relative rounded-xl sm:rounded-2xl border border-indigo-950/60 overflow-hidden bg-gradient-to-b from-[#1E1B4B] via-[#2E2A72] to-[#3B429F] px-2 sm:px-5 pt-2.5 sm:pt-4 pb-2 sm:pb-4">
        {/* Starry Twilight Sky + Pine Forest + Rolling Lush Green Hills Backdrop */}
        <svg
          aria-hidden="true"
          viewBox="0 0 900 260"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={`sky-${sceneId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="55%" stopColor="#2E296E" />
              <stop offset="100%" stopColor="#3B429F" />
            </linearGradient>
            <linearGradient id={`hill-back-${sceneId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="50%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id={`turf-${sceneId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="35%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>

          <rect width="900" height="260" fill={`url(#sky-${sceneId})`} />

          {/* Twilight Clouds */}
          <path
            d="M0,105 Q60,72 135,96 Q200,70 280,102 L280,140 L0,140 Z"
            fill="#4338CA"
            opacity="0.35"
          />
          <path
            d="M610,104 Q685,68 770,96 Q835,74 900,100 L900,140 L610,140 Z"
            fill="#4338CA"
            opacity="0.35"
          />

          {/* Twinkling Stars & Sparkles */}
          <g fill="#FFFFFF" opacity="0.85">
            <circle cx="55" cy="22" r="1.4" />
            <circle cx="140" cy="36" r="1.8" />
            <circle cx="215" cy="18" r="1.3" />
            <circle cx="345" cy="30" r="1.6" />
            <circle cx="545" cy="24" r="1.6" />
            <circle cx="670" cy="38" r="1.3" />
            <circle cx="780" cy="19" r="1.7" />
            <circle cx="855" cy="34" r="1.4" />
            <circle cx="405" cy="16" r="1.2" />
            <circle cx="500" cy="42" r="1.3" />
          </g>
          {/* Golden 4-Point Sparkle Stars */}
          <path d="M292 22 L294 29 L301 31 L294 33 L292 40 L290 33 L283 31 L290 29 Z" fill="#FDE68A" />
          <path d="M622 18 L624 25 L631 27 L624 29 L622 36 L620 29 L613 27 L620 25 Z" fill="#FDE68A" />

          {/* Distant Pine Mountain Silhouettes */}
          <path
            d="M0,145 Q130,85 290,130 Q450,150 610,130 Q770,82 900,138 L900,175 L0,175 Z"
            fill="#14532D"
          />

          {/* Stylized Conical Pine Trees Left & Right */}
          <g fill="#166534">
            <polygon points="35,140 58,45 81,140" />
            <polygon points="82,140 108,16 134,140" fill="#15803D" />
            <polygon points="148,140 168,58 188,140" />
            <polygon points="205,140 220,76 235,140" fill="#15803D" />
            <polygon points="665,140 680,76 695,140" fill="#15803D" />
            <polygon points="712,140 732,58 752,140" />
            <polygon points="766,140 792,16 818,140" fill="#15803D" />
            <polygon points="819,140 842,45 865,140" />
          </g>

          {/* Rolling Lush 3D Green Hills */}
          <path
            d="M0,150 Q75,98 160,138 Q245,92 335,132 Q450,94 565,132 Q655,92 740,138 Q825,98 900,150 L900,260 L0,260 Z"
            fill={`url(#hill-back-${sceneId})`}
          />

          {/* Front Sunlit Meadow Grass Field */}
          <path
            d="M0,158 Q220,126 450,142 Q680,126 900,158 L900,260 L0,260 Z"
            fill={`url(#turf-${sceneId})`}
          />
          <ellipse cx="450" cy="186" rx="280" ry="52" fill="#86EFAC" opacity="0.22" />
        </svg>

        {/* Left Dashed Goal Line, Center White Line, Right Dashed Goal Line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[11%] h-[48%] w-0.5 border-l-2 border-dashed border-white/75"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-[48%] w-0.5 -translate-x-1/2 bg-white/85"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-[11%] h-[48%] w-0.5 border-r-2 border-dashed border-white/75"
        />

        {/* Center Referee Standing Behind Rope */}
        <div className="relative z-10 flex justify-center -mb-8 sm:-mb-15">
          <RefereeFigure ropePosition={room.ropePosition} label={t.refereeLabel} />
        </div>

        {/* Rope + Pulling Characters Row */}
        <motion.div
          animate={{ x: `${offsetPercent * 0.24}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="relative z-20 flex items-end justify-between gap-1 sm:gap-2 pt-2 sm:pt-3"
        >
          {/* Full-Span Thick Golden Braided Rope with Curved Slack Ends */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[14px] sm:bottom-[26px] z-25 flex items-center">
            <svg
              viewBox="0 0 800 38"
              preserveAspectRatio="none"
              className="w-full h-5 sm:h-7 overflow-visible drop-shadow-[0_3px_3px_rgba(0,0,0,0.35)]"
            >
              <defs>
                <linearGradient id={`rope-base-${sceneId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#A16207" />
                </linearGradient>
              </defs>
              {/* Curved Slack Rope Path (Droops on grass at far left and far right) */}
              <path
                d="M -10,34 Q 24,35 44,18 L 756,18 Q 776,35 810,34"
                fill="none"
                stroke={`url(#rope-base-${sceneId})`}
                strokeWidth="9"
                strokeLinecap="round"
              />
              {/* Braided Rope Texture Stripes */}
              <path
                d="M -10,34 Q 24,35 44,18 L 756,18 Q 776,35 810,34"
                fill="none"
                stroke="#CA8A04"
                strokeWidth="4.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Red Center Knot/Clamp Tied on the Golden Rope */}
          <motion.div
            animate={{
              left: `${50 + offsetPercent * 0.72}%`,
            }}
            transition={{ type: 'spring', stiffness: 210, damping: 16 }}
            style={{ transform: 'translate(-50%, 0)' }}
            className="pointer-events-none absolute bottom-[12px] sm:bottom-[23px] z-30 flex flex-col items-center"
          >
            <div className="h-4 w-3.5 sm:h-5 sm:w-4 rounded-md bg-gradient-to-b from-red-500 to-red-700 border border-red-200/60 shadow-md" />
            <div className="h-3.5 w-2 sm:h-5 sm:w-2.5 -mt-1 rounded-b-full bg-gradient-to-b from-red-600 to-red-800 shadow" />
          </motion.div>

          {/* Left Team (Team A) */}
          <div className="relative z-20 flex items-end -space-x-2 sm:-space-x-1 pl-2 sm:pl-4 shrink-0">
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

          {/* Center Spacer */}
          <div className="flex-1 min-w-[44px]" />

          {/* Right Team (Team B) */}
          <div className="relative z-20 flex items-end -space-x-2 sm:-space-x-1 pr-2 sm:pr-4 shrink-0">
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
