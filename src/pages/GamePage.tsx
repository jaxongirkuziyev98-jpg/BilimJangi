import { Clock, Pause, Play, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { QuestionPanel } from '../components/QuestionPanel';
import { QuickAnswerArena } from '../components/arenas/QuickAnswerArena';
import { RaceArena } from '../components/arenas/RaceArena';
import { SubjectBattleArena } from '../components/arenas/SubjectBattleArena';
import { TugOfWarArena } from '../components/arenas/TugOfWarArena';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function GamePage() {
  const { language, room, playerId, currentQuestion } = useGameStore();
  const t = TRANSLATIONS[language];

  if (!room) return null;

  const isHost = playerId === room.hostId;
  const playerA = room.players.find((p) => p.side === 'A');
  const playerB = room.players.find((p) => p.side === 'B');
  const subjectMeta = SUBJECTS.find((s) => s.id === room.subject);
  const isUrgent = room.timeLeft <= 10 && room.status === 'playing';

  const isQuickLocked =
    room.gameType === 'quick_answer' &&
    Boolean(playerId && room.quickRoundLockedPlayerIds.includes(playerId));

  return (
    <>
      <CountdownOverlay />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-5"
      >
        {/* Top Match HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <span>{subjectMeta?.emoji}</span>
            <span>{t.subjects[room.subject].name}</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 font-mono text-lg font-extrabold tabular-nums transition-colors ${
              isUrgent
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTime(room.timeLeft)}</span>
          </div>

          {isHost ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  if (room.status === 'paused') {
                    socketActions.resumeGame();
                  } else {
                    socketActions.pauseGame();
                  }
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                {room.status === 'paused' ? (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>{t.resumeGame}</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>{t.pauseGame}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  socketActions.endGame();
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Square className="h-3.5 w-3.5" />
                <span>{t.endGameNow}</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              1v1 · #{room.code}
            </span>
          )}
        </div>

        {/* Active Game Arena */}
        {room.gameType === 'subject_battle' && (
          <SubjectBattleArena room={room} playerA={playerA} playerB={playerB} myId={playerId} />
        )}
        {room.gameType === 'tug_of_war' && (
          <TugOfWarArena room={room} playerA={playerA} playerB={playerB} myId={playerId} />
        )}
        {room.gameType === 'race' && (
          <RaceArena room={room} playerA={playerA} playerB={playerB} myId={playerId} />
        )}
        {room.gameType === 'quick_answer' && (
          <QuickAnswerArena room={room} playerA={playerA} playerB={playerB} myId={playerId} />
        )}

        {/* Active Question Panel */}
        <QuestionPanel
          question={currentQuestion}
          mathInputMode={room.mathInputMode}
          locked={isQuickLocked || Boolean(room.quickRoundWinner)}
          lockedMessage={
            isQuickLocked && !room.quickRoundWinner ? t.lockedThisRound : undefined
          }
        />
      </motion.main>

      {/* Pause Overlay */}
      {room.status === 'paused' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 text-center shadow-2xl">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.pausedTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t.pausedDesc}
            </p>
            {isHost && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    socketActions.resumeGame();
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  {t.resumeGame}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    socketActions.endGame();
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  <Square className="h-4 w-4" />
                  {t.endGameNow}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
