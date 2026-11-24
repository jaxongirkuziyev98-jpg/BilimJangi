import { ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function JoinRoomPage() {
  const { language, prefilledCode, errorMessageKey, setError, setScreen } = useGameStore();
  const t = TRANSLATIONS[language];

  const [chars, setChars] = useState<string[]>(() => {
    const clean = prefilledCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    return Array.from({ length: 6 }, (_, i) => clean[i] ?? '');
  });

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (prefilledCode) {
      const clean = prefilledCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
      setChars(Array.from({ length: 6 }, (_, i) => clean[i] ?? ''));
    }
  }, [prefilledCode]);

  const codeString = chars.join('');

  const handleCharChange = (index: number, raw: string) => {
    if (errorMessageKey) setError(null);
    const cleaned = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (!cleaned) {
      const next = [...chars];
      next[index] = '';
      setChars(next);
      return;
    }

    // Handle paste of full code
    if (cleaned.length > 1) {
      const next = Array.from({ length: 6 }, (_, i) => cleaned[i] ?? '');
      setChars(next);
      const focusIdx = Math.min(5, cleaned.length - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...chars];
    next[index] = cleaned[0];
    setChars(next);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (codeString.length < 4) return;
    soundEngine.click();
    socketActions.joinRoom(codeString);
  };

  const errorText =
    errorMessageKey === 'room_not_found'
      ? t.roomNotFound
      : errorMessageKey === 'room_full'
        ? t.roomFull
        : errorMessageKey === 'room_already_started'
          ? t.roomAlreadyStarted
          : errorMessageKey
            ? t.roomNotFound
            : null;

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-xl px-3 sm:px-6 py-5 sm:py-16"
    >
      <button
        type="button"
        onClick={() => {
          soundEngine.click();
          setScreen('profile');
        }}
        className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div
        className={`rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 shadow-sm ${
          errorText ? 'animate-shake' : ''
        }`}
      >
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center">
          {t.joinRoomTitle}
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center">
          {t.joinRoomSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-3">
              {t.enterRoomCode}
            </label>
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              {chars.map((ch, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={6}
                  value={ch}
                  onChange={(e) => handleCharChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e.key)}
                  className={`h-12 w-10 sm:h-16 sm:w-14 rounded-xl border-2 text-center font-mono text-xl sm:text-2xl font-extrabold uppercase bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none transition-colors ${
                    errorText
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {errorText && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-center text-sm font-semibold text-red-700 dark:text-red-300">
              {errorText}
            </div>
          )}

          <button
            type="submit"
            disabled={codeString.length < 6}
            className="inline-flex min-h-12 sm:min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-display text-base font-bold text-white shadow-lg shadow-orange-600/20 hover:brightness-110 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <LogIn className="h-5 w-5" />
            <span>{t.joinNow}</span>
          </button>
        </form>
      </div>
    </motion.main>
  );
}
