import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateHabit, HabitDifficulty, useArchivedHabits } from '@/hooks/useHabits';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { DIFFICULTY_OPTIONS } from './constants';

export function AddHabitDialog({
  habitsCount,
  subjects,
}: {
  habitsCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subjects: any[] | undefined;
}) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('none');
  const [selectedDifficulty, setSelectedDifficulty] = useState<HabitDifficulty>('MID');
  const [addAutoCompleteMins, setAddAutoCompleteMins] = useState<string>('2');
  const [addBadDayPlan, setAddBadDayPlan] = useState('');

  const createHabit = useCreateHabit();
  const { data: archived } = useArchivedHabits();

  // Check if the typed name matches an archived habit (case-insensitive)
  const matchedArchived = useMemo(() => {
    if (!newTaskTitle.trim() || !archived?.length) return null;
    return archived.find((h) => h.name.toLowerCase() === newTaskTitle.trim().toLowerCase()) ?? null;
  }, [newTaskTitle, archived]);

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

    if (habitsCount >= 6) {
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
        onSuccess: (data: any) => {
          resetAddForm();
          setOpen(false);
          if (data?.restored) {
            toast.success(`"${data.name}" restored with all past history!`);
          } else {
            toast.success('Habit added');
          }
        },
        onError: () => toast.error('Failed to add habit'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetAddForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 px-5 rounded-xl gap-2" disabled={habitsCount >= 6}>
          <Plus className="h-4 w-4" />
          Add Habit
          <span className="text-primary-foreground/60 text-xs font-normal">({habitsCount}/6)</span>
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
              {matchedArchived && (
                <div className="flex items-start gap-2 mt-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary/90">
                  <RotateCcw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    <strong>Past history found!</strong> Adding this habit will restore{' '}
                    <strong>&quot;{matchedArchived.name}&quot;</strong> with{' '}
                    {matchedArchived._count.log} session
                    {matchedArchived._count.log !== 1 ? 's' : ''} of history preserved.
                  </span>
                </div>
              )}
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
              onClick={() => setOpen(false)}
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
  );
}
