import { useId, useRef } from 'react';
import type { GameStats } from '@/lib/stats';
import { cn } from '@/lib/utils';
import { useDialogA11y } from '@/lib/focus-trap';

interface StatsDialogProps {
  stats: GameStats;
  mode: 'daily' | 'practice';
  gameOver: boolean;
  onReset: () => void;
  onClose: () => void;
}

export default function StatsDialog({ stats, mode, gameOver, onReset, onClose }: StatsDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogA11y(ref, onClose, gameOver);

  if (!gameOver) return null;

  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-2xl outline-none"
      >
        <h2 id={titleId} className="mb-5 text-center text-lg font-display">{mode === 'practice' ? 'Practice Stats' : 'Statistics'}</h2>

        <div className="mb-5 grid grid-cols-4 gap-3 text-center">
          <StatBox value={stats.wins} label="Solved" />
          <StatBox value={stats.maxStreak} label="Best streak" />
          <StatBox value={stats.played} label="Played" />
          <StatBox value={winRate} label="Win rate" suffix="%" />
        </div>

        <h3 className="mb-3 text-xs tracking-widest uppercase text-surface-400 font-display">Guess distribution</h3>
        <div className="mb-5 space-y-1.5">
          {stats.distribution.map((count, i) => {
            const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
            const isBest = maxDist > 0 && count === maxDist;
            return (
              <div key={i} className="flex items-center gap-2 text-sm" aria-label={`${i + 1} guess${count === 1 ? '' : 'es'}: ${count}`}>
                <span className="w-4 text-right text-surface-400 font-medium" aria-hidden="true">{i + 1}</span>
                <div className="flex-1 overflow-hidden rounded-lg">
                  <div
                    className={cn(
                      'flex h-7 items-center justify-end px-2.5 text-xs font-bold rounded-lg transition-all duration-500',
                      count > 0
                        ? isBest
                          ? 'bg-gradient-to-r from-[#f7d3d3] to-[#ecc0c0] dark:from-[#c4a2a2] dark:to-[#b08e8e] text-surface-800 dark:text-white'
                          : 'bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
                        : 'bg-surface-100/50 dark:bg-surface-800/30 text-surface-300 dark:text-surface-600',
                    )}
                    style={{ width: `${count > 0 ? Math.max(12, pct) : 4}%` }}
                  >
                    {count > 0 && <span className="drop-shadow-sm">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-surface-200 dark:border-surface-800 py-2.5 text-sm font-display hover:bg-surface-100 dark:hover:bg-surface-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 focus-visible:ring-surface-500"
          >
            Close
          </button>
          <button
            onClick={onReset}
            className="rounded-xl border border-red-200 dark:border-red-900 py-2.5 px-4 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 focus-visible:ring-red-500"
            aria-label="Reset statistics (permanent)"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  return (
    <div className="rounded-xl bg-surface-50 dark:bg-surface-800 p-3">
      <div className="text-2xl font-display">{value}{suffix}</div>
      <div className="text-xs text-surface-400">{label}</div>
    </div>
  );
}
