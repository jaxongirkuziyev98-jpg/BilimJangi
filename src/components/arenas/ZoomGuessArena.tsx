import { CheckCircle2, Delete, RotateCcw, Search, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { socketActions } from '../../hooks/useSocket';
import { TRANSLATIONS } from '../../i18n/translations';
import { PublicQuestion, PublicRoomState } from '../../shared/types';
import { soundEngine } from '../../sounds/soundEngine';
import { useGameStore } from '../../store/useGameStore';
import { QuestionVisual } from '../QuestionVisual';

interface ZoomGuessArenaProps {
  room: PublicRoomState;
  question: PublicQuestion | null;
}

export function ZoomGuessArena({ room, question }: ZoomGuessArenaProps) {
  const { language, lastAnswerResult } = useGameStore();
  const t = TRANSLATIONS[language];

  const [pickedTileIndices, setPickedTileIndices] = useState<number[]>([]);

  useEffect(() => {
    setPickedTileIndices([]);
  }, [question?.id, language]);

  if (!question || !question.visualId) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.waitingNextRound}</p>
      </div>
    );
  }

  const wordLen = question.zoomWordLengths?.[language] ?? 4;
  const tiles = question.scrambledLetters?.[language] ?? [];
  const hasFeedback = lastAnswerResult?.questionId === question.id;

  const builtWord = pickedTileIndices.map((idx) => tiles[idx] ?? '').join('');

  const handleTapLetter = (tileIdx: number) => {
    if (hasFeedback) return;
    if (pickedTileIndices.includes(tileIdx)) return;
    if (pickedTileIndices.length >= wordLen) return;

    soundEngine.click();
    const next = [...pickedTileIndices, tileIdx];
    setPickedTileIndices(next);

    if (next.length === wordLen) {
      const answer = next.map((i) => tiles[i] ?? '').join('');
      socketActions.submitAnswer({
        questionId: question.id,
        textAnswer: answer,
        language,
      });
    }
  };

  const handleBackspace = () => {
    if (hasFeedback || pickedTileIndices.length === 0) return;
    soundEngine.click();
    setPickedTileIndices((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (hasFeedback || pickedTileIndices.length === 0) return;
    soundEngine.click();
    setPickedTileIndices([]);
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

      {/* Main Zoom Lens Stage (inspired by image_915eb23a.png adapted to BilimJang theme) */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500 via-teal-600 to-blue-700 dark:from-cyan-900 dark:via-teal-900 dark:to-slate-900 p-3.5 sm:p-5 text-white shadow-lg overflow-hidden ${
          hasFeedback && !lastAnswerResult?.correct ? 'animate-shake' : ''
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          {/* Magnifying Glass Lens Frame */}
          <div className="relative shrink-0">
            {/* Magnifier handle */}
            <div
              className="hidden sm:block absolute -bottom-3 -right-3 h-10 w-3.5 -rotate-45 rounded-full bg-gradient-to-b from-slate-600 to-slate-900 border border-slate-400/40 shadow-md"
              aria-hidden="true"
            />
            <div className="relative h-32 w-32 sm:h-44 sm:w-44 rounded-full border-4 border-slate-100/90 bg-white shadow-2xl overflow-hidden">
              <QuestionVisual
                visualId={question.visualId}
                zoomed={!hasFeedback}
                className="w-full h-full border-0 rounded-full"
              />
              {/* Glass reflection sheen */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* WHAT IS THIS? Banner & Letter Slots */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-200 shrink-0" />
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_0_rgba(15,23,42,0.45)]">
                {t.zoomGuessBanner}
              </h2>
            </div>

            {/* Blank White Rounded Letter Slots */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              {Array.from({ length: wordLen }, (_, slotIdx) => {
                const char = builtWord[slotIdx] ?? '';
                const slotStyle = hasFeedback
                  ? lastAnswerResult?.correct
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : 'border-red-400 bg-red-500 text-white'
                  : char
                    ? 'border-blue-300 bg-white text-slate-900'
                    : 'border-white/70 bg-white/95 text-slate-900';

                return (
                  <div
                    key={slotIdx}
                    className={`flex h-11 w-9 sm:h-13 sm:w-11 items-center justify-center rounded-xl border-2 font-display text-lg sm:text-2xl font-extrabold shadow-md transition-all ${slotStyle}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {hasFeedback && lastAnswerResult && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold">
                {lastAnswerResult.correct ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.correctFeedback}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-100">
                    <XCircle className="h-4 w-4" />
                    {t.wrongFeedback} · {lastAnswerResult.correctWord}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrambled Letter Tiles + Backspace/Clear */}
        <div className="relative z-10 mt-3 sm:mt-4 pt-3 border-t border-white/20 flex flex-col items-center gap-2.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {tiles.map((letter, idx) => {
              const used = pickedTileIndices.includes(idx);
              return (
                <button
                  key={`${idx}_${letter}`}
                  type="button"
                  disabled={used || hasFeedback}
                  onClick={() => handleTapLetter(idx)}
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border-b-4 font-display text-base sm:text-lg font-extrabold transition-all ${
                    used
                      ? 'border-slate-500/30 bg-slate-900/25 text-white/30 cursor-default'
                      : 'border-slate-300 bg-white text-slate-900 hover:-translate-y-0.5 active:translate-y-0.5 shadow-sm cursor-pointer'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={hasFeedback || pickedTileIndices.length === 0}
              onClick={handleBackspace}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900/35 hover:bg-slate-900/50 disabled:opacity-40 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
            >
              <Delete className="h-3.5 w-3.5" />
              <span>{t.zoomBackspaceBtn}</span>
            </button>
            <button
              type="button"
              disabled={hasFeedback || pickedTileIndices.length === 0}
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900/35 hover:bg-slate-900/50 disabled:opacity-40 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.zoomClearBtn}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
