'use client';

import React, { useState } from 'react';
import { CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useHabitDashboard,
  useCreateHabit,
  useToggleHabitCompletion,
  useUpdateHabit,
  Habit,
  HabitDifficulty,
} from '@/hooks/useHabits';
import { useSubjects } from '@/hooks/useSubjects';
import { toast } from 'sonner';

const DIFFICULTY_OPTIONS: { label: string; value: HabitDifficulty; color: string }[] = [
  { label: 'Easy', value: 'LOW', color: 'text-emerald-500' },
  { label: 'Medium', value: 'MID', color: 'text-amber-500' },
  { label: 'Hard', value: 'HIGH', color: 'text-rose-500' },
];

export default function Habits() {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useHabitDashboard();
  const { data: subjects } = useSubjects();
  const createHabit = useCreateHabit();
  const toggleHabit = useToggleHabitCompletion();
  const updateHabit = useUpdateHabit();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDifficulty, setAddDifficulty] = useState<HabitDifficulty>('MID');
  const [addSubject, setAddSubject] = useState<string>('none');

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<HabitDifficulty>('MID');
  const [editSubject, setEditSubject] = useState<string>('none');

  const habits: Habit[] = dashboardData?.habits || [];
  const todayStats = dashboardData?.todayStats || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedHabitIds = new Set(todayStats.map((log: any) => log.habitId));
  const isPerfectDay = completedHabitIds.size >= 4;

  const resetAddForm = () => {
    setAddName('');
    setAddDifficulty('MID');
    setAddSubject('none');
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addName.trim()) return;

    if (habits.length >= 6) {
      toast.error('You can only track up to 6 habits at a time.');
      return;
    }

    createHabit.mutate(
      {
        name: addName.trim(),
        difficulty: addDifficulty,
        subjectId: addSubject !== 'none' ? parseInt(addSubject) : undefined,
      },
      {
        onSuccess: () => {
          resetAddForm();
          setIsAddDialogOpen(false);
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
  };

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditDifficulty((habit.difficulty as HabitDifficulty) || 'MID');
    setEditSubject(habit.subjectId ? String(habit.subjectId) : 'none');
    setIsEditDialogOpen(true);
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
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingHabit(null);
          toast.success('Habit updated');
        },
        onError: () => toast.error('Failed to update habit'),
      },
    );
  };

  if (isLoading) {
    return (
      <section className="flex flex-col h-full p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="flex-1 overflow-hidden grid gap-2 content-start pt-2 p-1 -m-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-3 rounded-xl border bg-background border-border/40"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    );
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
              {completedHabitIds.size} / {habits.length}
            </span>
          )}
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetAddForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" disabled={habits.length >= 6}>
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Habit Name
                </Label>
                <Input
                  placeholder="e.g. Read 30 minutes"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </Label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAddDifficulty(opt.value)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        addDifficulty === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span className={addDifficulty === opt.value ? '' : opt.color}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Linked Subject
                </Label>
                <Select value={addSubject} onValueChange={setAddSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to subject (optional)" />
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

              <DialogFooter className="gap-2 sm:gap-0 mt-1">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHabit.isPending || !addName.trim()}>
                  {createHabit.isPending ? 'Adding...' : 'Add Habit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden grid gap-2 content-start p-1 -mx-1 py-2">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isCompleted = completedHabitIds.has(habit.id);
            const linkedSubject = subjects?.find((s) => s.id === habit.subjectId);
            return (
              <Card
                key={habit.id}
                className={`transition-colors group ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/40'}`}
              >
                <CardContent className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    >
                      {habit.name}
                    </span>
                    {linkedSubject && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {linkedSubject.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(habit)}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabit.mutate(habit.id)}
                      disabled={toggleHabit.isPending}
                    />
                  </div>
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

      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Habit Name
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Habit name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Difficulty
              </Label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditDifficulty(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      editDifficulty === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
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
              </Label>
              <Select value={editSubject} onValueChange={setEditSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to subject (optional)" />
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

            <DialogFooter className="gap-2 sm:gap-0 mt-1">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateHabit.isPending || !editName.trim()}>
                {updateHabit.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
