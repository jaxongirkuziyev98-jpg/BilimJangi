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
        className="mx-auto max-w-4xl h-[calc(100dvh-3rem)] sm:h-auto overflow-hidden sm:overflow-visible flex flex-col justify-between sm:block px-3 sm:px-6 py-2 sm:py-8 gap-2 sm:space-y-5"
      >
        {/* Top Match HUD */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-5 py-1.5 sm:py-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 min-w-0">
            <span className="shrink-0">{subjectMeta?.emoji}</span>
            <span className="truncate">{t.subjects[room.subject].name}</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1 sm:py-1.5 font-mono text-sm sm:text-lg font-extrabold tabular-nums transition-colors shrink-0 ${
              isUrgent
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{formatTime(room.timeLeft)}</span>
          </div>

          {isHost ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                aria-label={room.status === 'paused' ? t.resumeGame : t.pauseGame}
                className="inline-flex h-8 sm:min-h-9 items-center gap-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                {room.status === 'paused' ? (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.resumeGame}</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.pauseGame}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  socketActions.endGame();
                }}
                aria-label={t.endGameNow}
                className="inline-flex h-8 sm:min-h-9 items-center gap-1 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Square className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.endGameNow}</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              #{room.code} · {room.players.length}
            </span>
          )}
        </div>

        {/* Active Game Arena */}
        <div className="shrink-0">
          {room.gameType === 'subject_battle' && (
            <SubjectBattleArena room={room} myId={playerId} />
          )}
          {room.gameType === 'tug_of_war' && (
            <TugOfWarArena room={room} myId={playerId} />
          )}
          {room.gameType === 'race' && (
            <RaceArena room={room} myId={playerId} />
          )}
          {room.gameType === 'quick_answer' && (
            <QuickAnswerArena room={room} myId={playerId} />
          )}
        </div>

        {/* Active Question Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-visible flex flex-col justify-center sm:block">
          <QuestionPanel
            question={currentQuestion}
            mathInputMode={room.mathInputMode}
            locked={isQuickLocked || Boolean(room.quickRoundWinner)}
            lockedMessage={
              isQuickLocked && !room.quickRoundWinner ? t.lockedThisRound : undefined
            }
          />
        </div>
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
