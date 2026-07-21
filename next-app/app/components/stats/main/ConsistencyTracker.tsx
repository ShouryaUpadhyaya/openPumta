import React, { useState, useMemo } from 'react';
import type { Habit } from '@/types/habit';
import { getLocalIsoDate } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ConsistencyTrackerProps {
  habits: Habit[];
  selectedDate: Date;
}

export default function ConsistencyTracker({ habits, selectedDate }: ConsistencyTrackerProps) {
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);

  const daysArray = useMemo(() => {
    const arr: string[] = [];
    const end = new Date(selectedDate);
    end.setHours(0, 0, 0, 0);

    let start = new Date(end);
    if (startDateStr) {
      start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      if (start > end) {
        start = new Date(end);
        start.setDate(start.getDate() - 20); // Fallback if start is after end
      }
    } else {
      start.setDate(start.getDate() - 20); // Default to 21 days
    }

    const d = new Date(start);
    while (d <= end) {
      arr.push(getLocalIsoDate(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [selectedDate, startDateStr]);

  const totalDays = daysArray.length;

  let totalPossible = 0;
  let totalDone = 0;

  const habitsWithCompletion = useMemo(() => {
    return habits.map((habit) => {
      const completionDates = new Map<string, boolean>();
      habit.log?.forEach((l) => {
        if (l.deleted) return;
        const dateStr = getLocalIsoDate(new Date(l.startedAt));
        completionDates.set(dateStr, l.isBadDayPlan || false);
      });

      let doneCount = 0;
      daysArray.forEach((d) => {
        if (completionDates.has(d)) doneCount++;
      });

      const percent = totalDays > 0 ? Math.round((doneCount / totalDays) * 100) : 0;

      return { ...habit, completionDates, percent, doneCount };
    });
  }, [habits, daysArray, totalDays]);

  habitsWithCompletion.forEach((h) => {
    totalPossible += totalDays;
    totalDone += h.doneCount;
  });

  const overallPercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const activeHabits = habitsWithCompletion.filter((h) => !h.deleted);
  const archivedHabits = habitsWithCompletion.filter((h) => h.deleted);

  const renderHabitList = (habitList: typeof habitsWithCompletion) => {
    if (habitList.length === 0) {
      return (
        <div className="text-sm text-muted-foreground py-2 text-center">
          No habits in this category.
        </div>
      );
    }
    return habitList.map((habit) => {
      return (
        <div key={habit.id} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground truncate" title={habit.name}>
              {habit.name}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{habit.percent}%</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 items-center justify-between custom-scrollbar">
            {daysArray.map((dateStr) => {
              const dateObj = new Date(dateStr);
              const dayNum = dateObj.getDate();
              const done = habit.completionDates.has(dateStr);
              const isBadDayPlan = done ? habit.completionDates.get(dateStr) : false;
              const isToday = dateStr === getLocalIsoDate(new Date());

              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center gap-1 group relative shrink-0"
                >
                  <div
                    className={`w-8 h-8 rounded-md transition-colors ${
                      done
                        ? isBadDayPlan
                          ? 'bg-primary/50'
                          : 'bg-primary'
                        : 'bg-muted/50 border border-border/50'
                    } ${isToday && !done ? 'border-2 border-primary/40' : ''}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{dayNum}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md border border-border">
                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}:{' '}
                    {done ? (isBadDayPlan ? 'Minimum Met' : 'Goal Met') : 'Missed'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full ">
      <div className="flex flex-col gap-3 mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Habit Tracking</h3>
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {overallPercent}% Overall
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Start Date:</span>
          <input
            type="date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="text-xs px-2 py-1.5 bg-muted/30 border border-muted-foreground/20 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
        {habitsWithCompletion.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No habits tracked in this period.
          </div>
        ) : (
          <>
            {activeHabits.length > 0 && (
              <div className="flex flex-col gap-3">
                {archivedHabits.length > 0 && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                    Active
                  </h4>
                )}
                {renderHabitList(activeHabits)}
              </div>
            )}

            {archivedHabits.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 hover:text-foreground transition-colors group text-left"
                >
                  {showArchived ? (
                    <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  )}
                  Archived ({archivedHabits.length})
                </button>
                {showArchived && (
                  <div className="opacity-70 grayscale-[20%]">
                    {renderHabitList(archivedHabits)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
