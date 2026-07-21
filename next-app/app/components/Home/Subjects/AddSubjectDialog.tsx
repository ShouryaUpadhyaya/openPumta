import React, { useState, useEffect, useMemo } from 'react';
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
import { useCreateSubject, useArchivedSubjects, useRestoreSubject } from '@/hooks/useSubjects';
import { Habit } from '@/hooks/useHabits';
import { useAuthStore } from '@/store/useAuthStore';
import { ColorPicker } from './ColorPicker';
import { HabitSelector } from './HabitSelector';
import { cn } from '@/lib/utils';
import { RotateCcw, ChevronDown, ChevronRight, Archive } from 'lucide-react';
import { toast } from 'sonner';

interface AddSubjectDialogProps {
  habits: Habit[];
  empty: boolean;
}

export function AddSubjectDialog({ habits, empty }: AddSubjectDialogProps) {
  const { user } = useAuthStore();
  const createSubject = useCreateSubject();
  const { data: archived } = useArchivedSubjects();
  const restoreSubject = useRestoreSubject();

  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState('#f97316');
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [typedName, setTypedName] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Check if the typed name matches an archived subject
  const matchedArchived = useMemo(() => {
    if (!typedName.trim() || !archived?.length) return null;
    return archived.find((s) => s.name.toLowerCase() === typedName.trim().toLowerCase()) ?? null;
  }, [typedName, archived]);

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
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

    createSubject.mutate(
      { name: typedName, goalWorkSecs, color, habits: selectedHabits },
      {
        onSuccess: (data: any) => {
          setIsOpen(false);
          if (data?.restored) {
            toast.success(`"${data.name}" restored with all past logs!`);
          } else {
            toast.success('Subject added');
          }
        },
        onError: () => toast.error('Failed to add subject'),
      },
    );
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
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Subject Name"
                required
                className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
              />
              {matchedArchived && (
                <div className="flex items-start gap-2 mt-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary/90">
                  <RotateCcw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    <strong>Past history found!</strong> Adding this subject will restore{' '}
                    <strong>&quot;{matchedArchived.name}&quot;</strong> with{' '}
                    {matchedArchived._count?.subjectLogs || 0} past logs preserved.
                  </span>
                </div>
              )}
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

            {archived && archived.length > 0 && (
              <div className="border-t border-muted-foreground/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowArchived((p) => !p)}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {showArchived ? (
                    <ChevronDown className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                  )}
                  <Archive className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                  Archived Subjects ({archived.length})
                </button>

                {showArchived && (
                  <div className="mt-3 flex flex-col gap-2">
                    {archived.map((archSubj) => (
                      <div
                        key={archSubj.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{archSubj.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {archSubj._count?.subjectLogs || 0} logs
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={restoreSubject.isPending}
                          onClick={() => {
                            restoreSubject.mutate(archSubj.id, {
                              onSuccess: (data: any) => {
                                toast.success(`"${data.name}" restored!`);
                                setIsOpen(false);
                              },
                              onError: () => toast.error('Failed to restore subject'),
                            });
                          }}
                          className="h-7 px-2.5 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
