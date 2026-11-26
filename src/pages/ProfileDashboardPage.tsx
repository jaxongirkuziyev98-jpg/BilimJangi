import { Award, Gift, Lock, LogOut, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import {
  ACHIEVEMENTS,
  getLevelFromXp,
  getXpThresholdForLevel,
  GIFT_CATALOG,
} from '../shared/gifts';
import { AVATARS, SUBJECTS, SubjectId } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function ProfileDashboardPage() {
  const {
    language,
    authProfile,
    playerAvatar,
    selectedSubject,
    leaderboard,
    setAvatar,
    setSelectedSubject,
    logoutProfile,
    setScreen,
  } = useGameStore();
  const t = TRANSLATIONS[language];

  useEffect(() => {
    socketActions.requestLeaderboard();
  }, []);

  if (!authProfile) return null;

  const xp = authProfile.xp;
  const levelInfo = getLevelFromXp(xp);
  const totalAnswered = authProfile.totalCorrect + authProfile.totalWrong;
  const accuracy =
    totalAnswered === 0 ? 0 : Math.round((authProfile.totalCorrect / totalAnswered) * 100);

  const myLeaderboardEntry = leaderboard.find((e) => e.playerToken === authProfile.token);
  const myRank = myLeaderboardEntry?.rank ?? (leaderboard.length > 0 ? leaderboard.length : 1);

  const achievementStats = {
    wins: authProfile.wins,
    matchesPlayed: authProfile.matchesPlayed,
    totalCorrect: authProfile.totalCorrect,
    xp: authProfile.xp,
    giftsCount: authProfile.gifts.length,
    level: levelInfo.level,
  };

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.checkUnlocked(achievementStats));
  const lockedCount = ACHIEVEMENTS.length - unlockedAchievements.length;

  // Compute 6 visible level cards centered near player's level (inspired by reference Levels band)
  const startLv = Math.max(1, levelInfo.level - 2);
  const visibleLevels = Array.from({ length: 6 }, (_, i) => startLv + i);

  // Deduplicate unlocked gift counts by gift id
  const giftCounts = new Map<string, number>();
  for (const g of authProfile.gifts) {
    giftCounts.set(g.id, (giftCounts.get(g.id) ?? 0) + 1);
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-5xl px-3.5 sm:px-6 py-4 sm:py-8 space-y-5"
    >
      {/* Top Hero & 6-KPI Stats Banner (Inspired by reference image_71dfd7a5.png) */}
      <section className="rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-5 sm:p-7 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Mascot + Greeting + Subject/Avatar controls */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Friendly Sky-Bot Mascot SVG */}
            <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-lg" aria-hidden="true">
                <defs>
                  <linearGradient id="profBotBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="profBotFlame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                {/* Glow aura */}
                <circle cx="60" cy="60" r="52" fill="rgba(255,255,255,0.14)" />
                {/* Antenna flame */}
                <path d="M60 10 C67 20, 68 30, 60 32 C52 30, 53 20, 60 10 Z" fill="url(#profBotFlame)" />
                {/* Head */}
                <rect x="33" y="28" width="54" height="40" rx="16" fill="url(#profBotBody)" />
                <rect x="40" y="36" width="40" height="24" rx="10" fill="#0F172A" />
                {/* Happy eyes */}
                <circle cx="51" cy="48" r="4" fill="#38BDF8" />
                <circle cx="69" cy="48" r="4" fill="#38BDF8" />
                <path d="M53 54 Q60 58 67 54" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Body */}
                <rect x="42" y="70" width="36" height="30" rx="11" fill="url(#profBotBody)" />
                <circle cx="60" cy="84" r="7" fill="#0284C7" />
                <text x="60" y="88" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFF">
                  {playerAvatar}
                </text>
                {/* Waving arm */}
                <path d="M80 76 Q96 66 98 54" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M40 76 Q28 84 26 94" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {t.statsGreeting}, {authProfile.firstName} {authProfile.lastName}!
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                {t.statsSubtitle}
              </p>

              {/* Subject selector + Logout row */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <span>{SUBJECTS.find((s) => s.id === selectedSubject)?.emoji}</span>
                  <select
                    aria-label={t.favoriteSubjectLabel}
                    value={selectedSubject}
                    onChange={(e) => {
                      const nextSubj = e.target.value as SubjectId;
                      soundEngine.click();
                      setSelectedSubject(nextSubj);
                      socketActions.updateFavoriteSubject(nextSubj);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-900">
                        {t.subjects[s.id].name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setScreen('leaderboard');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 px-2.5 py-1.5 text-xs font-bold text-amber-100 hover:bg-amber-400/30 transition-colors cursor-pointer"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>
                    #{myRank} {t.statRank}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    logoutProfile();
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.logoutBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6 KPI Stat Cards (2 rows x 3 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                value: authProfile.matchesPlayed,
                label: t.statMatches,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <rect x="7" y="4" width="20" height="26" rx="4" fill="#F8FAFC" />
                    <path d="M12 11h10M12 16h10M12 21h6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="25" cy="24" r="6" fill="#0F172A" />
                    <path d="M22.5 24l1.7 1.7 3.3-3.4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ),
              },
              {
                value: totalAnswered,
                label: t.statQuestions,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <rect x="7" y="4" width="20" height="26" rx="4" fill="#E0F2FE" />
                    <path d="M12 11h10M12 16h10M12 21h7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="25" cy="24" r="6" fill="#0284C7" />
                    <path d="M22.5 24l1.7 1.7 3.3-3.4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ),
              },
              {
                value: `${accuracy}%`,
                label: t.statAccuracy,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <rect x="9" y="5" width="3" height="27" rx="1.5" fill="#FDE047" />
                    <path d="M12 7 L31 13 L12 20 Z" fill="#F97316" />
                    <circle cx="19" cy="13.5" r="3" fill="#FFF" fillOpacity="0.9" />
                  </svg>
                ),
              },
              {
                value: `#${myRank}`,
                label: t.statRank,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <path
                      d="M18 4 L22.2 12.6 L31.6 14 L24.8 20.6 L26.4 30 L18 25.5 L9.6 30 L11.2 20.6 L4.4 14 L13.8 12.6 Z"
                      fill="#BAE6FD"
                      stroke="#E0F2FE"
                      strokeWidth="1.5"
                    />
                  </svg>
                ),
              },
              {
                value: authProfile.gifts.length,
                label: t.statGifts,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <path d="M13 4h10l-2 10h-6z" fill="#EA580C" />
                    <circle cx="18" cy="22" r="9" fill="#F59E0B" stroke="#FEF08A" strokeWidth="2" />
                    <circle cx="18" cy="22" r="4" fill="#FDE047" />
                  </svg>
                ),
              },
              {
                value: xp,
                label: t.statXp,
                iconBg: 'bg-white/15',
                svg: (
                  <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
                    <circle cx="18" cy="19" r="11" fill="#0F172A" stroke="#BAE6FD" strokeWidth="2.5" />
                    <rect x="15" y="4" width="6" height="4" rx="1.5" fill="#E2E8F0" />
                    <path d="M18 19 L18 12 M18 19 L23 22" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white/12 border border-white/20 px-3.5 py-3 backdrop-blur-sm"
              >
                <div className="min-w-0">
                  <div className="font-display text-xl sm:text-2xl font-extrabold tabular-nums leading-none">
                    {card.value}
                  </div>
                  <div className="mt-1.5 text-[11px] sm:text-xs font-medium text-sky-100 truncate">
                    {card.label}
                  </div>
                </div>
                {card.svg}
              </div>
            ))}
          </div>
        </div>

        {/* Avatar quick selector */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-sky-100 mr-1">{t.chooseAvatar}:</span>
          <div className="flex flex-wrap gap-1.5">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setAvatar(av);
                  socketActions.registerProfile({ ...authProfile, avatar: av });
                }}
                className={`h-8 w-8 rounded-xl text-base flex items-center justify-center transition-transform cursor-pointer ${
                  playerAvatar === av
                    ? 'bg-white text-slate-900 scale-110 shadow-md'
                    : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Levels & XP Track Section (Inspired by reference image_71dfd7a5.png middle band) */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Circular Level Medallion */}
          <div className="md:col-span-3 flex flex-col items-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * levelInfo.progressPercent) / 100}
                />
              </svg>
              <div className="relative z-10">
                <div className="font-display text-3xl font-extrabold tabular-nums leading-none">
                  {levelInfo.level}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-widest text-sky-300 uppercase">
                  {t.levelLabel}
                </div>
              </div>
            </div>
            <p className="mt-2.5 font-mono text-xs font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
              {xp} XP
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {levelInfo.xpNeededForNext} {t.xpToNextLevel}
            </p>
          </div>

          {/* Horizontal Level Milestone Cards + Progress Bar */}
          <div className="md:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                {t.levelsTitle}
              </h2>
              <span className="text-xs font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                {levelInfo.progressPercent}%
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {visibleLevels.map((lv) => {
                const reqXp = getXpThresholdForLevel(lv);
                const reached = lv <= levelInfo.level;
                const isCurrent = lv === levelInfo.level;
                return (
                  <div
                    key={lv}
                    className={`relative rounded-2xl border p-3 text-center transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-gradient-to-b from-sky-50 to-blue-100/80 dark:from-sky-950/60 dark:to-blue-900/40 shadow-md ring-2 ring-blue-500/30'
                        : reached
                          ? 'border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 opacity-70'
                    }`}
                  >
                    <p className="text-[10px] font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {reqXp} XP
                    </p>
                    <div
                      className={`mx-auto my-2 flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                        reached
                          ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {reached ? '2XP' : <Lock className="h-4 w-4" />}
                    </div>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${
                        isCurrent
                          ? 'bg-orange-500 text-white'
                          : reached
                            ? 'bg-blue-600/15 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lv}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Golden horizontal progress bar */}
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.max(8, levelInfo.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements & Unlocked Gifts Medallion Grid (Inspired by reference bottom band) */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left summary column */}
          <div className="md:col-span-3 flex md:flex-col items-center justify-between md:justify-start gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <Award className="h-10 w-10 text-amber-300" />
            </div>

            <div className="flex md:flex-col gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2">
                <div className="font-display text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {unlockedAchievements.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {t.unlockedLabel}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2">
                <div className="font-display text-xl font-extrabold tabular-nums text-slate-600 dark:text-slate-300">
                  {lockedCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {t.lockedLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Right ornate achievement medallions */}
          <div className="md:col-span-9">
            <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              {t.achievementsTitle}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = ach.checkUnlocked(achievementStats);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-2xl border p-3 text-center transition-all ${
                      isUnlocked
                        ? 'border-amber-300 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/90 to-white dark:from-amber-950/25 dark:to-slate-900 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 opacity-65'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-4 text-2xl ${
                        isUnlocked
                          ? 'border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/60 dark:to-yellow-900/40 shadow-sm'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 grayscale'
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <p className="font-display text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {ach.title[language]}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ach.desc[language]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Winner Gifts Vault */}
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-amber-500" />
            <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
              {t.giftsVaultTitle}
            </h3>
          </div>

          {authProfile.gifts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 text-sm text-slate-600 dark:text-slate-400">
              {t.noGiftsYet}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GIFT_CATALOG.filter((g) => giftCounts.has(g.id)).map((gift) => {
                const count = giftCounts.get(gift.id) ?? 1;
                return (
                  <div
                    key={gift.id}
                    className="rounded-2xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-center"
                  >
                    <div className="text-3xl">{gift.icon}</div>
                    <p className="mt-1.5 font-display text-xs font-extrabold text-slate-900 dark:text-white">
                      {gift.name[language]} {count > 1 ? `×${count}` : ''}
                    </p>
                    <p className="mt-0.5 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      +{gift.xpBonus} XP
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}
