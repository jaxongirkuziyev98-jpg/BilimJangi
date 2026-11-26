import { PenTool, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { AiDiagramSpec } from '../shared/types';

interface AiVisualBoardProps {
  diagram: AiDiagramSpec;
  replayLabel: string;
}

export function AiVisualBoard({ diagram, replayLabel }: AiVisualBoardProps) {
  const [drawKey, setDrawKey] = useState(0);

  const nodes = Array.isArray(diagram.nodes) ? diagram.nodes.slice(0, 4) : [];
  const hasBars =
    diagram.type === 'comparison_bars' &&
    typeof diagram.wrongValue === 'number' &&
    typeof diagram.correctValue === 'number';

  const maxBar = hasBars
    ? Math.max(1, Math.abs(diagram.wrongValue || 0), Math.abs(diagram.correctValue || 0))
    : 100;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Whiteboard header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <PenTool className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {diagram.title}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDrawKey((k) => k + 1)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{replayLabel}</span>
        </button>
      </div>

      {/* Sketch Paper Grid Area */}
      <div
        key={drawKey}
        className="relative p-4 space-y-4"
        style={{
          backgroundImage:
            'radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Formula / Key Banner if present */}
        {diagram.formula && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-md rounded-xl border-2 border-dashed border-blue-400/70 dark:border-blue-500/50 bg-blue-50/90 dark:bg-blue-950/50 px-3.5 py-2 text-center font-mono text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-100"
          >
            {diagram.formula}
          </motion.div>
        )}

        {/* Comparison Visual Bars (for numeric / magnitude differences) */}
        {hasBars && (
          <div className="space-y-2.5 rounded-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-600 dark:text-red-400">
                  ✕ {diagram.wrongLabel || 'Sizniki'}
                </span>
                <span className="font-mono tabular-nums text-red-600 dark:text-red-400">
                  {diagram.wrongValue}
                </span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    originX: 0,
                    width: `${Math.max(10, Math.round((Math.abs(diagram.wrongValue || 0) / maxBar) * 100))}%`,
                  }}
                  className="h-full rounded-full bg-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {diagram.correctLabel || "To'g'risi"}
                </span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {diagram.correctValue}
                </span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
                  style={{
                    originX: 0,
                    width: `${Math.max(10, Math.round((Math.abs(diagram.correctValue || 0) / maxBar) * 100))}%`,
                  }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Visual Node Flow */}
        {nodes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
            {nodes.map((node, idx) => {
              const style =
                node.status === 'wrong'
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100'
                  : node.status === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                    : node.status === 'step'
                      ? 'border-sky-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.22 }}
                    className={`w-full rounded-xl border-2 px-3 py-2.5 text-center shadow-xs ${style}`}
                  >
                    <p className="font-display text-xs font-extrabold break-words">
                      {node.label}
                    </p>
                    {node.sublabel && (
                      <p className="mt-0.5 text-[11px] opacity-80 break-words">
                        {node.sublabel}
                      </p>
                    )}
                  </motion.div>

                  {idx < nodes.length - 1 && (
                    <motion.svg
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: idx * 0.22 + 0.14 }}
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-blue-500 rotate-90 sm:rotate-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h12m0 0l-4-4m4 4l-4 4"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </motion.svg>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Visual Drawn Conclusion Box */}
        {diagram.conclusion && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(0.9, nodes.length * 0.22) }}
            className="rounded-xl border border-emerald-400/60 dark:border-emerald-700/60 bg-emerald-50/90 dark:bg-emerald-950/40 px-3.5 py-2 text-center text-xs font-bold text-emerald-900 dark:text-emerald-200"
          >
            ✓ {diagram.conclusion}
          </motion.div>
        )}
      </div>
    </div>
  );
}
