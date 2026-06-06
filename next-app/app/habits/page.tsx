'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useHabitDashboard,
  useHabitsWithLogs,
  useToggleHabitCompletion,
  useCreateHabit,
  useDeleteHabit,
  useUpdateHabit,
  HabitDifficulty,
} from '@/hooks/useHabits';
import { useHabitRewards } from '@/hooks/useHabitRewards';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Calendar,
  Activity,
  Pencil,
  Flame,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface DetailedHabit extends Habit {
  log?: HabitLog[];
}

type FilterRange = 7 | 14 | 21 | 30 | 'all';

const DIFFICULTY_OPTIONS: { label: string; value: HabitDifficulty; color: string }[] = [
  { label: 'Easy', value: 'LOW', color: 'text-emerald-500' },
  { label: 'Medium', value: 'MID', color: 'text-amber-500' },
  { label: 'Hard', value: 'HIGH', color: 'text-rose-500' },
];

const FILTER_OPTIONS: { label: string; value: FilterRange }[] = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '21 Days', value: 21 },
  { label: '30 Days', value: 30 },
  { label: 'All Time', value: 'all' },
];

function HabitCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HabitsPage() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading: dashboardLoading } = useHabitDashboard();

  const [filterRange, setFilterRange] = useState<FilterRange>(21);
  const [filterOpen, setFilterOpen] = useState(false);

  // Add habit dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('none');
  const [selectedDifficulty, setSelectedDifficulty] = useState<HabitDifficulty>('MID');
  const [addAutoCompleteMins, setAddAutoCompleteMins] = useState<string>('2');
  const [addBadDayPlan, setAddBadDayPlan] = useState('');

  // Edit habit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState<string>('none');
  const [editDifficulty, setEditDifficulty] = useState<HabitDifficulty>('MID');
  const [editAutoCompleteMins, setEditAutoCompleteMins] = useState<string>('');
  const [editBadDayPlan, setEditBadDayPlan] = useState('');

  // System Guide
  const [guideOpen, setGuideOpen] = useState(false);

  // Build from date based on filter
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
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const updateHabit = useUpdateHabit();

  const habits = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];
  const completedHabitIds = new Set(todayStats.map((log: HabitLog) => log.habitId));

  useHabitRewards(completedHabitIds.size);

  const resetAddForm = () => {
    setNewTaskTitle('');
    setSelectedSubject('none');
    setSelectedDifficulty('MID');
    setAddAutoCompleteMins('2');
    setAddBadDayPlan('');
  };

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
        difficulty: selectedDifficulty,
        subjectId: selectedSubject !== 'none' ? parseInt(selectedSubject) : undefined,
        badDayPlan: addBadDayPlan.trim() || undefined,
        autoCompleteTime:
          selectedSubject !== 'none' && addAutoCompleteMins
            ? Math.max(1, parseInt(addAutoCompleteMins)) * 60
            : null,
      },
      {
        onSuccess: () => {
          resetAddForm();
          setAddDialogOpen(false);
          toast.success('Habit added');
        },
        onError: () => toast.error('Failed to add habit'),
      },
    );
  };

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditSubject(habit.subjectId ? String(habit.subjectId) : 'none');
    setEditDifficulty(habit.difficulty || 'MID');
    setEditAutoCompleteMins(
      habit.autoCompleteTime ? String(Math.floor(habit.autoCompleteTime / 60)) : '',
    );
    setEditBadDayPlan(habit.badDayPlan || '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editName.trim()) return;

    updateHabit.mutate(
      {
        id: editingHabit.id,
        name: editName.trim(),
        difficulty: editDifficulty,
        subjectId: editSubject !== 'none' ? parseInt(editSubject) : null,
        badDayPlan: editBadDayPlan.trim() || null,
        autoCompleteTime:
          editSubject !== 'none' && editAutoCompleteMins
            ? Math.max(1, parseInt(editAutoCompleteMins)) * 60
            : null,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingHabit(null);
          toast.success('Habit updated');
        },
        onError: () => toast.error('Failed to update habit'),
      },
    );
  };

  // Build the days array based on filter
  const daysArray = useMemo(() => {
    if (filterRange === 'all') {
      const allDates: string[] = [];
      habitsWithLogs?.forEach((h: DetailedHabit) => {
        h.log?.forEach((l: HabitLog) => {
          allDates.push(new Date(l.startedAt).toISOString().split('T')[0]);
        });
      });
      if (allDates.length === 0) {
        const arr = [];
        for (let i = 20; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          arr.push(d.toISOString().split('T')[0]);
        }
        return arr;
      }
      const earliest = allDates.sort()[0];
      const arr = [];
      let cur = new Date(earliest);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      while (cur <= today) {
        arr.push(cur.toISOString().split('T')[0]);
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
      }
      return arr;
    }
    const arr = [];
    for (let i = filterRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, [filterRange, habitsWithLogs]);

  const getDifficultyBadge = (difficulty?: HabitDifficulty) => {
    const opt = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    if (!opt) return null;
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  const gridCols =
    daysArray.length <= 21 ? 'grid-cols-7' : daysArray.length <= 30 ? 'grid-cols-6' : 'grid-cols-7';

  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.value === filterRange)?.label ?? '21 Days';

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Behavior Tracking</h1>
          <p className="text-muted-foreground text-sm">
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

      {/* System Guide Modal */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 gap-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary p-2.5 rounded-xl text-primary-foreground shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                The Science of Habits
              </DialogTitle>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-primary">1.</span> The Minimum Viable Habit
                </h3>
                <p className="text-muted-foreground mb-3">
                  {`Motivation is unreliable. When you have zero energy, the friction to start a
                  1-hour workout is too high. By shrinking the habit down to a 2-minute version
                  (e.g., "Do 1 pushup"), you eliminate the friction of starting.`}
                </p>
                <p className="font-medium">
                  <strong>The Goal:</strong> Never throw up a zero. Complete the minimum baseline to
                  keep your streak alive.
                </p>
              </div>

              <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-primary">2.</span> Never Miss Twice
                </h3>
                <p className="text-muted-foreground">
                  {`Missing one day is an accident. Missing two days is the start of a new (bad)
                  habit. Don't aim for perfection; aim to bounce back immediately. A "minimum"
                  completion counts as a win.`}
                </p>
              </div>

              <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-primary">3.</span> Identity Over Outcomes
                </h3>
                <p className="text-muted-foreground">
                  Every time you complete a habit—even the minimum version—you cast a vote for the
                  type of person you want to become. You are building proof of your identity, not
                  just chasing a number.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button
                onClick={() => setGuideOpen(false)}
                className="rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                Got It
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toolbar: Add + Filter toggle */}
      <div className="flex items-center gap-2 mb-3">
        {/* Add Habit Modal */}
        <Dialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) resetAddForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-10 px-5 rounded-xl gap-2" disabled={habits.length >= 6}>
              <Plus className="h-4 w-4" />
              Add Habit
              <span className="text-primary-foreground/60 text-xs font-normal">
                ({habits.length}/6)
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 pb-4 bg-muted/20">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Install a New Habit
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Build consistency one day at a time.
              </p>
            </DialogHeader>
            <form onSubmit={handleAddHabit} className="flex flex-col">
              <div className="p-6 pt-4 space-y-5">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Habit Name
                  </Label>
                  <Input
                    placeholder="e.g. Read 30 minutes"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    autoFocus
                    className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                  />
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Difficulty
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedDifficulty(opt.value)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          selectedDifficulty === opt.value
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className={selectedDifficulty === opt.value ? '' : opt.color}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Linked Subject
                    <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                      (optional)
                    </span>
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                      <SelectValue placeholder="No subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Subject</SelectItem>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto Complete Time (only if subject linked) */}
                {selectedSubject !== 'none' && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Auto-Complete Time
                      <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                        (minutes)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 2 (fallback to subject goal if empty)"
                      value={addAutoCompleteMins}
                      onChange={(e) => setAddAutoCompleteMins(e.target.value)}
                      className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                    />
                  </div>
                )}

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary/90 mt-2 leading-relaxed">
                  <strong>Pro Tip:</strong>
                  {`On days when you have zero energy, complete a minimum
                  baseline (e.g., "Do 1 pushup") to keep your streak alive. The goal is to never
                  throw up a zero.`}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bad Day Plan
                    <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="e.g. Do 1 pushup"
                    value={addBadDayPlan}
                    onChange={(e) => setAddBadDayPlan(e.target.value)}
                    className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <DialogFooter className="p-6 pt-0 gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddDialogOpen(false)}
                  className="rounded-xl flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newTaskTitle.trim() || createHabit.isPending}
                  className="rounded-xl flex-1 shadow-lg shadow-primary/20"
                >
                  {createHabit.isPending ? 'Adding...' : 'Add Habit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Filter toggle button */}
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

      {/* Collapsible Filter Panel */}
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

      {/* Habits Grid */}
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
          habits.map((habit: Habit) => {
            const isCompletedToday = completedHabitIds.has(habit.id);
            const detailedHabit = habitsWithLogs?.find((h: DetailedHabit) => h.id === habit.id);
            const completionDates = new Map<string, boolean>();

            detailedHabit?.log?.forEach((l: HabitLog) => {
              const dateStr = new Date(l.startedAt).toISOString().split('T')[0];
              completionDates.set(dateStr, l.isBadDayPlan || false);
            });

            if (isCompletedToday) {
              const todayLog = todayStats.find((l: HabitLog) => l.habitId === habit.id);
              completionDates.set(
                new Date().toISOString().split('T')[0],
                todayLog?.isBadDayPlan || false,
              );
            }

            const linkedSubject = subjects?.find((s) => s.id === habit.subjectId);

            return (
              <Card
                key={habit.id}
                className={`transition-all group ${
                  isCompletedToday
                    ? 'border-primary/50 bg-primary/5'
                    : 'bg-background border-border/40'
                } flex flex-col`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <CardTitle className="text-base leading-tight truncate">{habit.name}</CardTitle>
                    <div className="flex items-center gap-1.5">
                      {getDifficultyBadge(habit.difficulty)}
                      {linkedSubject && (
                        <>
                          {habit.difficulty && (
                            <span className="text-muted-foreground/40 text-[10px]">·</span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-medium truncate">
                            {linkedSubject.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(habit)}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Habit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Checkbox
                      checked={isCompletedToday}
                      onCheckedChange={() =>
                        toggleHabit.mutate({ habitId: habit.id, isBadDayPlan: false })
                      }
                      className="h-5 w-5 rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit.mutate(habit.id)}
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      title="Delete Habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-xs text-muted-foreground mb-2 flex justify-between font-medium">
                    <span>{filterRange === 'all' ? 'All Time' : `Last ${filterRange} Days`}</span>
                    <span>
                      {completionDates.size} /{' '}
                      {filterRange === 'all' ? daysArray.length : filterRange}
                    </span>
                  </div>
                  <div className={`grid ${gridCols} gap-1`}>
                    {daysArray.map((dateStr, i) => {
                      const done = completionDates.has(dateStr);
                      const isBadDayPlan = done ? completionDates.get(dateStr) : false;
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      return (
                        <div
                          key={i}
                          title={dateStr}
                          className={`aspect-square rounded-sm transition-colors ${
                            done ? (isBadDayPlan ? 'bg-primary/50' : 'bg-primary') : 'bg-muted/40'
                          } ${isToday && !done ? 'border-2 border-primary/40' : ''}`}
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

      {/* Edit Habit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-4 bg-muted/20">
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col">
            <div className="p-6 pt-4 space-y-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Habit Name
                </Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Habit name"
                  required
                  className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditDifficulty(opt.value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        editDifficulty === opt.value
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span className={editDifficulty === opt.value ? '' : opt.color}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Linked Subject
                  <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                    (optional)
                  </span>
                </Label>
                <Select value={editSubject} onValueChange={setEditSubject}>
                  <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                    <SelectValue placeholder="Link to subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subject</SelectItem>
                    {subjects?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editSubject !== 'none' && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Auto-Complete Time
                    <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                      (minutes)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 2 (fallback to subject goal if empty)"
                    value={editAutoCompleteMins}
                    onChange={(e) => setEditAutoCompleteMins(e.target.value)}
                    className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary/90 mt-2 leading-relaxed">
                <strong>Pro Tip:</strong>{' '}
                {`On days when you have zero energy, complete a minimum
                baseline (e.g., "Do 1 pushup") to keep your streak alive. The goal is to never throw
                up a zero.`}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bad Day Plan
                  <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                    (optional)
                  </span>
                </Label>
                <Input
                  placeholder="e.g. Do 1 pushup"
                  value={editBadDayPlan}
                  onChange={(e) => setEditBadDayPlan(e.target.value)}
                  className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-0 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditDialogOpen(false)}
                className="rounded-xl flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateHabit.isPending || !editName.trim()}
                className="rounded-xl flex-1 shadow-lg shadow-primary/20"
              >
                {updateHabit.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
