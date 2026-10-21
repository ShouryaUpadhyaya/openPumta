'use client';
import { useEffect, useState } from 'react';
import { IoIosPause, IoIosPlay, IoIosRefresh } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { cn, pad } from '@/lib/utils';
import { getElapsedMs, useStopwatchStore } from '@/store/useStopwatchStore';

interface StopwatchProps {
  /** `compact` is for the tight mobile-landscape column. */
  variant?: 'default' | 'compact';
  className?: string;
}

export default function Stopwatch({ variant = 'default', className }: StopwatchProps) {
  const startedAt = useStopwatchStore((s) => s.startedAt);
  const accumulatedMs = useStopwatchStore((s) => s.accumulatedMs);
  const { start, pause, reset } = useStopwatchStore.getState();

  // null until mounted: avoids SSR/persisted-state hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  const mounted = now !== null;
  const running = mounted && startedAt !== null;

  useEffect(() => {
    setNow(Date.now());
    if (startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const totalSecs = mounted
    ? Math.floor(getElapsedMs({ startedAt, accumulatedMs }, now) / 1000)
    : 0;
  const time = `${pad(Math.floor(totalSecs / 3600))}:${pad(Math.floor((totalSecs % 3600) / 60))}:${pad(totalSecs % 60)}`;

  const compact = variant === 'compact';
  const btn = compact ? 'w-7 h-7' : 'w-9 h-9';
  const icon = compact ? 12 : 16;

  return (
    <div
      className={cn(
        'flex items-center select-none shrink-0',
        compact ? 'flex-col gap-1' : 'flex-row gap-3 rounded-full border bg-card pl-4 pr-2 py-1.5',
        className,
      )}
    >
      {!compact && (
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground/60">
          STOPWATCH
        </span>
      )}
      <div
        className={cn(
          'font-bold tabular-nums tracking-tight leading-none',
          compact ? 'text-xs' : 'text-lg',
        )}
        style={{ fontFamily: 'var(--font-timer)' }}
        aria-label="Stopwatch time"
      >
        {time}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          onClick={running ? pause : start}
          variant="secondary"
          className={cn('rounded-full', btn)}
          aria-label={running ? 'Pause stopwatch' : 'Start stopwatch'}
        >
          {running ? <IoIosPause size={icon} /> : <IoIosPlay size={icon} />}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className={cn('rounded-full', btn)}
          aria-label="Reset stopwatch"
        >
          <IoIosRefresh size={icon} />
        </Button>
      </div>
    </div>
  );
}
