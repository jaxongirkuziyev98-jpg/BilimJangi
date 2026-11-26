import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { CheckCircle2, HelpCircle, Minus, Plus, RotateCcw, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';
import { socketActions } from '../../hooks/useSocket';
import { TRANSLATIONS } from '../../i18n/translations';
import { getCountryNameById } from '../../shared/mapCountries';
import { PublicQuestion, PublicRoomState } from '../../shared/types';
import { soundEngine } from '../../sounds/soundEngine';
import { useGameStore } from '../../store/useGameStore';

interface MapHuntArenaProps {
  room: PublicRoomState;
  myId: string | null;
  question: PublicQuestion | null;
  questionRound: number;
  compact?: boolean;
}

const COUNTRY_PALETTE = [
  '#2563EB', // blue
  '#EF4444', // red/coral
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
];

interface CountryFeature {
  id: string;
  name: string;
  d: string;
  centroid: [number, number] | null;
  baseColor: string;
}

export function MapHuntArena({
  room,
  myId,
  question,
  questionRound,
  compact = false,
}: MapHuntArenaProps) {
  const { language, lastAnswerResult } = useGameStore();
  const t = TRANSLATIONS[language];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const draggingRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);

  const countries = useMemo<CountryFeature[]>(() => {
    const topo = worldAtlas as unknown as {
      type: 'Topology';
      objects: { countries: unknown };
    };
    const geo = feature(topo as never, topo.objects.countries as never) as unknown as {
      features: Array<{ id?: string | number; properties?: { name?: string }; geometry: unknown }>;
    };
    const projection = geoNaturalEarth1().scale(178).translate([480, 260]);
    const pathGen = geoPath(projection);

    return geo.features
      .filter((f) => String(f.id ?? '') !== '010') // Exclude Antarctica for cleaner viewport fit
      .map((f, idx) => {
        const idStr = String(f.id ?? idx).padStart(3, '0');
        const d = pathGen(f as never) || '';
        const c = pathGen.centroid(f as never);
        const validCentroid: [number, number] | null =
          Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1])
            ? [c[0], c[1]]
            : null;
        return {
          id: idStr,
          name: f.properties?.name || idStr,
          d,
          centroid: validCentroid,
          baseColor: COUNTRY_PALETTE[(Number(idStr) || idx) % COUNTRY_PALETTE.length],
        };
      })
      .filter((c) => Boolean(c.d));
  }, []);

  useEffect(() => {
    setShowHint(false);
  }, [question?.id]);

  const myPlayer = room.players.find((p) => p.id === myId);
  const totalAns = (myPlayer?.correctCount ?? 0) + (myPlayer?.wrongCount ?? 0);
  const accuracy =
    totalAns === 0 ? 0 : Math.round(((myPlayer?.correctCount ?? 0) / totalAns) * 100);

  const hasFeedback = Boolean(question && lastAnswerResult?.questionId === question.id);
  const displayPrompt =
    (question && (question.localized?.[language]?.text ?? question.text)) ||
    t.waitingNextRound;

  const targetCountryCentroid = useMemo(() => {
    if (!hasFeedback || !lastAnswerResult?.correctCountryId) return null;
    const found = countries.find((c) => c.id === lastAnswerResult.correctCountryId);
    return found?.centroid ?? null;
  }, [countries, hasFeedback, lastAnswerResult?.correctCountryId]);

  const handleCountryClick = (countryId: string) => {
    if (!question || hasFeedback) return;
    if (draggingRef.current?.moved) return;
    soundEngine.click();
    socketActions.submitAnswer({
      questionId: question.id,
      countryId,
      language,
    });
  };

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      draggingRef.current.moved = true;
    }
    if (draggingRef.current.moved) {
      const limit = (zoom - 1) * 260;
      setPan({
        x: Math.max(-limit, Math.min(limit, draggingRef.current.origX + dx / zoom)),
        y: Math.max(-limit * 0.6, Math.min(limit * 0.6, draggingRef.current.origY + dy / zoom)),
      });
    }
  };

  const handlePointerUp = () => {
    setTimeout(() => {
      draggingRef.current = null;
    }, 20);
  };

  const progressRatio = Math.min(100, Math.round((questionRound / 30) * 100));

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* Compact Team vs Score Strip when full arena */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-1.5">
            <span className="font-display text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 truncate">
              {t.teamALabel}
            </span>
            <span className="font-display text-base sm:text-xl font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
              {room.teamAScore}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/30 px-3 py-1.5">
            <span className="font-display text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-300 truncate">
              {t.teamBLabel}
            </span>
            <span className="font-display text-base sm:text-xl font-extrabold tabular-nums text-orange-600 dark:text-orange-400">
              {room.teamBScore}
            </span>
          </div>
        </div>
      )}

      {/* Interactive World Map Canvas (inspired by image_39b14304.png) */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-sky-200 dark:border-slate-700 bg-gradient-to-b from-sky-100 via-sky-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 shadow-sm select-none ${
          compact ? 'h-[210px] sm:h-[260px]' : 'flex-1 min-h-[260px] sm:min-h-[340px]'
        }`}
      >
        {/* Top Floating Question Banner (matching image_39b14304.png) */}
        <div className="pointer-events-none absolute inset-x-0 top-2 sm:top-3 z-10 flex items-start justify-between px-2.5 sm:px-4 gap-2">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            title={t.mapClickCountryHint}
            className="pointer-events-auto flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs hover:scale-105 transition-transform cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="pointer-events-auto mx-auto max-w-md flex-1 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 sm:px-5 py-1.5 sm:py-2.5 text-center shadow-md backdrop-blur-sm">
            <p className="font-display text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {displayPrompt}
            </p>
            <div className="mt-1.5 h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.max(6, progressRatio)}%` }}
              />
            </div>

            {hasFeedback && lastAnswerResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-1 inline-flex items-center gap-1.5 text-xs font-extrabold ${
                  lastAnswerResult.correct
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {lastAnswerResult.correct ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t.correctFeedback}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>
                      {t.wrongFeedback} ·{' '}
                      {getCountryNameById(lastAnswerResult.correctCountryId, language)}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <div className="w-8 sm:w-9 shrink-0" />
        </div>

        {/* Optional Hint Popover */}
        {showHint && (
          <div className="absolute left-3 top-14 z-20 rounded-xl bg-slate-900/90 text-white px-3 py-1.5 text-xs font-semibold shadow-lg">
            {t.mapClickCountryHint}
          </div>
        )}

        {/* World Political Map SVG */}
        <svg
          viewBox="0 0 960 470"
          className={`w-full h-full ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setHoveredName(null);
            handlePointerUp();
          }}
        >
          <g
            transform={`translate(${480}, ${235}) scale(${zoom}) translate(${-480 + pan.x}, ${-235 + pan.y})`}
          >
            {countries.map((c) => {
              const isTrueTarget =
                hasFeedback && lastAnswerResult?.correctCountryId === c.id;
              const isChosenWrong =
                hasFeedback &&
                !lastAnswerResult?.correct &&
                lastAnswerResult?.chosenCountryId === c.id;

              let fill = c.baseColor;
              let stroke = '#FFFFFF';
              let strokeWidth = 0.6 / zoom;

              if (isTrueTarget) {
                fill = '#16A34A';
                stroke = '#FEF08A';
                strokeWidth = 2.2 / zoom;
              } else if (isChosenWrong) {
                fill = '#DC2626';
                stroke = '#FFFFFF';
                strokeWidth = 2 / zoom;
              }

              return (
                <path
                  key={c.id}
                  d={c.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className="transition-opacity duration-150 hover:opacity-80"
                  onMouseEnter={() => {
                    const localName = getCountryNameById(c.id, language);
                    setHoveredName(localName !== c.id ? localName : c.name);
                  }}
                  onClick={() => handleCountryClick(c.id)}
                />
              );
            })}

            {/* Pin Target Glow Marker when answered */}
            {targetCountryCentroid && (
              <g transform={`translate(${targetCountryCentroid[0]}, ${targetCountryCentroid[1]})`}>
                <circle
                  r={14 / zoom}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth={2.5 / zoom}
                  className="animate-ping"
                />
                <circle
                  r={5.5 / zoom}
                  fill="#16A34A"
                  stroke="#FFFFFF"
                  strokeWidth={2 / zoom}
                />
              </g>
            )}
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredName && !hasFeedback && (
          <div className="pointer-events-none absolute top-2 right-2 sm:top-3 sm:right-3 z-10 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
            {hoveredName}
          </div>
        )}

        {/* Bottom-left Accuracy HUD (matching image_39b14304.png) */}
        <div className="pointer-events-none absolute left-2.5 bottom-2.5 sm:left-4 sm:bottom-3.5 z-10 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 shadow-sm backdrop-blur-xs">
          <div className="font-display text-xs sm:text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
            {t.mapCorrectStat}: {myPlayer?.correctCount ?? 0} ({accuracy}%)
          </div>
          <div className="mt-1 h-1.5 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(4, accuracy)}%` }}
            />
          </div>
          <div className="mt-0.5 font-mono text-[10px] sm:text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
            {questionRound}/30 ({progressRatio}%)
          </div>
        </div>

        {/* Bottom-right Zoom Controls (+ / - / Reset) */}
        <div className="absolute right-2.5 bottom-2.5 sm:right-4 sm:bottom-3.5 z-10 flex items-center gap-1 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-1 shadow-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(4, Number((z + 0.6).toFixed(2))))}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom((z) => {
                const next = Math.max(1, Number((z - 0.6).toFixed(2)));
                if (next === 1) setPan({ x: 0, y: 0 });
                return next;
              });
            }}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
          {zoom > 1 && (
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title={t.mapZoomReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
