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
import { useUpdateSubject } from '@/hooks/useSubjects';
import { Habit } from '@/hooks/useHabits';
import { Subject } from './columns';
import { ConvertSecsToTimer } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { HabitSelector } from './HabitSelector';

interface EditSubjectDialogProps {
  subject: Subject | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
}

export function EditSubjectDialog({
  subject,
  isOpen,
  onOpenChange,
  habits,
}: EditSubjectDialogProps) {
  const updateSubjectMutation = useUpdateSubject();

  const [color, setColor] = useState('#f97316');
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);

  useEffect(() => {
    if (subject && isOpen) {
      setColor(subject.color || '#f97316');

      setSelectedHabits(subject.habits?.map((h: { id: number }) => h.id) || []);
    }
  }, [subject, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subject) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

    updateSubjectMutation.mutate({
      id: subject.id,
      name,
      goalWorkSecs,
      color,
      habits: selectedHabits,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] lg:max-w-[500px] overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 bg-muted/20 pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Edit Subject
          </DialogTitle>
        </DialogHeader>
        {subject && (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 pt-2 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </Label>
                <Input
                  name="name"
                  defaultValue={subject.name}
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
                    defaultValue={ConvertSecsToTimer({ workSecs: subject.goalWorkSecs || 0 }).hours}
                    placeholder="00"
                    className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                  />
                  <span className="text-muted-foreground font-medium">:</span>
                  <Input
                    name="minutes"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={
                      ConvertSecsToTimer({ workSecs: subject.goalWorkSecs || 0 }).minutes
                    }
                    placeholder="00"
                    className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                  />
                  <span className="text-muted-foreground font-medium">:</span>
                  <Input
                    name="seconds"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={
                      ConvertSecsToTimer({ workSecs: subject.goalWorkSecs || 0 }).seconds
                    }
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
                onClick={() => onOpenChange(false)}
                className="rounded-xl hover:bg-background"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSubjectMutation.isPending}
                className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
