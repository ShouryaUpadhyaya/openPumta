'use client';

import React, { useState, useMemo } from 'react';
import {
  useHabitDashboard,
  useHabitsWithLogs,
  useToggleHabitCompletion,
  useDeleteHabit,
  HabitDifficulty,
} from '@/hooks/useHabits';
import { useHabitRewards } from '@/hooks/useHabitRewards';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Activity,
  Flame,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SystemGuideModal } from '@/app/components/Habits/SystemGuideModal';
import { HabitHeatmapCard } from '@/app/components/Habits/HabitHeatmapCard';
import { HabitCardSkeleton } from '@/app/components/Habits/HabitCardSkeleton';
import { AddHabitDialog } from '@/app/components/Habits/AddHabitDialog';
import { EditHabitDialog } from '@/app/components/Habits/EditHabitDialog';
import { getLocalIsoDate } from '@/lib/utils';

interface Habit {
  id: number;
  name: string;
  difficulty?: HabitDifficulty;
  subjectId?: number;
  autoCompleteTime?: number | null;
  badDayPlan?: string | null;
}

interface HabitLog {
  id: number;
  habitId: number;
  startedAt: string;
  isBadDayPlan?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DetailedHabit extends Habit {
  log?: HabitLog[];
}

type FilterRange = 7 | 14 | 21 | 30 | 'all';

const FILTER_OPTIONS: { label: string; value: FilterRange }[] = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '21 Days', value: 21 },
  { label: '30 Days', value: 30 },
  { label: 'All Time', value: 'all' },
];

export default function HabitsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = getLocalIsoDate(selectedDate);
  const isToday = selectedDateStr === getLocalIsoDate(new Date());

  const { data: dashboardData, isLoading: dashboardLoading } = useHabitDashboard(selectedDateStr);

  const [filterRange, setFilterRange] = useState<FilterRange>(21);
  const [filterOpen, setFilterOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const fromDateString = useMemo(() => {
    if (filterRange === 'all') return new Date(2020, 0, 1).toISOString();
    const d = new Date();
    d.setDate(d.getDate() - (filterRange - 1));
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [filterRange]);

  const { data: habitsWithLogs } = useHabitsWithLogs(fromDateString);
  const { data: subjects } = useSubjects();

  const toggleHabit = useToggleHabitCompletion();
  const deleteHabit = useDeleteHabit();

  const habits = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];
  const completedHabitIds = new Set(todayStats.map((log: HabitLog) => log.habitId));

  useHabitRewards(completedHabitIds.size);

  const daysArray = useMemo(() => {
    if (filterRange === 'all') {
      const allDates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      habitsWithLogs?.forEach((h: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h.log?.forEach((l: any) => {
          allDates.push(getLocalIsoDate(new Date(l.startedAt)));
        });
      });
      if (allDates.length === 0) {
        const arr = [];
        for (let i = 20; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          arr.push(getLocalIsoDate(d));
        }
        return arr;
      }
      const earliest = allDates.sort()[0];
      const arr = [];
      let cur = new Date(earliest);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      while (cur <= today) {
        arr.push(getLocalIsoDate(cur));
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
      }
      return arr;
    }
    const arr = [];
    for (let i = filterRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(getLocalIsoDate(d));
    }
    return arr;
  }, [filterRange, habitsWithLogs]);

  const gridCols =
    daysArray.length <= 21 ? 'grid-cols-7' : daysArray.length <= 30 ? 'grid-cols-6' : 'grid-cols-7';

  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.value === filterRange)?.label ?? '21 Days';

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <Activity className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Behavior Tracking</h1>
            <div className="flex items-center ml-4 bg-muted/30 rounded-full border border-muted-foreground/20 px-1 py-0.5">
              <button
                onClick={() =>
                  setSelectedDate((d) => {
                    const nd = new Date(d);
                    nd.setDate(nd.getDate() - 1);
                    return nd;
                  })
                }
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs font-semibold px-2 w-24 text-center">
                {isToday ? 'Today' : selectedDateStr}
              </span>
              <button
                onClick={() =>
                  setSelectedDate((d) => {
                    const nd = new Date(d);
                    nd.setDate(nd.getDate() + 1);
                    return nd;
                  })
                }
                disabled={isToday}
                className="p-1.5 hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor your habit cycles and maintain your perfect days.
          </p>
        </div>

        <Button
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-primary/10 gap-2 font-semibold"
          onClick={() => setGuideOpen(true)}
        >
          <BookOpen className="h-4 w-4" />
          Learn the System
        </Button>

        {completedHabitIds.size >= 4 && (
          <div className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-in fade-in zoom-in">
            <Flame className="h-4 w-4" />
            <span>Perfect Day!</span>
          </div>
        )}
      </div>

      <SystemGuideModal open={guideOpen} onOpenChange={setGuideOpen} />

      <div className="flex items-center gap-2 mb-3">
        <AddHabitDialog habitsCount={habits.length} subjects={subjects} />

        <div className="flex-1" />

        <button
          onClick={() => setFilterOpen((p) => !p)}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border transition-all ${
            filterOpen
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted/30 border-muted-foreground/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>
            Heatmap
            {!filterOpen && (
              <span className="ml-1.5 text-xs opacity-70">· {activeFilterLabel}</span>
            )}
          </span>
          {filterOpen ? (
            <ChevronUp className="h-3.5 w-3.5 opacity-60" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          filterOpen ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="flex items-center gap-2 pt-2 pb-1 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterRange(opt.value)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium border transition-all ${
                filterRange === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/30 text-muted-foreground border-muted-foreground/20 hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardLoading ? (
          <>
            <HabitCardSkeleton />
            <HabitCardSkeleton />
            <HabitCardSkeleton />
          </>
        ) : habits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            <Calendar className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Your habit tracker is empty.</p>
            <p className="text-sm mt-1">Click &quot;Add Habit&quot; above to begin your journey.</p>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          habits.map((habit: any) => {
            const isCompletedToday = completedHabitIds.has(habit.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detailedHabit = habitsWithLogs?.find((h: any) => h.id === habit.id);
            const completionDates = new Map<string, boolean>();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            detailedHabit?.log?.forEach((l: any) => {
              const dateStr = getLocalIsoDate(new Date(l.startedAt));
              completionDates.set(dateStr, l.isBadDayPlan || false);
            });

            if (isCompletedToday) {
              const todayLog = todayStats.find((l: HabitLog) => l.habitId === habit.id);
              completionDates.set(getLocalIsoDate(new Date()), todayLog?.isBadDayPlan || false);
            }

            const linkedSubject = subjects?.find((s) => s.id === habit.subjectId);

            const isCompletedMinimum = isCompletedToday
              ? !!todayStats.find((l: HabitLog) => l.habitId === habit.id)?.isBadDayPlan
              : false;

            return (
              <HabitHeatmapCard
                key={habit.id}
                habit={habit}
                isCompletedOnSelectedDate={isCompletedToday}
                isCompletedMinimum={isCompletedMinimum}
                completionDates={completionDates}
                linkedSubject={linkedSubject}
                daysArray={daysArray}
                gridCols={gridCols}
                filterRange={filterRange}
                selectedDateStr={selectedDateStr}
                onEdit={setEditingHabit}
                onDelete={(id) => deleteHabit.mutate(id)}
                onToggle={(id, isBadDayPlan) =>
                  toggleHabit.mutate({ habitId: id, isBadDayPlan, date: selectedDateStr })
                }
              />
            );
          })
        )}
      </div>

      <EditHabitDialog
        editingHabit={editingHabit}
        setEditingHabit={setEditingHabit}
        subjects={subjects}
      />
    </div>
  );
}
