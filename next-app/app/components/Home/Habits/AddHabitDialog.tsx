import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { useCreateHabit, HabitDifficulty } from '@/hooks/useHabits';
import { toast } from 'sonner';
import { DIFFICULTY_OPTIONS } from './constants';

interface AddHabitDialogProps {
  subjects?: { id: number; name: string }[];
  habitsCount: number;
}

export function AddHabitDialog({ subjects, habitsCount }: AddHabitDialogProps) {
  const { user } = useAuthStore();
  const createHabit = useCreateHabit();

  const [isOpen, setIsOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDifficulty, setAddDifficulty] = useState<HabitDifficulty>('MID');
  const [addSubject, setAddSubject] = useState<string>('none');
  const [addAutoCompleteMins, setAddAutoCompleteMins] = useState<string>('2');

  const resetAddForm = () => {
    setAddName('');
    setAddDifficulty('MID');
    setAddSubject('none');
    setAddAutoCompleteMins('2');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetAddForm();
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addName.trim()) return;

    if (habitsCount >= 6) {
      toast.error('You can only track up to 6 habits at a time.');
      return;
    }

    createHabit.mutate(
      {
        name: addName.trim(),
        difficulty: addDifficulty,
        subjectId: addSubject !== 'none' ? parseInt(addSubject) : undefined,
        autoCompleteTime:
          addSubject !== 'none' && addAutoCompleteMins
            ? Math.max(1, parseInt(addAutoCompleteMins)) * 60
            : null,
      },
      {
        onSuccess: () => {
          resetAddForm();
          setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={habitsCount >= 6}>
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
                  <span className={addDifficulty === opt.value ? '' : opt.color}>{opt.label}</span>
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

          {addSubject !== 'none' && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Auto-Complete Time (mins)
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 2 (fallback to subject goal if empty)"
                value={addAutoCompleteMins}
                onChange={(e) => setAddAutoCompleteMins(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-1">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createHabit.isPending || !addName.trim()}>
              {createHabit.isPending ? 'Adding...' : 'Add Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
