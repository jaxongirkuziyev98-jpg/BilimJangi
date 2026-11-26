import { Award, Gamepad2, Moon, Sun, Trophy, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, SUBJECTS } from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { useGameStore } from '../store/useGameStore';

export function TopBar() {
  const {
    language,
    theme,
    soundEnabled,
    reconnecting,
    noticeBanner,
    room,
    screen,
    authProfile,
    setLanguage,
    toggleTheme,
    toggleSound,
    setScreen,
  } = useGameStore();

  const t = TRANSLATIONS[language];
  const langs: Language[] = ['uz', 'ru', 'en'];
  const activeSubject = room ? SUBJECTS.find((s) => s.id === room.subject) : null;
  const showNav = Boolean(authProfile) && screen !== 'game' && screen !== 'lobby' && screen !== 'login';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${t.appName} — ${t.tagline}`;
    }
  }, [t.appName, t.tagline]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-12 sm:h-16 max-w-6xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              if (!authProfile) return;
              if (screen === 'game' || screen === 'lobby') return;
              soundEngine.click();
              setScreen('welcome');
            }}
            className="flex items-center gap-2 shrink-0 min-w-0 cursor-pointer"
          >
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-orange-500 text-white font-display font-extrabold text-sm sm:text-lg shadow-sm shrink-0">
              {t.appName.charAt(0)}
            </div>
            <span className="font-display text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              {t.appName}
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links OR Live Room Metadata */}
          {room && (screen === 'lobby' || screen === 'game' || screen === 'results') ? (
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 truncate">
              <span className="font-medium text-slate-900 dark:text-white">
                {activeSubject?.emoji} {t.subjects[room.subject].name}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-mono tabular-nums font-semibold tracking-wider text-slate-700 dark:text-slate-200">
                #{room.code}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span>{t.games[room.gameType].name}</span>
            </div>
          ) : showNav ? (
            <nav className="flex items-center gap-1 sm:gap-5 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setScreen('welcome');
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  screen === 'welcome' || screen === 'profile' || screen === 'create_room' || screen === 'join_room'
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline" />
                <span>{t.navPlay}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setScreen('dashboard');
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  screen === 'dashboard'
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline" />
                <span>{t.navProfile}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.click();
                  setScreen('leaderboard');
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  screen === 'leaderboard'
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 hidden sm:inline" />
                <span>{t.navRankings}</span>
              </button>
            </nav>
          ) : null}

          {/* Zone 3: Language + Sound + Theme Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher */}
            <div
              className="flex items-center rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 sm:p-1 border border-slate-200/80 dark:border-slate-800"
              role="group"
              aria-label="Language"
            >
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    soundEngine.click();
                    setLanguage(l);
                  }}
                  className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase rounded-md sm:rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    language === l
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label={soundEnabled ? t.soundOn : t.soundOff}
              className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                toggleTheme();
              }}
              aria-label="Toggle theme"
              className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {theme === 'light' ? <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Reconnecting or Global Notice Banner */}
      {(reconnecting || noticeBanner) && (
        <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
          {reconnecting && <WifiOff className="h-4 w-4 shrink-0" />}
          <span>{reconnecting ? t.reconnecting : noticeBanner}</span>
        </div>
      )}
    </>
  );
}
