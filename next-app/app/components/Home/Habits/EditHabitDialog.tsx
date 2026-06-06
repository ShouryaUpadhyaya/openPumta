import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useUpdateHabit, HabitDifficulty, Habit } from '@/hooks/useHabits';
import { toast } from 'sonner';
import { DIFFICULTY_OPTIONS } from './constants';

interface EditHabitDialogProps {
  habit: Habit | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjects?: { id: number; name: string }[];
}

export function EditHabitDialog({ habit, isOpen, onOpenChange, subjects }: EditHabitDialogProps) {
  const updateHabit = useUpdateHabit();

  const [editName, setEditName] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<HabitDifficulty>('MID');
  const [editSubject, setEditSubject] = useState<string>('none');
  const [editAutoCompleteMins, setEditAutoCompleteMins] = useState<string>('');

  useEffect(() => {
    if (habit && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditName(habit.name);

      setEditDifficulty((habit.difficulty as HabitDifficulty) || 'MID');

      setEditSubject(habit.subjectId ? String(habit.subjectId) : 'none');

      setEditAutoCompleteMins(
        habit.autoCompleteTime ? String(Math.floor(habit.autoCompleteTime / 60)) : '',
      );
    }
  }, [habit, isOpen]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !editName.trim()) return;

    updateHabit.mutate(
      {
        id: habit.id,
        name: editName.trim(),
        difficulty: editDifficulty,
        subjectId: editSubject !== 'none' ? parseInt(editSubject) : null,
        autoCompleteTime:
          editSubject !== 'none' && editAutoCompleteMins
            ? Math.max(1, parseInt(editAutoCompleteMins)) * 60
            : null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success('Habit updated');
        },
        onError: () => toast.error('Failed to update habit'),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                  <span className={editDifficulty === opt.value ? '' : opt.color}>{opt.label}</span>
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

          {editSubject !== 'none' && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Auto-Complete Time (mins)
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 2 (fallback to subject goal if empty)"
                value={editAutoCompleteMins}
                onChange={(e) => setEditAutoCompleteMins(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateHabit.isPending || !editName.trim()}>
              {updateHabit.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
