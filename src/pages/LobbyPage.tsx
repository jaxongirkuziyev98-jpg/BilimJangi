import {
  ArrowLeftRight,
  Check,
  Copy,
  LogOut,
  Play,
  Plus,
  Share2,
  UserX,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { CustomQuestionModal } from '../components/CustomQuestionModal';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { GameType, SUBJECTS, SubjectId } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function LobbyPage() {
  const { language, room, playerId } = useGameStore();
  const t = TRANSLATIONS[language];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!room) return null;

  const isHost = playerId === room.hostId;
  const playerA = room.players.find((p) => p.side === 'A');
  const playerB = room.players.find((p) => p.side === 'B');
  const isReady = room.players.length === 2;
  const activeSubjectMeta = SUBJECTS.find((s) => s.id === room.subject);

  const gameTypes: GameType[] = ['subject_battle', 'tug_of_war', 'race', 'quick_answer'];

  const handleCopyCode = async () => {
    soundEngine.click();
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleShareLink = async () => {
    soundEngine.click();
    const url = `${window.location.origin}?code=${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const renderSlotCard = (side: 'A' | 'B') => {
    const p = side === 'A' ? playerA : playerB;
    const isBlue = side === 'A';
    const label = isBlue ? t.player1Label : t.player2Label;

    return (
      <div
        className={`flex flex-col justify-between rounded-2xl border-2 p-5 sm:p-6 transition-all min-h-[172px] ${
          p
            ? isBlue
              ? 'border-blue-500/70 bg-blue-50/70 dark:bg-blue-950/30'
              : 'border-orange-500/70 bg-orange-50/70 dark:bg-orange-950/30'
            : 'border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-extrabold tracking-wider ${
              isBlue ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
            }`}
          >
            {label}
          </span>
          {p && isHost && !p.isHost && (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.kickPlayer(p.id);
              }}
              title={t.kickOpponent}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>{t.kickOpponent}</span>
            </button>
          )}
        </div>

        {p ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 flex items-center gap-4"
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-sm ${
                isBlue ? 'bg-blue-600/15 dark:bg-blue-500/20' : 'bg-orange-600/15 dark:bg-orange-500/20'
              }`}
            >
              {p.avatar}
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl font-extrabold text-slate-900 dark:text-white truncate">
                {p.name}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                {[
                  p.id === playerId ? t.youBadge : null,
                  p.isHost ? t.hostBadge : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || '1v1'}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center text-center py-2">
            <p className="font-display text-base font-semibold text-slate-400 dark:text-slate-500">
              {t.waitingOpponent}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10 space-y-6"
    >
      {/* Top Room Header + Share Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.lobbyTitle} · {room.players.length}/2 {t.duelReadyCount}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.roomCodeLabel}:
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-[0.18em] text-slate-900 dark:text-white tabular-nums">
              {room.code}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copiedCode ? t.copied : t.copyCode}</span>
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            <span>{copiedLink ? t.linkCopied : t.shareLink}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              socketActions.leaveRoom();
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>{t.leaveRoom}</span>
          </button>
        </div>
      </div>

      {/* 2-Player Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          style={{ width: `${(room.players.length / 2) * 100}%` }}
          className={`h-full transition-all duration-300 ${
            isReady ? 'bg-emerald-500' : 'bg-violet-600'
          }`}
        />
      </div>

      {/* 1v1 Duelist Slots */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        <div className="md:col-span-5">{renderSlotCard('A')}</div>

        <div className="md:col-span-1 flex flex-col items-center justify-center gap-2 py-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 font-display text-base font-extrabold text-white shadow-md">
            VS
          </div>
          {isHost && (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.switchSide();
              }}
              title={t.switchSide}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-5">{renderSlotCard('B')}</div>
      </div>

      {/* Subject & Questions Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.activeSubjectLabel}
            </span>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
              {activeSubjectMeta?.emoji} {t.subjects[room.subject].name}
              <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                · {t[room.difficulty]} · {room.durationMinutes} {t.minutes}
              </span>
            </h2>
          </div>

          {isHost && (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setModalOpen(true);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40 px-4 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>
                {t.addCustomQuestion}
                {room.customQuestionsCount > 0 ? ` (${room.customQuestionsCount})` : ''}
              </span>
            </button>
          )}
        </div>

        {/* Host Subject Switcher */}
        {isHost && (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {SUBJECTS.map((subj) => {
              const active = room.subject === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    socketActions.updateSettings({
                      code: room.code,
                      subject: subj.id as SubjectId,
                    });
                  }}
                  style={active ? { borderColor: subj.color } : undefined}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 px-2 py-2.5 text-center transition-all cursor-pointer ${
                    active
                      ? `${subj.bgLight} ${subj.bgDark} shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{subj.emoji}</span>
                  <span className="mt-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-full">
                    {t.subjects[subj.id].name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 Mini-Games Selector */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
          {t.chooseGameTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {gameTypes.map((gt) => {
            const active = room.gameType === gt;
            const meta = t.games[gt];
            const displayTitle =
              gt === 'subject_battle'
                ? t.subjectBattleName(t.subjects[room.subject].name)
                : meta.name;

            return (
              <button
                key={gt}
                type="button"
                disabled={!isHost}
                onClick={() => {
                  if (!isHost) return;
                  soundEngine.click();
                  socketActions.updateSettings({ code: room.code, gameType: gt });
                }}
                className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  active
                    ? 'border-violet-600 bg-violet-50/80 dark:bg-violet-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                } ${isHost ? 'cursor-pointer hover:border-violet-400' : 'cursor-default'}`}
              >
                <span className="text-3xl mb-2">{meta.emoji}</span>
                <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {displayTitle}
                </span>
                <span className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {meta.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Action Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-center sm:text-left">
          {!isReady
            ? t.needOpponentHint
            : isHost
              ? t.readyToStartHint
              : t.waitingHostStart}
        </p>

        {isHost && (
          <button
            type="button"
            disabled={!isReady}
            onClick={() => {
              soundEngine.click();
              socketActions.startGame();
            }}
            className={`inline-flex min-h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 font-display text-base font-bold text-white transition-all whitespace-nowrap shrink-0 ${
              isReady
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>{t.startDuel}</span>
          </button>
        )}
      </div>

      <CustomQuestionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.main>
  );
}
