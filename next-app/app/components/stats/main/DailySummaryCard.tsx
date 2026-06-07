import React from 'react';
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

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Side: Avatar & Metrics */}
        <div className="flex flex-col gap-6 xl:w-1/2">
          {/* Avatar Area */}
          <div className="flex justify-center items-center h-40 bg-muted/30 rounded-xl border border-border/50">
            {avatarState === 'fire' && (
              <div className="flex flex-col items-center gap-2 text-orange-500">
                <Flame className="w-16 h-16 animate-pulse" />
                <span className="font-semibold text-sm">On Fire!</span>
              </div>
            )}
            {avatarState === 'struggling' && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <BatteryWarning className="w-16 h-16" />
                <span className="font-semibold text-sm">Recovering</span>
              </div>
            )}
            {avatarState === 'standard' && (
              <div className="flex flex-col items-center gap-2 text-primary">
                <BookOpen className="w-16 h-16" />
                <span className="font-semibold text-sm">Consistent</span>
              </div>
            )}
          </div>

          {/* 2x2 Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-primary font-medium">Total study time</span>
              <span className="text-2xl font-bold">{formatSecs(totalStudySecs)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-primary font-medium">Max focus time</span>
              <span className="text-2xl font-bold">{formatSecs(maxFocusSecs)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-primary font-medium">Start time</span>
              <span className="text-xl font-bold">{formatTime(startTime)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-primary font-medium">End time</span>
              <span className="text-xl font-bold">{formatTime(endTime)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Timetable Grid */}
        <div className="flex flex-col xl:w-1/2 overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header row (Hours) */}
            <div className="flex mb-1">
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="flex-1 text-[10px] text-muted-foreground text-center">
                  {h % 2 === 0 ? h : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-[2px]">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-[2px]">
                  {Array.from({ length: 24 }).map((_, colIdx) => {
                    const isWorked = grid[colIdx][rowIdx];
                    return (
                      <div
                        key={`${colIdx}-${rowIdx}`}
                        className={`flex-1 aspect-square rounded-[2px] ${
                          isWorked ? 'bg-primary' : 'bg-muted/50'
                        }`}
                        title={`${colIdx.toString().padStart(2, '0')}:${(rowIdx * 10).toString().padStart(2, '0')}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Each block represents 10 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
