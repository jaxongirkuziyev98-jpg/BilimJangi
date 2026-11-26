import { Check, Copy, LogIn, Swords, X } from 'lucide-react';
import { useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function InviteModal() {
  const {
    language,
    incomingInvite,
    outgoingInviteInfo,
    setIncomingInvite,
    setOutgoingInviteInfo,
    setScreen,
  } = useGameStore();
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = async (roomCode: string) => {
    const url = `${window.location.origin}/?code=${roomCode}`;
    try {
      await navigator.clipboard.writeText(`${roomCode} · ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (incomingInvite) {
    const subj = SUBJECTS.find((s) => s.id === incomingInvite.subject);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15 text-2xl">
                {incomingInvite.fromAvatar}
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.incomingInviteTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{incomingInvite.fromName}</strong>{' '}
                  {t.incomingInviteDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingInvite(null)}
              aria-label={t.close}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {subj?.emoji} {t.subjects[incomingInvite.subject].name}
            </span>
            <span className="font-mono font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
              #{incomingInvite.roomCode}
            </span>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                const code = incomingInvite.roomCode;
                setIncomingInvite(null);
                socketActions.joinRoom(code);
              }}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-display text-sm font-bold text-white shadow-md hover:brightness-110 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="h-4 w-4" />
              <span>{t.acceptInviteBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setIncomingInvite(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
            >
              {t.declineInviteBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (outgoingInviteInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.inviteSentTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  <strong className="text-slate-900 dark:text-white">
                    {outgoingInviteInfo.targetName}
                  </strong>{' '}
                  {outgoingInviteInfo.delivered ? t.inviteDeliveredDesc : t.inviteOfflineDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOutgoingInviteInfo(null)}
              aria-label={t.close}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5">
            <span className="font-mono text-base font-extrabold tracking-widest text-slate-900 dark:text-white">
              {outgoingInviteInfo.roomCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyInvite(outgoingInviteInfo.roomCode)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:brightness-95 cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t.copied : t.copyFullInvite}</span>
            </button>
          </div>

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                setOutgoingInviteInfo(null);
                setScreen('lobby');
              }}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-display text-sm font-bold text-white hover:brightness-110 cursor-pointer whitespace-nowrap"
            >
              {t.goToLobbyBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
