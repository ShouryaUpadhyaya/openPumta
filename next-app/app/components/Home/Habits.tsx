'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useHabitDashboard,
  useCreateHabit,
  useToggleHabitCompletion,
  Habit,
} from '@/hooks/useHabits';
import { toast } from 'sonner';

export default function Habits() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useHabitDashboard();
  const createHabit = useCreateHabit();
  const toggleHabit = useToggleHabitCompletion();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const habits: Habit[] = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];

  // Set to quickly check if a habit is completed today
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedHabitIds = new Set(todayStats.map((log: any) => log.habitId));

  const isPerfectDay = completedHabitIds.size >= 4;

  const handleAddHabit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const name = (form.elements[0] as HTMLInputElement).value;

    if (habits.length >= 6) {
      toast.error(
        'You can only track up to 6 habits at a time. Delete an existing habit to add a new one.',
      );
      return;
    }

    if (name) {
      createHabit.mutate(
        { name, userId: user.id },
        {
          onSuccess: () => {
            form.reset();
            setIsDialogOpen(false);
            toast.success('Habit added');
          },
          onError: (err: unknown) => {
            toast.error(
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to add habit',
            );
          },
        },
      );
    }
  };

  if (isLoading) {
    return <div className="p-4 flex items-center justify-center h-full">Loading habits...</div>;
  }

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden relative">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Daily Habits</h1>
          {habits.length > 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${isPerfectDay ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              {completedHabitIds.size} / 6
            </span>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={habits.length >= 6}>
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
              <Input placeholder="Habit Name" required />
              <Button type="submit" disabled={createHabit.isPending}>
                {createHabit.isPending ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden grid gap-2 content-start">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isCompleted = completedHabitIds.has(habit.id);
            return (
              <Card
                key={habit.id}
                className={`transition-colors ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/40'}`}
              >
                <CardContent className="flex items-center justify-between px-3">
                  <span
                    className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {habit.name}
                  </span>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleHabit.mutate(habit.id)}
                    disabled={toggleHabit.isPending}
                  />
                </CardContent>
              </Card>
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
    </section>
  );
}
