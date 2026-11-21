const FLOATING_ITEMS = [
  { label: 'π', top: '12%', left: '8%', delay: '0s', size: 'text-3xl' },
  { label: '⚛', top: '18%', left: '86%', delay: '1.2s', size: 'text-3xl' },
  { label: '∑', top: '64%', left: '6%', delay: '2.1s', size: 'text-4xl' },
  { label: '✦', top: '76%', left: '90%', delay: '0.8s', size: 'text-2xl' },
  { label: '🧬', top: '42%', left: '92%', delay: '2.6s', size: 'text-2xl' },
  { label: '÷', top: '82%', left: '16%', delay: '1.7s', size: 'text-3xl' },
];

export function FloatingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
    >
      {/* Subtle Dual-Corner Duel Wash (Blue vs Flame) */}
      <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[440px] w-[440px] rounded-full bg-orange-500/10 dark:bg-orange-600/15 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[340px] w-[340px] rounded-full bg-violet-500/6 dark:bg-violet-600/10 blur-3xl" />

      {/* Subtle Academic Floating Symbols */}
      {FLOATING_ITEMS.map((item, idx) => (
        <span
          key={idx}
          style={{ top: item.top, left: item.left, animationDelay: item.delay }}
          className={`hidden sm:block absolute select-none font-display font-bold text-slate-900/[0.045] dark:text-white/[0.05] animate-float-slow ${item.size}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}
