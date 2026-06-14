import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalIsoDate } from '@/lib/utils';

interface MonthlyCalendarNavProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  focusLogs: { date: string; focusTimeSecs: number }[];
}

export default function MonthlyCalendarNav({
  selectedDate,
  onSelectDate,
  focusLogs,
}: MonthlyCalendarNavProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const monthName = viewDate.toLocaleString('default', { month: 'short' });
  const year = viewDate.getFullYear();

  // Create lookup for focus hours by date string YYYY-MM-DD
  const focusMap = useMemo(() => {
    const map = new Map<string, number>();
    focusLogs.forEach((log) => {
      map.set(log.date, log.focusTimeSecs / 3600); // convert to hours
    });
    return map;
  }, [focusLogs]);

  // Generate calendar days
  const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, viewDate.getMonth(), 1).getDay(); // 0 is Sunday

  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days: (Date | null)[] = [];
  // padding empty days at the start
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  // actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, viewDate.getMonth(), i));
  }

  const getHeatmapColor = (hours: number) => {
    if (hours >= 12) return 'var(--color-heatmap-4)';
    if (hours >= 10) return 'var(--color-heatmap-3)';
    if (hours >= 7) return 'var(--color-heatmap-2)';
    if (hours >= 4) return 'var(--color-heatmap-1)';
    if (hours > 0) return 'var(--color-heatmap-0)';
    return 'transparent';
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, viewDate.getMonth() + 1, 1));
  };

  const monthTotalHours = useMemo(() => {
    let total = 0;
    days.forEach((day) => {
      if (!day) return;
      const dStr = getLocalIsoDate(day);
      total += focusMap.get(dStr) || 0;
    });
    return total;
  }, [days, focusMap]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="font-bold text-lg w-20 text-center">
            {monthName} {year !== new Date().getFullYear() && year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-xs text-center text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-14" />;

          const dStr = getLocalIsoDate(day);
          const hours = focusMap.get(dStr) || 0;
          const isSelected = dStr === getLocalIsoDate(selectedDate);
          const isToday = dStr === getLocalIsoDate(new Date());

          const hrs = Math.floor(hours);
          const mins = Math.round((hours - hrs) * 60);

          return (
            <button
              key={dStr}
              onClick={() => onSelectDate(day)}
              className={`relative h-14 rounded-md flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-10'
                  : 'hover:ring-2 hover:ring-border hover:z-10'
              } ${isToday && !isSelected ? 'border border-primary' : ''}`}
              style={{ backgroundColor: getHeatmapColor(hours) }}
            >
              <span
                className={`text-sm font-semibold ${hours >= 10 ? 'text-white' : 'text-foreground'}`}
              >
                {day.getDate()}
              </span>
              {hours > 0 && (
                <span
                  className={`text-[10px] ${hours >= 10 ? 'text-white/80' : 'text-muted-foreground'}`}
                >
                  {hrs}:{mins.toString().padStart(2, '0')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Total */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>0+</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-heatmap-0)' }}
          />
          <span>4+</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-heatmap-1)' }}
          />
          <span>7+</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-heatmap-2)' }}
          />
          <span>10+</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-heatmap-3)' }}
          />
          <span>12+</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-heatmap-4)' }}
          />
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {monthName}: {Math.floor(monthTotalHours)}H {Math.round((monthTotalHours % 1) * 60)}M
        </div>
      </div>
    </div>
  );
}
