'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useHabitDashboard, Habit } from '@/hooks/useHabits';
import { useSubjects } from '@/hooks/useSubjects';
import { HabitSkeleton } from './Habits/HabitSkeleton';
import { AddHabitDialog } from './Habits/AddHabitDialog';
import { EditHabitDialog } from './Habits/EditHabitDialog';
import { HabitCard } from './Habits/HabitCard';

export default function Habits() {
  const { data: dashboardData, isLoading } = useHabitDashboard();
  const { data: subjects } = useSubjects();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const habits: Habit[] = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedHabitIds = new Set(todayStats.map((log: any) => log.habitId));

  const badDayPlanHabitIds = new Set(
    todayStats.filter((log: any) => log.isBadDayPlan).map((log: any) => log.habitId),
  );
  const isPerfectDay = completedHabitIds.size >= 4;

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <HabitSkeleton />;
  }

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden relative">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Daily Habits</h1>
          {habits.length > 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
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
