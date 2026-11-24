import { ArrowLeft, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import {
  Difficulty,
  MathInputMode,
  QuestionMode,
  SUBJECTS,
} from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function CreateRoomPage() {
  const { language, selectedSubject, setScreen } = useGameStore();
  const t = TRANSLATIONS[language];

  const [durationMinutes, setDurationMinutes] = useState<1 | 2 | 3>(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionMode, setQuestionMode] = useState<QuestionMode>('auto');
  const [mathInputMode, setMathInputMode] = useState<MathInputMode>('choice');
  const [wrongPenalty, setWrongPenalty] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  const activeSubj = SUBJECTS.find((s) => s.id === selectedSubject);

  const handleCreate = () => {
    soundEngine.click();
    socketActions.createRoom({
      subject: selectedSubject,
      difficulty,
      durationMinutes,
      questionMode,
      wrongPenalty,
      mathInputMode,
      shuffleQuestions,
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-12"
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

      <div className="mb-5 sm:mb-8 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.createRoomTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-base text-slate-600 dark:text-slate-300">
            {t.createRoomSubtitle}
          </p>
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          {activeSubj?.emoji} {t.subjects[selectedSubject].name}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Duration */}
        <div>
          <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {t.durationLabel}
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {([1, 2, 3] as const).map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setDurationMinutes(min);
                }}
                className={`min-h-11 sm:min-h-12 rounded-xl border-2 font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  durationMinutes === min
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                {min} {t.minutes}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {t.difficultyLabel}
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setDifficulty(diff);
                }}
                className={`min-h-11 sm:min-h-12 rounded-xl border-2 font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  difficulty === diff
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t[diff]}
              </button>
            ))}
          </div>
        </div>

        {/* Math Input Mode */}
        {selectedSubject === 'math' && (
          <div>
            <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.mathInputLabel}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {(['choice', 'numeric'] as MathInputMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setMathInputMode(mode);
                  }}
                  className={`min-h-11 sm:min-h-12 rounded-xl border-2 px-2 sm:px-4 font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                    mathInputMode === mode
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mode === 'choice' ? t.choiceMode : t.numericMode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Source */}
        <div>
          <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {t.questionSourceLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {(['auto', 'custom'] as QuestionMode[]).map((qm) => (
              <button
                key={qm}
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setQuestionMode(qm);
                }}
                className={`min-h-11 sm:min-h-12 rounded-xl border-2 px-3 sm:px-4 font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                  questionMode === qm
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
              >
                {qm === 'auto' ? t.autoQuestions : t.customQuestions}
              </button>
            ))}
          </div>
        </div>

        {/* Wrong Answer Penalty + Shuffle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.wrongPenaltyLabel}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[false, true].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setWrongPenalty(val);
                  }}
                  className={`min-h-11 rounded-xl border-2 px-2.5 sm:px-3 text-xs font-bold transition-colors cursor-pointer ${
                    wrongPenalty === val
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {val ? t.penaltyOn : t.penaltyOff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setShuffleQuestions(!shuffleQuestions);
              }}
              className={`w-full min-h-11 rounded-xl border-2 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                shuffleQuestions
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
              }`}
            >
              {shuffleQuestions ? '✓ ' : ''}
              {t.shuffleLabel}
            </button>
          </div>
        </div>

        <div className="pt-1 sm:pt-2">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex min-h-12 sm:min-h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 px-6 sm:px-8 py-3 font-display text-base font-bold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="h-5 w-5" />
            <span>{t.openLobby}</span>
          </button>
        </div>
      </div>
    </motion.main>
  );
}
