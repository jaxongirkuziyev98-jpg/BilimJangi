import { ArrowRight, Award, Gift, KeyRound, PlusCircle, Swords, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../i18n/translations';
import { getLevelFromXp } from '../shared/gifts';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function WelcomePage() {
  const { language, authProfile, setFlowIntent, setScreen } = useGameStore();
  const t = TRANSLATIONS[language];

  const handleStart = (intent: 'create' | 'join') => {
    soundEngine.click();
    setFlowIntent(intent);
    setScreen('profile');
  };

  const lv = getLevelFromXp(authProfile?.xp ?? 0);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-6xl px-3.5 sm:px-6 py-4 sm:py-12"
    >
      {/* Quick Player Stats Strip */}
      {authProfile && (
        <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">{authProfile.avatar}</span>
            <div className="min-w-0">
              <p className="font-display text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {t.statsGreeting}, {authProfile.fullName}!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Lv.{lv.level} · {authProfile.xp} XP · {SUBJECTS.find((s) => s.id === authProfile.favoriteSubject)?.emoji}{' '}
                {t.subjects[authProfile.favoriteSubject].name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setScreen('dashboard');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
            >
              <Gift className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {t.navProfile} ({authProfile.gifts.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setScreen('leaderboard');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:brightness-95 cursor-pointer whitespace-nowrap"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>{t.navRankings}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center">
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-6 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-2">
            <Swords className="h-4 w-4 shrink-0" />
            <span>{t.welcomeBadge}</span>
          </p>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] [text-wrap:balance]">
            {t.heroTitle}
          </h1>

          <p className="max-w-xl text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => handleStart('create')}
              className="inline-flex min-h-12 sm:min-h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 px-6 sm:px-7 py-3 font-display text-sm sm:text-base font-bold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t.createRoom}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleStart('join')}
              className="inline-flex min-h-12 sm:min-h-13 items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 sm:px-7 py-3 font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:border-violet-400 dark:hover:border-violet-500 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <KeyRound className="h-5 w-5 text-orange-500" />
              <span>{t.joinRoom}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {t.quickSummary}
          </p>
        </div>

        {/* Visual Duel Card */}
        <div className="lg:col-span-5 min-w-0">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-2.5 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col items-center flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-3 sm:p-4">
                <span className="text-3xl sm:text-4xl">🦁</span>
                <span className="mt-1.5 sm:mt-2 font-display text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 truncate max-w-full">
                  {t.teamALabel}
                </span>
                <span className="mt-0.5 sm:mt-1 font-mono text-lg sm:text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  120
                </span>
              </div>

              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 font-display text-sm sm:text-base font-extrabold text-white shadow-md">
                VS
              </div>

              <div className="flex flex-col items-center flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-3 sm:p-4">
                <span className="text-3xl sm:text-4xl">🤖</span>
                <span className="mt-1.5 sm:mt-2 font-display text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400 truncate max-w-full">
                  {t.teamBLabel}
                </span>
                <span className="mt-0.5 sm:mt-1 font-mono text-lg sm:text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  110
                </span>
              </div>
            </div>

            {/* Subject Preview Strip */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {SUBJECTS.slice(0, 9).map((subj) => (
                <div
                  key={subj.id}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2 sm:px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 truncate"
                >
                  <span className="shrink-0">{subj.emoji}</span>
                  <span className="truncate">{t.subjects[subj.id].name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-8 sm:mt-14 pt-6 sm:pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.howItWorksTitle}
          </h2>
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              setScreen('dashboard');
            }}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <Award className="h-4 w-4" />
            <span>{t.achievementsTitle}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {[
            { title: t.step1Title, desc: t.step1Desc },
            { title: t.step2Title, desc: t.step2Desc },
            { title: t.step3Title, desc: t.step3Desc },
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6"
            >
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
