import { ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function LoginPage() {
  const { language, loginWithNames } = useGameStore();
  const t = TRANSLATIONS[language];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const f = firstName.trim();
    const l = lastName.trim();
    if (f.length < 2 || l.length < 2) {
      setHasError(true);
      return;
    }
    soundEngine.click();
    const profile = loginWithNames(f, l);
    socketActions.registerProfile(profile);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-lg items-center justify-center px-4 py-6 sm:py-12"
    >
      <div
        className={`w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-9 shadow-xl backdrop-blur-sm ${
          hasError ? 'animate-shake' : ''
        }`}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
          <UserCheck className="h-8 w-8" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
            {t.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="login-first-name"
              className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5"
            >
              {t.firstNameLabel}
            </label>
            <input
              id="login-first-name"
              type="text"
              autoComplete="given-name"
              maxLength={18}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder={t.firstNamePlaceholder}
              className={`w-full min-h-12 rounded-xl border-2 px-4 text-base font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none transition-colors ${
                hasError && firstName.trim().length < 2
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-blue-600'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="login-last-name"
              className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5"
            >
              {t.lastNameLabel}
            </label>
            <input
              id="login-last-name"
              type="text"
              autoComplete="family-name"
              maxLength={18}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (hasError) setHasError(false);
              }}
              placeholder={t.lastNamePlaceholder}
              className={`w-full min-h-12 rounded-xl border-2 px-4 text-base font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none transition-colors ${
                hasError && lastName.trim().length < 2
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-blue-600'
              }`}
            />
          </div>

          {hasError && (
            <p className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
              {t.loginError}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 py-3.5 font-display text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.loginSubmit}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </motion.main>
  );
}
