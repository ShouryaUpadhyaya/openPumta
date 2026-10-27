'use client';

import { Hourglass, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimerMode, useTimerStore } from '@/store/useTimerStore';

const MODES: { value: TimerMode; label: string; icon: typeof Timer; hint: string }[] = [
  { value: 'pomodoro', label: 'Pomodoro', icon: Hourglass, hint: 'Count down work and breaks' },
  { value: 'stopwatch', label: 'Stopwatch', icon: Timer, hint: 'Count up with no breaks' },
];

/** Pomodoro / Stopwatch switch shown on the timer itself */
export function TimerModeToggle({ compact = false }: { compact?: boolean }) {
  const mode = useTimerStore((s) => s.mode);
  const setMode = useTimerStore((s) => s.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="Timer mode"
      className={cn(
        'inline-flex items-center rounded-full border border-border/50 bg-muted/30 p-1',
        compact && 'flex-col rounded-2xl',
      )}
    >
      {MODES.map(({ value, label, icon: Icon, hint }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={hint}
            onClick={() => setMode(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors',
              compact ? 'p-2' : 'px-3 py-1.5',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
