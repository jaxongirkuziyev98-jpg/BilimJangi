import { Crown, Gift, Search, Send, Trophy, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { socketActions } from '../hooks/useSocket';
import { TRANSLATIONS } from '../i18n/translations';
import { SUBJECTS, SubjectId } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function LeaderboardPage() {
  const { language, leaderboard, authProfile, setLeaderboard } = useGameStore();
  const t = TRANSLATIONS[language];

  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    socketActions.requestLeaderboard();
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      })
      .catch(() => {
        // Fallback to live Socket leaderboard_update
      });
  }, [setLeaderboard]);

  const filtered = leaderboard.filter((entry) => {
    const matchesSubject = subjectFilter === 'all' || entry.favoriteSubject === subjectFilter;
    const matchesName =
      !searchQuery.trim() ||
      entry.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesSubject && matchesName;
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-5xl px-3.5 sm:px-6 py-4 sm:py-8 space-y-5"
    >
      {/* Page Header */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 p-5 sm:p-7 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-100 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>{t.navRankings}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.leaderboardTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-sky-100 max-w-2xl">
            {t.leaderboardSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur-sm shrink-0 self-start sm:self-center">
          <Users className="h-4 w-4" />
          <span className="tabular-nums">{leaderboard.length}</span>
          <span>{t.duelReadyCount}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlayerPlaceholder}
            className="w-full min-h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.click();
              setSubjectFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              subjectFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.allSubjectsFilter}
          </button>
          {SUBJECTS.map((subj) => (
            <button
              key={subj.id}
              type="button"
              onClick={() => {
                soundEngine.click();
                setSubjectFilter(subj.id);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                subjectFilter === subj.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{subj.emoji}</span>
              <span>{t.subjects[subj.id].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-2.5">
        {filtered.map((entry, idx) => {
          const rank = entry.rank ?? idx + 1;
          const isMe = authProfile?.token === entry.playerToken;
          const subj = SUBJECTS.find((s) => s.id === entry.favoriteSubject);
          const totalAns = entry.correctTotal + entry.wrongTotal;
          const accuracy =
            totalAns === 0 ? 0 : Math.round((entry.correctTotal / totalAns) * 100);

          const rankStyle =
            rank === 1
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm'
              : rank === 2
                ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-sm'
                : rank === 3
                  ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

          return (
            <div
              key={entry.playerToken}
              className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isMe
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Left: Rank + Avatar + Name + Subject right next to them */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm sm:text-base font-extrabold tabular-nums ${rankStyle}`}
                >
                  {rank === 1 ? <Crown className="h-5 w-5" /> : `#${rank}`}
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl">
                  {entry.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {entry.fullName}
                    </span>
                    <span className="text-xs font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {rank}
                      {t.rankSuffix}
                    </span>
                    {isMe && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        · {t.youBadge}
                      </span>
                    )}
                    {entry.isBot && (
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                        · {t.botBadge}
                      </span>
                    )}
                  </div>

                  {/* Subject + Online/Accuracy inline metadata */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                      <span>{subj?.emoji}</span>
                      <span>{t.subjects[entry.favoriteSubject].name}</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="tabular-nums font-semibold">
                      Lv.{entry.level} · {entry.xp} XP
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="tabular-nums">{accuracy}%</span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                      <Gift className="h-3.5 w-3.5" />
                      {entry.giftsCount}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span
                      className={
                        entry.online
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {entry.online ? t.onlineLabel : t.offlineLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Invite to Game button */}
              {!isMe && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    socketActions.sendGameInvite(
                      entry.playerToken,
                      entry.favoriteSubject
                    );
                  }}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-display text-xs sm:text-sm font-bold text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{entry.isBot ? t.playVsBotBtn : t.inviteBtn}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.main>
  );
}
