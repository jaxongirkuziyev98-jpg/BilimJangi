import { Check, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

interface CustomQuestionModalProps {
  open: boolean;
  onClose: () => void;
}

export function CustomQuestionModal({ open, onClose }: CustomQuestionModalProps) {
  const { language, customQuestions } = useGameStore();
  const t = TRANSLATIONS[language];

  const [text, setText] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  useEffect(() => {
    if (open) {
      socketActions.getCustomQuestions();
    }
  }, [open]);

  if (!open) return null;

  const canSave = text.trim().length >= 3 && options.every((o) => o.trim().length >= 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    soundEngine.click();
    socketActions.addCustomQuestion({
      text: text.trim(),
      options: options.map((o) => o.trim()) as [string, string, string, string],
      correctIndex,
    });
    setText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {t.customModalTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t.questionTextLabel}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.questionTextPlaceholder}
              rows={2}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t.optionLabel} (A / B / C / D)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.correctOptionHint}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                const isCorrect = correctIndex === idx;
                return (
                  <div
                    key={letter}
                    className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(idx)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                      title={t.correctOptionHint}
                    >
                      {isCorrect ? <Check className="h-4 w-4" /> : letter}
                    </button>
                    <input
                      type="text"
                      value={options[idx]}
                      onChange={(e) => {
                        const next = [...options] as [string, string, string, string];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`${t.optionLabel} ${letter}`}
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              {t.saveQuestion}
            </button>
          </div>
        </form>

        {/* Saved Custom Questions List */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            {t.savedQuestionsList} ({customQuestions.length})
          </h4>
          {customQuestions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.noCustomQuestionsYet}
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {customQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {index + 1}. {q.text}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {q.options[q.correctIndex]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => socketActions.deleteCustomQuestion(q.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
