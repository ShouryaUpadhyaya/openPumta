import React, { useRef, useEffect } from 'react';
import { Flame, BatteryWarning, BookOpen } from 'lucide-react';
import { TimelineItem } from '@/hooks/useStats';

interface DailySummaryCardProps {
  selectedDate: Date;
  timeline: TimelineItem[];
  dailyHours: number;
  avgDailyHours: number;
  currentStreak: number;
}

export default function DailySummaryCard({
  selectedDate,
  timeline,
  dailyHours,
  avgDailyHours,
  currentStreak,
}: DailySummaryCardProps) {
  const dateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Row height is h-10 (40px) + gap-1 (4px) = 44px
      const currentHour = new Date().getHours();
      const rowHeight = 44;
      const scrollPos =
        currentHour * rowHeight - scrollRef.current.clientHeight / 2 + rowHeight / 2;
      scrollRef.current.scrollTo({ top: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  }, [selectedDate]);

  // Calculate dynamic avatar state
  let avatarState = 'standard';
  if (dailyHours > 6 || currentStreak >= 7) {
    avatarState = 'fire';
  } else if (dailyHours < avgDailyHours && avgDailyHours > 0) {
    avatarState = 'struggling';
  }

  // Calculate Primary Metrics
  const subjectSessions = timeline.filter((t) => t.type === 'subject' && t.endedAt);

  const totalStudySecs = subjectSessions.reduce((sum, t) => sum + t.duration, 0);
  const maxFocusSecs = subjectSessions.length
    ? Math.max(...subjectSessions.map((t) => t.duration))
    : 0;

  const startTime = subjectSessions.length
    ? new Date(Math.min(...subjectSessions.map((t) => new Date(t.startedAt).getTime())))
    : null;
  const endTime = subjectSessions.length
    ? new Date(Math.max(...subjectSessions.map((t) => new Date(t.endedAt!).getTime())))
    : null;

  const formatSecs = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (d: Date | null) => {
    if (!d) return '--:--';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Generate 24x6 Timetable Grid
  const grid = (() => {
    const blocks: boolean[][] = Array.from({ length: 24 }, () => Array(6).fill(false));

    // We only care about the date part for matching
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    subjectSessions.forEach((session) => {
      const sStart = new Date(session.startedAt).getTime();
      const sEnd = new Date(session.endedAt!).getTime();

      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 6; m++) {
          const blockStart = new Date(startOfDay).getTime() + h * 3600000 + m * 600000;
          const blockEnd = blockStart + 600000;

          if (sStart < blockEnd && sEnd > blockStart) {
            blocks[h][m] = true;
          }
        }
      }
    });

    return blocks;
  })();

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full">
      <h3 className="text-lg font-bold text-foreground mb-4">{dateStr}</h3>

      <div className="flex flex-row gap-4 h-full">
        {/* Left Side: Avatar & Metrics */}
        <div className="flex flex-col gap-4 w-1/2 justify-center">
          {/* Avatar Area */}
          <div className="flex justify-center items-center h-32 lg:h-56 bg-muted/20 rounded-2xl border border-border/50 shrink-0">
            {avatarState === 'fire' && (
              <div className="flex flex-col items-center gap-1 lg:gap-3 text-orange-500 animate-in zoom-in duration-500">
                <Flame className="w-10 h-10 lg:w-20 lg:h-20 animate-pulse drop-shadow-md" />
                <span className="font-bold text-[10px] lg:text-base tracking-wide">On Fire!</span>
              </div>
            )}
            {avatarState === 'struggling' && (
              <div className="flex flex-col items-center gap-1 lg:gap-3 text-muted-foreground animate-in zoom-in duration-500">
                <BatteryWarning className="w-10 h-10 lg:w-20 lg:h-20 opacity-80" />
                <span className="font-bold text-[10px] lg:text-base tracking-wide">Recovering</span>
              </div>
            )}
            {avatarState === 'standard' && (
              <div className="flex flex-col items-center gap-1 lg:gap-3 text-primary animate-in zoom-in duration-500">
                <BookOpen className="w-10 h-10 lg:w-20 lg:h-20 drop-shadow-sm" />
                <span className="font-bold text-[10px] lg:text-base tracking-wide">Consistent</span>
              </div>
            )}
          </div>

          {/* 2x2 Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 shrink-0">
            <div className="flex flex-col bg-muted/10 p-2 lg:p-4 rounded-xl border border-border/30">
              <span className="text-[10px] lg:text-xs text-primary font-bold uppercase tracking-wider mb-1">
                Total study
              </span>
              <span className="text-sm lg:text-2xl font-black text-foreground">
                {formatSecs(totalStudySecs)}
              </span>
            </div>
            <div className="flex flex-col bg-muted/10 p-2 lg:p-4 rounded-xl border border-border/30">
              <span className="text-[10px] lg:text-xs text-primary font-bold uppercase tracking-wider mb-1">
                Max focus
              </span>
              <span className="text-sm lg:text-2xl font-black text-foreground">
                {formatSecs(maxFocusSecs)}
              </span>
            </div>
            <div className="flex flex-col bg-muted/10 p-2 lg:p-4 rounded-xl border border-border/30 hidden md:flex">
              <span className="text-[10px] lg:text-xs text-primary font-bold uppercase tracking-wider mb-1">
                Start time
              </span>
              <span className="text-sm lg:text-xl font-bold text-foreground">
                {formatTime(startTime)}
              </span>
            </div>
            <div className="flex flex-col bg-muted/10 p-2 lg:p-4 rounded-xl border border-border/30 hidden md:flex">
              <span className="text-[10px] lg:text-xs text-primary font-bold uppercase tracking-wider mb-1">
                End time
              </span>
              <span className="text-sm lg:text-xl font-bold text-foreground">
                {formatTime(endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Timetable Grid */}
        <div
          ref={scrollRef}
          className="flex flex-col w-1/2 overflow-y-auto max-h-[350px] lg:max-h-[450px] custom-scrollbar pr-1 lg:pr-3"
        >
          <div className="flex gap-2 w-full justify-center lg:justify-start">
            {/* Header column (Hours) */}
            <div className="flex flex-col gap-1 w-12 shrink-0">
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="h-10 text-[10px] font-semibold text-muted-foreground/80 text-right pr-2 flex items-center justify-end shrink-0"
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-1 flex-1 max-w-[280px]">
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="flex gap-1 h-10 shrink-0">
                  {Array.from({ length: 6 }).map((_, m) => {
                    const isWorked = grid[h][m];
                    return (
                      <div
                        key={`${h}-${m}`}
                        className={`flex-1 rounded-[4px] transition-all duration-300 ${
                          isWorked
                            ? 'bg-primary shadow-sm scale-[1.02]'
                            : 'bg-muted/40 hover:bg-muted/60'
                        }`}
                        title={`${h.toString().padStart(2, '0')}:${(m * 10).toString().padStart(2, '0')}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-6 shrink-0">
            Each block represents 10 minutes
          </div>
        </div>
      </div>
    </div>
  );
}
