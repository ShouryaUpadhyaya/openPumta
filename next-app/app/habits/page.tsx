'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useHabitDashboard,
  useHabitsWithLogs,
  useToggleHabitCompletion,
  useCreateHabit,
  useDeleteHabit,
} from '@/hooks/useHabits';
import { useHabitRewards } from '@/hooks/useHabitRewards';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Calendar, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function HabitsPage() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading: dashboardLoading } = useHabitDashboard();

  // Fetch logs for the past 21 days
  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 20);
  const fromDateString = twentyOneDaysAgo.toISOString();
  const { data: habitsWithLogs } = useHabitsWithLogs(fromDateString);
  const { data: subjects } = useSubjects();

  const toggleHabit = useToggleHabitCompletion();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('none');

  const habits = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedHabitIds = new Set(todayStats.map((log: any) => log.habitId));

  // Trigger animations
  useHabitRewards(completedHabitIds.size);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    if (habits.length >= 6) {
      toast.error('You can only track up to 6 habits at a time.');
      return;
    }

    createHabit.mutate(
      {
        name: newTaskTitle.trim(),
        subjectId: selectedSubject !== 'none' ? parseInt(selectedSubject) : undefined,
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setSelectedSubject('none');
          toast.success('Habit added');
        },
        onError: () => toast.error('Failed to add habit'),
      },
    );
  };

  // Build the 21 days array
  const last21Days = useMemo(() => {
    const arr = [];
    for (let i = 20; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, []);

  if (dashboardLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        Loading habits...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Behavior Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your 21-day cycles and maintain your perfect days.
          </p>
        </div>
        {completedHabitIds.size >= 4 && (
          <div className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-in fade-in zoom-in">
            <span>✨ Perfect Day Achieved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2 mb-8">
        <Input
          className="flex-1 bg-background border-border/60 rounded-xl h-12 px-4 shadow-sm"
          placeholder="Install a new habit..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px] h-12 rounded-xl">
            <SelectValue placeholder="Link Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Linking</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={!newTaskTitle.trim() || createHabit.isPending || habits.length >= 6}
          className="h-12 px-6 rounded-xl shrink-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Habit ({habits.length}/6)
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            <Calendar className="h-12 w-12 mb-4 opacity-20" />
            <p>Your habit tracker is empty.</p>
            <p className="text-sm">Add up to 6 habits above to begin your 21-day journey.</p>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          habits.map((habit: any) => {
            const isCompletedToday = completedHabitIds.has(habit.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detailedHabit = habitsWithLogs?.find((h: any) => h.id === habit.id);
            const completionDates = new Set(
              detailedHabit?.log?.map(
                (l: any) => new Date(l.startedAt).toISOString().split('T')[0],
              ) || [],
            );

            // If we mark it complete just now contextually on frontend
            if (isCompletedToday) completionDates.add(new Date().toISOString().split('T')[0]);

            return (
              <Card
                key={habit.id}
                className={`transition-all ${isCompletedToday ? 'border-primary/50 bg-primary/5' : 'bg-background border-border/40'} flex flex-col`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{habit.name}</CardTitle>
                    {habit.subjectId && (
                      <span className="text-xs text-muted-foreground">
                        Linked: {subjects?.find((s) => s.id === habit.subjectId)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isCompletedToday}
                      onCheckedChange={() => toggleHabit.mutate(habit.id)}
                      className="h-5 w-5 rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit.mutate(habit.id)}
                      className="text-destructive hover:bg-destructive/10 h-8 w-8 ml-1"
                      title="Delete Habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-xs text-muted-foreground mb-2 flex justify-between font-medium">
                    <span>21-Day History</span>
                    <span>{completionDates.size} / 21</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {last21Days.map((dateStr, i) => {
                      const done = completionDates.has(dateStr);
                      // Is it today?
                      const isToday = dateStr === last21Days[20];
                      return (
                        <div
                          key={i}
                          title={dateStr}
                          className={`aspect-square rounded-sm ${done ? 'bg-primary' : 'bg-muted/40'} ${isToday && !done ? 'border-2 border-primary/40' : ''}`}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
