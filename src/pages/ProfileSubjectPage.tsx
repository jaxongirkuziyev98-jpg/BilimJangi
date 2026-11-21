import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { AVATARS, SUBJECTS, SubjectId } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function ProfileSubjectPage() {
  const {
    language,
    playerName,
    playerAvatar,
    selectedSubject,
    flowIntent,
    setPlayerProfile,
    setScreen,
  } = useGameStore();
  const t = TRANSLATIONS[language];

  const [name, setName] = useState(playerName);
  const [avatar, setAvatar] = useState(playerAvatar || AVATARS[0]);
  const [subject, setSubject] = useState<SubjectId>(selectedSubject || 'math');
  const [nameError, setNameError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 15) {
      setNameError(true);
      return;
    }
    soundEngine.click();
    setPlayerProfile(trimmed, avatar, subject);
    setScreen(flowIntent === 'create' ? 'create_room' : 'join_room');
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12"
    >
      <button
        type="button"
        onClick={() => {
          soundEngine.click();
          setScreen('welcome');
        }}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t.profileTitle}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          {t.profileSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name + Avatar Panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div>
            <label
              htmlFor="player-name-input"
              className="block text-sm font-bold text-slate-900 dark:text-white mb-2"
            >
              {t.yourName}
            </label>
            <input
              id="player-name-input"
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder={t.namePlaceholder}
              className={`w-full min-h-12 rounded-xl border-2 px-4 text-base font-semibold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none transition-colors ${
                nameError
                  ? 'border-red-500 animate-shake'
                  : 'border-slate-200 dark:border-slate-700 focus:border-violet-500'
              }`}
            />
            {nameError && (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                {t.nameError}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
              {t.chooseAvatar}
            </span>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {AVATARS.map((av) => {
                const active = avatar === av;
                return (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      soundEngine.click();
                      setAvatar(av);
                    }}
                    className={`flex h-12 items-center justify-center rounded-xl border-2 text-2xl transition-transform cursor-pointer ${
                      active
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/50 scale-105 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mandatory Subject Picker */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {t.chooseSubject}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.subjectRequiredHint}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBJECTS.map((subj) => {
              const active = subject === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setSubject(subj.id);
                  }}
                  style={active ? { borderColor: subj.color } : undefined}
                  className={`relative flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                    active
                      ? `${subj.bgLight} ${subj.bgDark} scale-[1.02] shadow-md`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl leading-none shrink-0 mt-0.5">{subj.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {t.subjects[subj.id].name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {t.subjects[subj.id].desc}
                    </p>
                  </div>
                  {active && (
                    <span
                      style={{ backgroundColor: subj.color }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {subject === 'math' ? t.mathAutoNote : t.subjectCustomNote}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex min-h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 font-display text-base font-bold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{t.continueBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.main>
  );
}
