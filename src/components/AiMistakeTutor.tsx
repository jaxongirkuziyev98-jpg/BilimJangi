import {
  AlertCircle,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Pause,
  PenTool,
  Play,
  RefreshCw,
  Volume2,
  XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import {
  AiDiagramSpec,
  AiExplainResponse,
  AnswerAttempt,
  Language,
  SubjectId,
} from '../shared/types';
import { soundEngine } from '../sounds/soundEngine';
import { AiVisualBoard } from './AiVisualBoard';

interface AiMistakeTutorProps {
  playerName: string;
  subject: SubjectId;
  language: Language;
  correctCount: number;
  wrongCount: number;
  attempts: AnswerAttempt[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  spokenText?: string;
  diagram?: AiDiagramSpec;
}

const WAVE_BARS = [
  14, 22, 34, 18, 28, 36, 20, 14, 26, 32, 18, 28, 20, 12, 24, 34, 22, 16, 28, 36, 22, 16, 12, 20,
  28, 18, 14, 24, 30, 18, 12, 18,
];

function formatAudioSeconds(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

function resolveAttemptText(attempt: AnswerAttempt, lang: Language) {
  const loc = attempt.localized?.[lang];
  const question = loc?.text ?? attempt.text;
  const yourAnswer =
    attempt.chosenIndex >= 0 && loc?.options?.[attempt.chosenIndex]
      ? loc.options[attempt.chosenIndex]
      : attempt.chosenText;
  const correctAnswer =
    loc?.options?.[attempt.correctIndex] ?? attempt.correctText;
  return { question, yourAnswer, correctAnswer, correct: attempt.correct };
}

export function AiMistakeTutor({
  playerName,
  subject,
  language,
  correctCount,
  wrongCount,
  attempts,
}: AiMistakeTutorProps) {
  const t = TRANSLATIONS[language];
  const subjectName = t.subjects[subject].name;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiExplainResponse | null>(null);
  const [activeMistakeIdx, setActiveMistakeIdx] = useState(0);

  // Audio playback state (matching reference waveform bar in image_b7f3f804.png)
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(11);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Follow-up chat state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeakingId(null);
    setAudioProgress(0);
    setAudioCurrentTime(0);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    stopAudio();

    const localizedAttempts = attempts.map((a) => resolveAttemptText(a, language));

    try {
      const res = await fetch('/api/ai/explain-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          subjectName,
          language,
          correctCount,
          wrongCount,
          attempts: localizedAttempts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'AI service unavailable');
      }
      setAnalysis(data as AiExplainResponse);
      setActiveMistakeIdx(0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load AI explanation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, subject, language, correctCount, wrongCount]);

  const handlePlayVoice = async (clipId: string, textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    if (speakingId === clipId) {
      stopAudio();
      return;
    }

    stopAudio();
    setAudioError(null);

    try {
      let dataUrl = audioCacheRef.current.get(clipId);
      if (!dataUrl) {
        setAudioLoadingId(clipId);
        const res = await fetch('/api/ai/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak, language }),
        });
        const data = await res.json();
        if (!res.ok || !data?.audioBase64) {
          throw new Error(data?.error || 'Speech generation failed');
        }
        dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        audioCacheRef.current.set(clipId, dataUrl);
      }

      const audio = new Audio(dataUrl);
      audioRef.current = audio;
      setSpeakingId(clipId);

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setAudioDuration(Math.ceil(audio.duration));
        }
      };

      audio.ontimeupdate = () => {
        const dur = audio.duration || 1;
        setAudioCurrentTime(audio.currentTime);
        setAudioProgress(Math.min(1, audio.currentTime / dur));
      };

      audio.onended = () => {
        setSpeakingId(null);
        setAudioProgress(0);
        setAudioCurrentTime(0);
      };

      await audio.play();
    } catch (err) {
      setSpeakingId(null);
      setAudioError(err instanceof Error ? err.message : 'Audio failed');
    } finally {
      setAudioLoadingId(null);
    }
  };

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    soundEngine.click();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          subjectName,
          language,
          contextMistakes: (analysis?.mistakes ?? []).map((m) => ({
            question: m.question,
            yourAnswer: m.yourAnswer,
            correctAnswer: m.correctAnswer,
          })),
          history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'AI chat failed');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          spokenText: data.spokenReply,
          diagram: data.diagram,
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: err instanceof Error ? err.message : 'AI error',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeMistake = analysis?.mistakes[activeMistakeIdx];

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
      {/* Top Friendly Robot Avatar & Header (matching reference image_b7f3f804.png) */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-sky-50/90 to-white dark:from-slate-950 dark:to-slate-900 px-5 py-6 text-center">
        {/* Glowing Friendly AI Bot Head */}
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-600 p-1 shadow-lg shadow-blue-500/25">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
            <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
              <rect x="8" y="10" width="32" height="24" rx="10" fill="#E2E8F0" />
              <rect x="13" y="15" width="22" height="14" rx="6" fill="#0F172A" />
              <circle cx="20" cy="21" r="2.2" fill="#38BDF8" />
              <circle cx="28" cy="21" r="2.2" fill="#38BDF8" />
              <path
                d="M20 25 Q24 28 28 25"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="24" cy="6" r="2.5" fill="#38BDF8" />
              <path d="M24 8v2" stroke="#94A3B8" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.aiTutorTitle}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          {t.aiTutorSubtitle}
        </p>

        {/* Exact Right vs Wrong Counter Bar */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-2.5 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {subjectName}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {correctCount} {t.aiRightCount}
            </span>
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tabular-nums text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span>
              {wrongCount} {t.aiWrongCount}
            </span>
          </span>
        </div>
      </div>

      {/* Main AI Body */}
      <div className="p-4 sm:p-6 space-y-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t.aiAnalyzing}
            </p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-sm text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => void fetchAnalysis()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t.aiRetryBtn}</span>
            </button>
          </div>
        )}

        {!loading && analysis && (
          <>
            {/* Written Summary + Voice Waveform Player (matching reference image_b7f3f804.png) */}
            <div className="space-y-3">
              <div className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-white">{analysis.greeting}</p>
                <p className="text-slate-600 dark:text-slate-300">{analysis.overallSummary}</p>
              </div>

              {/* Waveform Voice Bar (Gapirib tushuntirish) */}
              {analysis.spokenScript && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice('summary', analysis.spokenScript)}
                    disabled={audioLoadingId === 'summary'}
                    aria-label={speakingId === 'summary' ? t.aiPauseVoice : t.aiPlayVoice}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                  >
                    {audioLoadingId === 'summary' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : speakingId === 'summary' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </button>

                  {/* Waveform Bars */}
                  <div className="flex-1 flex items-center gap-[3px] h-9 overflow-hidden">
                    {WAVE_BARS.map((h, i) => {
                      const barRatio = i / WAVE_BARS.length;
                      const isActive =
                        speakingId === 'summary' && barRatio <= Math.max(0.06, audioProgress);
                      return (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`flex-1 rounded-full transition-colors ${
                            isActive
                              ? 'bg-blue-600 dark:bg-blue-400'
                              : 'bg-sky-300/70 dark:bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <span className="font-mono text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                    {speakingId === 'summary'
                      ? formatAudioSeconds(audioCurrentTime)
                      : formatAudioSeconds(audioDuration)}
                  </span>
                </div>
              )}

              {audioError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {audioError}
                </p>
              )}
            </div>

            {/* Zero Mistakes Celebration OR Mistake-by-Mistake Interactive Breakdown */}
            {analysis.mistakes.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 text-center">
                <p className="font-display text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
                  {t.aiPerfectTitle}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                  {t.aiPerfectDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mistake Selector Tabs */}
                {analysis.mistakes.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {analysis.mistakes.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundEngine.click();
                          setActiveMistakeIdx(idx);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          activeMistakeIdx === idx
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {activeMistake && (
                  <div className="space-y-4">
                    {/* Written Explanation Card (Yozib tushuntirish) */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          {activeMistake.question}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            handlePlayVoice(
                              `mistake_${activeMistakeIdx}`,
                              `${activeMistake.explanation}. ${activeMistake.ruleTip}`
                            )
                          }
                          disabled={audioLoadingId === `mistake_${activeMistakeIdx}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                        >
                          {audioLoadingId === `mistake_${activeMistakeIdx}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {speakingId === `mistake_${activeMistakeIdx}`
                              ? t.aiPauseVoice
                              : t.aiListenMistake}
                          </span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-red-800 dark:text-red-200">
                          <span className="block font-semibold opacity-80">
                            {t.aiYourAnswerLabel}:
                          </span>
                          <span className="font-bold">✕ {activeMistake.yourAnswer}</span>
                        </div>

                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-emerald-800 dark:text-emerald-200">
                          <span className="block font-semibold opacity-80">
                            {t.aiCorrectAnswerLabel}:
                          </span>
                          <span className="font-bold">✓ {activeMistake.correctAnswer}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {activeMistake.explanation}
                      </p>

                      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 px-3.5 py-2 text-xs text-amber-900 dark:text-amber-200">
                        <strong className="font-bold">{t.aiRuleTipLabel}:</strong>{' '}
                        {activeMistake.ruleTip}
                      </div>
                    </div>

                    {/* Visual Drawing Whiteboard (Chizib tushuntirish) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                        <PenTool className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{t.aiModeDraw}</span>
                      </div>
                      <AiVisualBoard
                        diagram={activeMistake.diagram}
                        replayLabel={t.aiReplayDraw}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Follow-up Chat Messages */}
        {chatMessages.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 space-y-2.5'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.role === 'assistant' && msg.spokenText && (
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(msg.id, msg.spokenText!)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>
                        {speakingId === msg.id ? t.aiPauseVoice : t.aiPlayVoice}
                      </span>
                    </button>
                  )}
                  {msg.diagram && (
                    <AiVisualBoard diagram={msg.diagram} replayLabel={t.aiReplayDraw} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Chat Input Bar (matching reference image_b7f3f804.png) */}
        <form
          onSubmit={handleChatSubmit}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1.5 pl-4 shadow-xs focus-within:border-blue-500 transition-colors"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t.aiAskPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            aria-label={t.aiSendBtn}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:brightness-110 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            {chatLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
