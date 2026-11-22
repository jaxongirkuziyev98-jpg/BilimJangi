import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function CountdownOverlay() {
  const { room, language } = useGameStore();
  const [step, setStep] = useState<number>(3);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!room || room.status !== 'countdown') return;
    setStep(3);
    soundEngine.countdownTick();

    const t1 = setTimeout(() => {
      setStep(2);
      soundEngine.countdownTick();
    }, 900);
    const t2 = setTimeout(() => {
      setStep(1);
      soundEngine.countdownTick();
    }, 1800);
    const t3 = setTimeout(() => {
      setStep(0);
      soundEngine.countdownGo();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [room?.status]);

  if (!room || room.status !== 'countdown') return null;

  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const subjectMeta = SUBJECTS.find((s) => s.id === room.subject);
  const gameTitle =
    room.gameType === 'subject_battle'
      ? t.subjectBattleName(t.subjects[room.subject].name)
      : t.games[room.gameType].name;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-lg px-4 text-white">
      <div className="mb-8 text-center">
        <div className="text-sm font-medium text-slate-300">
          {subjectMeta?.emoji} {t.subjects[room.subject].name} · {gameTitle}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center">
            <div className="flex -space-x-2">
              {teamA.slice(0, 4).map((p) => (
                <span key={p.id} className="text-3xl sm:text-4xl">
                  {p.avatar}
                </span>
              ))}
            </div>
            <span className="mt-2 font-display font-bold text-blue-400">
              {teamA.length === 1 ? teamA[0].name : `${t.teamALabel} (${teamA.length})`}
            </span>
          </div>

          <span className="font-display text-2xl font-extrabold text-slate-400">VS</span>

          <div className="flex flex-col items-center">
            <div className="flex -space-x-2">
              {teamB.slice(0, 4).map((p) => (
                <span key={p.id} className="text-3xl sm:text-4xl">
                  {p.avatar}
                </span>
              ))}
            </div>
            <span className="mt-2 font-display font-bold text-orange-400">
              {teamB.length === 1 ? teamB[0].name : `${t.teamBLabel} (${teamB.length})`}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          {step > 0 ? (
            <span className="font-display text-8xl sm:text-9xl font-extrabold tabular-nums bg-gradient-to-br from-blue-400 via-violet-400 to-orange-400 bg-clip-text text-transparent">
              {step}
            </span>
          ) : (
            <span className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-emerald-400">
              {t.countdownGo}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
