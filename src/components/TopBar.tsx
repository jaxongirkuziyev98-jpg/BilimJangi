import { Moon, Sun, Volume2, VolumeX, WifiOff } from 'lucide-react';
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
    setLanguage,
    toggleTheme,
    toggleSound,
  } = useGameStore();

  const t = TRANSLATIONS[language];
  const langs: Language[] = ['uz', 'ru', 'en'];
  const activeSubject = room ? SUBJECTS.find((s) => s.id === room.subject) : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-orange-500 text-white font-display font-extrabold text-lg shadow-sm">
              B
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              {t.appName}
            </span>
          </div>

          {/* Center Context Metadata (Unboxed typographic separators) */}
          {room && (screen === 'lobby' || screen === 'game' || screen === 'results') && (
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
          )}

          {/* Controls Zone */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div
              className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/80 dark:border-slate-800"
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
                  className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.click();
                toggleTheme();
              }}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
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
