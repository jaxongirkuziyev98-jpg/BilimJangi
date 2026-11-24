import { CheckCircle2, Flame, Send, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { MathInputMode, PublicQuestion, SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

interface QuestionPanelProps {
  question: PublicQuestion | null;
  mathInputMode: MathInputMode;
  locked?: boolean;
  lockedMessage?: string;
}

export function QuestionPanel({
  question,
  mathInputMode,
  locked = false,
  lockedMessage,
}: QuestionPanelProps) {
  const { language, lastAnswerResult } = useGameStore();
  const t = TRANSLATIONS[language];

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState('');

  useEffect(() => {
    setSelectedIdx(null);
    setNumericValue('');
  }, [question?.id]);

  if (!question || !question.text) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t.waitingNextRound}
        </p>
      </div>
    );
  }

  const subjectMeta = SUBJECTS.find((s) => s.id === question.subject);
  const hasFeedback = lastAnswerResult?.questionId === question.id;
  const useNumeric =
    mathInputMode === 'numeric' && question.supportsNumeric;

  const handlePickOption = (idx: number) => {
    if (hasFeedback || locked) return;
    soundEngine.click();
    setSelectedIdx(idx);
    socketActions.submitAnswer({
      questionId: question.id,
      optionIndex: idx,
    });
  };

  const handleSubmitNumeric = (e: FormEvent) => {
    e.preventDefault();
    if (hasFeedback || locked) return;
    const parsed = Number(numericValue.trim());
    if (Number.isNaN(parsed) || numericValue.trim() === '') return;
    soundEngine.click();
    socketActions.submitAnswer({
      questionId: question.id,
      numericValue: parsed,
    });
  };

  const letters = ['A', 'B', 'C', 'D'];

  const activeContent = question.localized?.[language];
  const displayText = activeContent?.text ?? question.text;
  const displayOptions = activeContent?.options ?? question.options;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-7 shadow-sm ${
        hasFeedback && !lastAnswerResult.correct ? 'animate-shake' : ''
      }`}
    >
      {/* Question Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>
            {subjectMeta?.emoji} {t.subjects[question.subject].name}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t[question.difficulty]}</span>
        </div>

        {/* Floating Feedback */}
        {hasFeedback && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
              lastAnswerResult.correct
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {lastAnswerResult.correct ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{t.correctFeedback}</span>
                {lastAnswerResult.streakBonus > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-extrabold">
                    <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t.streakBonus}
                  </span>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{t.wrongFeedback}</span>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Question Prompt */}
      <h2 className="font-display text-base sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-2.5 sm:mb-6">
        {displayText}
      </h2>

      {locked && lockedMessage ? (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200">
          {lockedMessage}
        </div>
      ) : useNumeric ? (
        <form onSubmit={handleSubmitNumeric} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="number"
            inputMode="numeric"
            autoFocus
            disabled={hasFeedback}
            value={numericValue}
            onChange={(e) => setNumericValue(e.target.value)}
            placeholder={t.typeNumberPlaceholder}
            className="flex-1 min-h-11 sm:min-h-13 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 sm:px-4 text-lg sm:text-xl font-mono font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={hasFeedback || numericValue.trim() === ''}
            className="inline-flex min-h-11 sm:min-h-13 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 sm:px-6 text-sm sm:text-base font-bold text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4" />
            {t.submitAnswer}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
          {displayOptions.map((opt, idx) => {
            const isPicked = selectedIdx === idx;
            const isCorrectOption = hasFeedback && lastAnswerResult.correctIndex === idx;
            const isWrongPicked = hasFeedback && isPicked && !lastAnswerResult.correct;

            let btnStyle =
              'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-900 dark:text-white';

            if (isCorrectOption) {
              btnStyle =
                'border-emerald-500 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200';
            } else if (isWrongPicked) {
              btnStyle =
                'border-red-500 bg-red-500/15 dark:bg-red-500/20 text-red-800 dark:text-red-200';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasFeedback || locked}
                onClick={() => handlePickOption(idx)}
                className={`group flex min-h-11 sm:min-h-14 items-center gap-2.5 sm:gap-3.5 rounded-xl border-2 px-3 sm:px-4 py-1.5 sm:py-3 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span
                  className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg font-display font-bold text-xs sm:text-sm transition-colors ${
                    isCorrectOption
                      ? 'bg-emerald-600 text-white'
                      : isWrongPicked
                        ? 'bg-red-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group-hover:border-blue-400'
                  }`}
                >
                  {letters[idx]}
                </span>
                <span className="text-sm sm:text-base font-semibold leading-tight sm:leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
