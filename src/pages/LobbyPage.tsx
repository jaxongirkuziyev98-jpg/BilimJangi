import {
  Bot,
  Check,
  Copy,
  Instagram,
  LogOut,
  Play,
  Plus,
  Send,
  Share2,
  Shuffle,
  UserX,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { CustomQuestionModal } from '../components/CustomQuestionModal';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { DuelSide, GameType, SUBJECTS, SubjectId } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function LobbyPage() {
  const { language, room, playerId } = useGameStore();
  const t = TRANSLATIONS[language];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [instagramHint, setInstagramHint] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!room) return null;

  const isHost = playerId === room.hostId;
  const me = room.players.find((p) => p.id === playerId);
  const teamA = room.players.filter((p) => p.side === 'A');
  const teamB = room.players.filter((p) => p.side === 'B');
  const hasMinPlayers = room.players.length >= 2;
  const bothTeamsHavePlayer = teamA.length >= 1 && teamB.length >= 1;
  const isReady = hasMinPlayers && bothTeamsHavePlayer;
  const activeSubjectMeta = SUBJECTS.find((s) => s.id === room.subject);

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?code=${room.code}`
      : `?code=${room.code}`;
  const fullInviteText = t.buildInviteText(
    room.code,
    `${activeSubjectMeta?.emoji ?? ''} ${t.subjects[room.subject].name}`,
    inviteUrl
  );
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    inviteUrl
  )}&text=${encodeURIComponent(fullInviteText)}`;

  const gameTypes: GameType[] = ['subject_battle', 'tug_of_war', 'race', 'quick_answer'];

  const handleCopyCode = async () => {
    soundEngine.click();
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleCopyFullInvite = async () => {
    soundEngine.click();
    try {
      await navigator.clipboard.writeText(fullInviteText);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleInstagramShare = async () => {
    soundEngine.click();
    try {
      await navigator.clipboard.writeText(fullInviteText);
      setInstagramHint(true);
      setTimeout(() => setInstagramHint(false), 4500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleNativeShare = async () => {
    soundEngine.click();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${t.appName} — ${room.code}`,
          text: fullInviteText,
          url: inviteUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyFullInvite();
    }
  };

  const renderTeamCard = (side: DuelSide) => {
    const members = side === 'A' ? teamA : teamB;
    const isBlue = side === 'A';
    const label = isBlue ? t.player1Label : t.player2Label;
    const isMyTeam = me?.side === side;

    return (
      <div
        className={`flex flex-col rounded-2xl border-2 p-5 transition-all min-h-[210px] ${
          isBlue
            ? 'border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/25'
            : 'border-orange-500/60 bg-orange-50/60 dark:bg-orange-950/25'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold tracking-wider ${
                isBlue ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
              }`}
            >
              {label}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
              · {members.length}
            </span>
          </div>

          {!isMyTeam ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.switchToSide(side);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white cursor-pointer whitespace-nowrap shrink-0 ${
                isBlue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {t.joinThisTeam}
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              ✓ {t.inThisTeam}
            </span>
          )}
        </div>

        {/* Members List (Unlimited) */}
        {members.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t.waitingOpponent}
            </p>
            {isHost && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  socketActions.addBot(side);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Bot className="h-4 w-4" />
                <span>{t.addBotBtn}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 flex-1">
            {members.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{p.avatar}</span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {[
                        p.id === playerId ? t.youBadge : null,
                        p.isHost ? t.hostBadge : null,
                        p.isBot ? t.botBadge : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || t.playerDefault}
                    </p>
                  </div>
                </div>

                {isHost && !p.isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.click();
                      socketActions.kickPlayer(p.id);
                    }}
                    title={t.kickOpponent}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            ))}
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
      {/* Top Room Header + Code */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.lobbyTitle} · {room.players.length} {t.duelReadyCount}
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
          {isHost && (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.addBot();
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-3.5 text-xs font-bold text-white hover:bg-violet-700 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bot className="h-4 w-4" />
              <span>{t.addBotBtn}</span>
            </button>
          )}

          {isHost && room.players.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                socketActions.shuffleTeams();
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Shuffle className="h-4 w-4" />
              <span>{t.shuffleTeamsBtn}</span>
            </button>
          )}

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

      {/* Social Invite & Share Box (Room Code + App Link for Telegram / Instagram) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.inviteSectionTitle}
          </h2>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCode ? t.copied : `${t.copyCode}: ${room.code}`}</span>
          </button>
        </div>

        {/* Read-only Invite Link + Code Box */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={t.inviteLinkLabel}
            className="flex-1 min-h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyFullInvite}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedInvite ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copiedInvite ? t.inviteCopied : t.copyFullInvite}</span>
          </button>
        </div>

        {/* Telegram / Instagram / Native Share Action Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#229ED9] px-4 text-xs font-bold text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>{t.shareTelegram}</span>
          </a>

          <a
            href="https://www.instagram.com/direct/inbox/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInstagramShare}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-4 text-xs font-bold text-white hover:brightness-110 transition-all whitespace-nowrap shrink-0"
          >
            <Instagram className="h-4 w-4" />
            <span>{t.shareInstagram}</span>
          </a>

          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="h-4 w-4" />
            <span>{t.shareMore}</span>
          </button>
        </div>

        {instagramHint && (
          <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">
            {t.instagramCopiedHint}
          </p>
        )}
      </div>

      {/* Odd-count / Uneven Team Alert with Quick Invite Link (e.g., 3 players -> invite 4th!) */}
      {(room.players.length % 2 !== 0 || teamA.length !== teamB.length) && room.players.length >= 2 && (
        <div className="rounded-2xl border-2 border-amber-400/70 dark:border-amber-600/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
              {t.oddCountTitle} ({teamA.length} vs {teamB.length})
            </p>
            <p className="mt-0.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
              {t.oddCountDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyFullInvite}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedInvite ? t.inviteCopied : t.copyFullInvite}</span>
            </button>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.click()}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#229ED9] px-3.5 text-xs font-bold text-white hover:brightness-110 whitespace-nowrap shrink-0"
            >
              <Send className="h-4 w-4" />
              <span>{t.shareTelegram}</span>
            </a>
            {isHost && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  socketActions.addBot();
                }}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-3.5 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Bot className="h-4 w-4" />
                <span>{t.addBotBtn}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {room.players.length >= 4 && room.players.length % 2 === 0 && teamA.length === teamB.length && (
        <div className="rounded-xl border border-emerald-300/70 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
          ✓ {teamA.length} vs {teamB.length} · {t.balancedTeamsReady}
        </div>
      )}

      {/* Team A vs Team B Unlimited Rosters */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
        <div className="md:col-span-5">{renderTeamCard('A')}</div>

        <div className="md:col-span-1 flex items-center justify-center py-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 font-display text-base font-extrabold text-white shadow-md">
            VS
          </div>
        </div>

        <div className="md:col-span-5">{renderTeamCard('B')}</div>
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
          {!hasMinPlayers
            ? t.needOpponentHint
            : !bothTeamsHavePlayer
              ? t.needBothTeamsHint
              : isHost
                ? t.readyToStartHint
                : t.waitingHostStart}
        </p>

        {isHost && (
          <button
            type="button"
            disabled={!hasMinPlayers}
            onClick={() => {
              soundEngine.click();
              socketActions.startGame();
            }}
            className={`inline-flex min-h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 font-display text-base font-bold text-white transition-all whitespace-nowrap shrink-0 ${
              isReady || hasMinPlayers
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
