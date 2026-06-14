import React, { useState, useEffect } from 'react';
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
import { useCreateSubject } from '@/hooks/useSubjects';
import { Habit } from '@/hooks/useHabits';
import { useAuthStore } from '@/store/useAuthStore';
import { ColorPicker } from './ColorPicker';
import { HabitSelector } from './HabitSelector';
import { cn } from '@/lib/utils';
interface AddSubjectDialogProps {
  habits: Habit[];
  empty: boolean;
}

export function AddSubjectDialog({ habits, empty }: AddSubjectDialogProps) {
  const { user } = useAuthStore();
  const createSubject = useCreateSubject();

  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState('#f97316');
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColor('#f97316');

      setSelectedHabits([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

    createSubject.mutate({ name, goalWorkSecs, color, habits: selectedHabits });
    setIsOpen(false);
  };

  console.log('empty ', empty);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 font-medium',
            empty && 'animate-pulse',
          )}
        >
          + Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[450px] lg:max-w-[500px] overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 bg-muted/20 pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Add New Subject
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 pt-2 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </Label>
              <Input
                name="name"
                placeholder="Subject Name"
                required
                className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Goal Time
              </Label>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-muted-foreground/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 transition-all w-fit">
                <Input
                  name="hours"
                  type="number"
                  min={0}
                  placeholder="00"
                  className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  name="minutes"
                  type="number"
                  min={0}
                  max={59}
                  placeholder="00"
                  className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  name="seconds"
                  type="number"
                  min={0}
                  max={59}
                  placeholder="00"
                  className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                />
              </div>
            </div>

            <ColorPicker color={color} onChange={setColor} />

            <div className="border-t border-muted-foreground/10 pt-4 mt-2">
              <HabitSelector
                habits={habits}
                selectedHabits={selectedHabits}
                onChange={setSelectedHabits}
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/20 border-t border-muted-foreground/5 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSubject.isPending}
              className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {createSubject.isPending ? 'Adding...' : 'Add Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
