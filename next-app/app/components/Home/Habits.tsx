'use client';

import { useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalIsoDate } from '@/lib/utils';
import { useHabitDashboard, Habit } from '@/hooks/useHabits';
import { useSubjects } from '@/hooks/useSubjects';
import { HabitSkeleton } from './Habits/HabitSkeleton';
import { AddHabitDialog } from './Habits/AddHabitDialog';
import { EditHabitDialog } from './Habits/EditHabitDialog';
import { HabitCard } from './Habits/HabitCard';

export default function Habits({
  passedDate,
  hideDatePicker = false,
}: {
  passedDate?: Date;
  hideDatePicker?: boolean;
} = {}) {
  const [internalDate, setInternalDate] = useState(new Date());
  const selectedDate = passedDate || internalDate;
  const setSelectedDate = passedDate ? () => {} : setInternalDate;
  const selectedDateStr = getLocalIsoDate(selectedDate);
  const isToday = selectedDateStr === getLocalIsoDate(new Date());

  const { data: dashboardData, isLoading } = useHabitDashboard(selectedDateStr);
  const { data: subjects } = useSubjects();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const habits: Habit[] = dashboardData?.habits || [];
  const completedHabitIds = dashboardData?.completedHabitIds || new Set<number>();
  const badDayPlanHabitIds = dashboardData?.badDayPlanHabitIds || new Set<number>();
  const isPerfectDay = dashboardData?.isPerfectDay || false;

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditDialogOpen(true);
  };

  const handlePreviousDay = () => {
    setSelectedDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    });
  };

  if (isLoading) {
    return <HabitSkeleton />;
  }

  return (
    <section
      className="flex flex-col h-full p-4 overflow-hidden relative"
      data-tour-highlight="habits-section"
    >
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {!hideDatePicker && (
              <button
                onClick={handlePreviousDay}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <h1 className="text-2xl font-bold flex flex-col justify-center items-center text-center">
              Daily Habits
              {!hideDatePicker && (
                <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider text-center">
                  {isToday ? 'Today' : selectedDateStr}
                </span>
              )}
            </h1>
            {!hideDatePicker && (
              <button
                onClick={handleNextDay}
                disabled={isToday}
                className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
          {habits.length > 0 && (
            <span
              className={`lg:text-xs text-sm lg:px-2 lg:py-1 py-1 rounded-full font-medium text-center w-16 mx-2 ${
                isPerfectDay ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {completedHabitIds.size} / {habits.length}
            </span>
          )}
        </div>
        <AddHabitDialog subjects={subjects} habitsCount={habits.length} />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden grid gap-2 content-start p-1 -mx-1 py-2">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isCompleted = completedHabitIds.has(habit.id);
            const isCompletedMinimum = badDayPlanHabitIds.has(habit.id);
            const linkedSubject = subjects?.find((s) => s.id === habit.subjectId);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                isCompletedMinimum={isCompletedMinimum}
                linkedSubject={linkedSubject}
                selectedDateStr={selectedDateStr}
                onEdit={openEditDialog}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">
              No habits yet. Track up to 6 key behaviors to build your routine!
            </p>
          </div>
        )}
      </div>

      {isPerfectDay && (
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
          <span>✨ Perfect Day</span>
        </div>
      )}

      <EditHabitDialog
        habit={editingHabit}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subjects={subjects}
      />
    </section>
  );
}
