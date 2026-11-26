import { Check, CheckCircle2, Heart, X, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { socketActions } from '../../hooks/useSocket';
import { TRANSLATIONS } from '../../i18n/translations';
import { PublicQuestion, PublicRoomState } from '../../shared/types';
import { soundEngine } from '../../sounds/soundEngine';
import { useGameStore } from '../../store/useGameStore';

interface TrueFalseArenaProps {
  room: PublicRoomState;
  myId: string | null;
  question: PublicQuestion | null;
}

const QUESTION_SECONDS = 10;

export function TrueFalseArena({ room, myId, question }: TrueFalseArenaProps) {
  const { language, lastAnswerResult } = useGameStore();
  const t = TRANSLATIONS[language];

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [questionTimer, setQuestionTimer] = useState(QUESTION_SECONDS);

  useEffect(() => {
    setSelectedIdx(null);
    setQuestionTimer(QUESTION_SECONDS);
  }, [question?.id]);

  const myPlayer = room.players.find((p) => p.id === myId);
  const wrongMod = (myPlayer?.wrongCount ?? 0) % 3;
  const heartsRemaining =
    (myPlayer?.wrongCount ?? 0) > 0 && wrongMod === 0 ? 1 : 3 - wrongMod;

  const hasFeedback = Boolean(question && lastAnswerResult?.questionId === question.id);

  // Per-question countdown bar/number matching image_959ea5f1.png TIMER card
  useEffect(() => {
    if (!question || !question.text || hasFeedback || room.status !== 'playing') return;
    const id = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          // Auto-submit sentinel timeout optionIndex = -1 so next question moves cleanly
          socketActions.submitAnswer({
            questionId: question.id,
            optionIndex: -1,
            language,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [question?.id, hasFeedback, room.status, language]);

  if (!question || !question.text) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.waitingNextRound}</p>
      </div>
    );
  }

  const statement = question.localized?.[language]?.text ?? question.text;

  const handleChoice = (idx: 0 | 1) => {
    if (hasFeedback) return;
    soundEngine.click();
    setSelectedIdx(idx);
    socketActions.submitAnswer({
      questionId: question.id,
      optionIndex: idx,
      language,
    });
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Compact Team Score Strip */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-1.5">
          <span className="font-display text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 truncate">
            {t.teamALabel}
          </span>
          <span className="font-display text-base sm:text-xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
            {room.teamAScore}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/30 px-3 py-1.5">
          <span className="font-display text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-300 truncate">
            {t.teamBLabel}
          </span>
          <span className="font-display text-base sm:text-xl font-extrabold tabular-nums text-orange-600 dark:text-orange-400">
            {room.teamBScore}
          </span>
        </div>
      </div>

      {/* Main True / False Stage (inspired by image_959ea5f1.png adapted to BilimJang theme) */}
      <div
        className={`relative rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-950 p-3.5 sm:p-5 text-white shadow-lg ${
          hasFeedback && !lastAnswerResult?.correct ? 'animate-shake' : ''
        }`}
      >
        {/* Top Hearts Pill + SCORE / TIMER HUD Cards */}
        <div className="flex flex-col items-center gap-2.5">
          {/* 3 Hearts Strip */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/35 border border-white/15 px-4 py-1.5 backdrop-blur-xs">
            {[0, 1, 2].map((i) => {
              const alive = i < heartsRemaining;
              return (
                <Heart
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${
                    alive
                      ? 'fill-rose-500 text-rose-400 scale-100'
                      : 'fill-slate-700 text-slate-600 scale-90 opacity-50'
                  }`}
                />
              );
            })}
          </div>

          {/* SCORE & TIMER Cards */}
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
            <div className="rounded-2xl bg-slate-950/40 border border-white/15 px-3 py-1.5 text-center">
              <div className="text-[10px] sm:text-xs font-extrabold tracking-wider text-amber-300 uppercase">
                {t.tfScoreLabel}
              </div>
              <div className="font-display text-lg sm:text-2xl font-extrabold tabular-nums text-white">
                {myPlayer?.score ?? 0}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950/40 border border-white/15 px-3 py-1.5 text-center">
              <div className="text-[10px] sm:text-xs font-extrabold tracking-wider text-amber-300 uppercase">
                {t.tfTimerLabel}
              </div>
              <div
                className={`font-display text-lg sm:text-2xl font-extrabold tabular-nums ${
                  questionTimer <= 3 ? 'text-red-300 animate-pulse' : 'text-white'
                }`}
              >
                {questionTimer}
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge Circle */}
        <div className="mt-2.5 flex justify-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md ${
              hasFeedback
                ? lastAnswerResult?.correct
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
                : 'bg-emerald-500'
            }`}
          >
            {hasFeedback && !lastAnswerResult?.correct ? (
              <X className="h-4 w-4 text-white stroke-[3]" />
            ) : (
              <Check className="h-4 w-4 text-white stroke-[3]" />
            )}
          </div>
        </div>

        {/* Speech-Bubble Statement Card (matching image_959ea5f1.png) */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="relative mx-auto mt-2 max-w-md rounded-2xl bg-[#FFFDF5] dark:bg-slate-800 border border-amber-100 dark:border-slate-700 px-4 py-5 sm:px-6 sm:py-7 text-center text-slate-900 dark:text-white shadow-xl"
        >
          <p className="font-display text-base sm:text-xl font-bold leading-snug">
            {statement}
          </p>

          {hasFeedback && lastAnswerResult && (
            <div
              className={`mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold ${
                lastAnswerResult.correct
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {lastAnswerResult.correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.correctFeedback}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>{t.wrongFeedback}</span>
                </>
              )}
            </div>
          )}

          {/* Dual speech pointer notches at bottom */}
          <span
            aria-hidden="true"
            className="absolute -bottom-2.5 left-12 h-4 w-4 rotate-45 bg-[#FFFDF5] dark:bg-slate-800 border-r border-b border-amber-100 dark:border-slate-700"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2.5 right-12 h-4 w-4 rotate-45 bg-[#FFFDF5] dark:bg-slate-800 border-r border-b border-amber-100 dark:border-slate-700"
          />
        </motion.div>

        {/* Tactile TRUE / FALSE Buttons */}
        <div className="mx-auto mt-4 grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            disabled={hasFeedback}
            onClick={() => handleChoice(0)}
            className={`min-h-12 sm:min-h-14 rounded-2xl border-b-4 font-display text-base sm:text-xl font-extrabold tracking-wide text-white shadow-lg transition-all active:translate-y-0.5 cursor-pointer disabled:cursor-default ${
              hasFeedback && lastAnswerResult?.correctIndex === 0
                ? 'border-emerald-800 bg-emerald-500 ring-4 ring-white/60'
                : hasFeedback && selectedIdx === 0 && !lastAnswerResult?.correct
                  ? 'border-red-800 bg-red-600 opacity-80'
                  : 'border-emerald-700 bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {t.tfTrueBtn}
          </button>

          <button
            type="button"
            disabled={hasFeedback}
            onClick={() => handleChoice(1)}
            className={`min-h-12 sm:min-h-14 rounded-2xl border-b-4 font-display text-base sm:text-xl font-extrabold tracking-wide text-white shadow-lg transition-all active:translate-y-0.5 cursor-pointer disabled:cursor-default ${
              hasFeedback && lastAnswerResult?.correctIndex === 1
                ? 'border-emerald-800 bg-emerald-500 ring-4 ring-white/60'
                : hasFeedback && selectedIdx === 1 && !lastAnswerResult?.correct
                  ? 'border-red-800 bg-red-600'
                  : 'border-red-800 bg-red-500 hover:bg-red-400'
            }`}
          >
            {t.tfFalseBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
