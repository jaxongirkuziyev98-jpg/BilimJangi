import { ArrowRight, KeyRound, PlusCircle, Swords } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function WelcomePage() {
  const { language, setFlowIntent, setScreen } = useGameStore();
  const t = TRANSLATIONS[language];

  const handleStart = (intent: 'create' | 'join') => {
    soundEngine.click();
    setFlowIntent(intent);
    setScreen('profile');
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16"
    >
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-2">
            <Swords className="h-4 w-4" />
            <span>{t.welcomeBadge}</span>
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] [text-wrap:balance]">
            {t.heroTitle}
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => handleStart('create')}
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 px-7 py-3.5 font-display text-base font-bold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t.createRoom}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleStart('join')}
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-7 py-3.5 font-display text-base font-bold text-slate-900 dark:text-white hover:border-violet-400 dark:hover:border-violet-500 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <KeyRound className="h-5 w-5 text-orange-500" />
              <span>{t.joinRoom}</span>
            </button>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-1">
            {t.quickSummary}
          </p>
        </div>

        {/* Visual Duel Card */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex flex-col items-center flex-1 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4">
                <span className="text-4xl">🦁</span>
                <span className="mt-2 font-display text-sm font-bold text-blue-700 dark:text-blue-400">
                  1-O‘yinchi
                </span>
                <span className="mt-1 font-mono text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  120
                </span>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 font-display text-base font-extrabold text-white shadow-md">
                VS
              </div>

              <div className="flex flex-col items-center flex-1 rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-4">
                <span className="text-4xl">🦊</span>
                <span className="mt-2 font-display text-sm font-bold text-orange-700 dark:text-orange-400">
                  2-O‘yinchi
                </span>
                <span className="mt-1 font-mono text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  110
                </span>
              </div>
            </div>

            {/* Subject Preview Strip */}
            <div className="grid grid-cols-3 gap-2">
              {SUBJECTS.slice(0, 9).map((subj) => (
                <div
                  key={subj.id}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate"
                >
                  <span>{subj.emoji}</span>
                  <span className="truncate">{t.subjects[subj.id].name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-14 pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t.howItWorksTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: t.step1Title, desc: t.step1Desc },
            { title: t.step2Title, desc: t.step2Desc },
            { title: t.step3Title, desc: t.step3Desc },
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
            >
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
