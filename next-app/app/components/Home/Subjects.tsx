'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Subject } from './Subjects/columns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useTimerStore } from '@/store/useTimerStore';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '@/hooks/useSubjects';
import { useHabits } from '@/hooks/useHabits';
import { useAuthStore } from '@/store/useAuthStore';
import { ConvertSecsToTimer, cn } from '@/lib/utils';
import { IoIosPlay, IoIosPause } from 'react-icons/io';
import { MoreVertical, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const PRESET_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#71717a', // Zinc
];

function Subjects() {
  const { user } = useAuthStore();
  const { data: Subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: habits = [] } = useHabits();
  const createSubject = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const { activeSubjectId, startWork, phase, running } = useTimerStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // States for Add Modal
  const [newSubjectColor, setNewSubjectColor] = useState('#f97316');
  const [newSubjectHabits, setNewSubjectHabits] = useState<number[]>([]);

  // States for Edit Modal
  const [editSubjectColor, setEditSubjectColor] = useState('#f97316');
  const [editSubjectHabits, setEditSubjectHabits] = useState<number[]>([]);

  const router = useRouter();

  // Reset Add Modal state when closed
  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewSubjectColor('#f97316');
      setNewSubjectHabits([]);
    }
  }, [isAddDialogOpen]);

  const handlePlayClick = async (subjectId: number) => {
    try {
      await startWork(subjectId);
      if (phase != 'work') router.push('/pomodoro');
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectColor(subject.color || '#f97316');
    setEditSubjectHabits(subject.habits?.map((h) => h.id) || []);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubjectMutation.mutate(id);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const getSubjectLogSecs = (log: NonNullable<Subject['subjectLogs']>[number]) => {
    if (log.durationSecs !== undefined) return log.durationSecs;
    if (log.duration !== undefined) return log.duration;
    if (log.endedAt) {
      return Math.max(
        0,
        Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000),
      );
    }
    return 0;
  };

  const totalTrackedSecsToday = Subjects.reduce((total: number, subject: Subject) => {
    const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
    const pastSecs =
      subject.subjectLogs?.reduce((acc, log) => acc + getSubjectLogSecs(log), 0) || 0;
    const activeSecs = activeLog
      ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
      : 0;
    return total + pastSecs + activeSecs;
  }, 0);

  const {
    hours: totalH,
    minutes: totalM,
    seconds: totalS,
  } = ConvertSecsToTimer({
    workSecs: totalTrackedSecsToday,
  });
  const totalTrackedFormatted = `${pad(totalH)}:${pad(totalM)}:${pad(totalS)}`;

  const handleAddSubjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

    createSubject.mutate({ name, goalWorkSecs, color: newSubjectColor, habits: newSubjectHabits });
    setIsAddDialogOpen(false);
  };

  const handleEditSubjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubject) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hours = Number(formData.get('hours')) || 0;
    const minutes = Number(formData.get('minutes')) || 0;
    const seconds = Number(formData.get('seconds')) || 0;
    const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

    updateSubjectMutation.mutate({
      id: editingSubject.id,
      name,
      goalWorkSecs,
      color: editSubjectColor,
      habits: editSubjectHabits,
    });
    setIsEditDialogOpen(false);
    setEditingSubject(null);
  };

  const renderColorPicker = (colorState: string, setColorState: (color: string) => void) => (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Subject Color
      </Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setColorState(color)}
            className="group relative h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {colorState === color && (
              <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            )}
            <span className="sr-only">Select color {color}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderHabitSelector = (
    selectedHabits: number[],
    setSelectedHabits: (habits: number[]) => void,
  ) => (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Linked Habits
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {habits.map((habit) => {
          const isChecked = selectedHabits.includes(habit.id);
          return (
            <label
              key={habit.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                isChecked
                  ? 'border-primary bg-primary/10'
                  : 'bg-muted/10 hover:bg-muted/30 border-muted-foreground/10',
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedHabits([...selectedHabits, habit.id]);
                  } else {
                    setSelectedHabits(selectedHabits.filter((id) => id !== habit.id));
                  }
                }}
              />
              <span className="text-sm font-medium leading-none truncate">{habit.name}</span>
            </label>
          );
        })}
        {habits.length === 0 && (
          <span className="text-sm text-muted-foreground col-span-2">No habits available.</span>
        )}
      </div>
    </div>
  );

  return (
    <section className="rounded-xl  bg-background p-4">
      {subjectsLoading && (
        <div className="my-4">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="flex justify-between items-end gap-1.5 mb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="my-4 flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl mb-2 font-semibold tracking-tight text-foreground">Subjects</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 font-medium">
              + Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[450px] lg:max-w-[500px] overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
            <DialogHeader className="p-6 bg-muted/20 pb-4">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Add New Subject
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubjectSubmit} className="flex flex-col">
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

                {renderColorPicker(newSubjectColor, setNewSubjectColor)}

                <div className="border-t border-muted-foreground/10 pt-4 mt-2">
                  {renderHabitSelector(newSubjectHabits, setNewSubjectHabits)}
                </div>
              </div>
              <DialogFooter className="p-6 bg-muted/20 border-t border-muted-foreground/5 gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddDialogOpen(false)}
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
      </div>
      <div className="flex my-2 justify-between items-end gap-1.5 pt-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total today:</p>
        <span className="font-mono text-lg sm:text-2xl font-semibold leading-none tracking-tight text-foreground">
          {totalTrackedFormatted}
        </span>
      </div>
      <div className="rounded-lg border border-border">
        <div className="overflow-x-auto overflow-y-auto">
          <table className="w-full text-xs sm:text-sm lg:text-base bg-dashboard-card">
            <tbody>
              {Subjects.map((subject: Subject) => {
                const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
                const pastSecs =
                  subject.subjectLogs?.reduce((acc, log) => acc + getSubjectLogSecs(log), 0) || 0;
                const totalSecs =
                  pastSecs +
                  (activeLog
                    ? Math.floor(
                        (new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000,
                      )
                    : 0);
                const goal = subject.goalWorkSecs || 0;
                const percent = goal > 0 ? Math.min(100, Math.round((totalSecs / goal) * 100)) : 0;

                const { hours, minutes, seconds } = ConvertSecsToTimer({ workSecs: totalSecs });
                const isRunning = phase === 'work' && running && activeSubjectId === subject.id;

                let statusText = 'Not started';
                let statusClass = 'border-border bg-muted text-muted-foreground';
                if (totalSecs > 0) {
                  if (goal > 0 && percent >= 100) {
                    statusText = 'Completed';
                    statusClass = 'border-green-500/20 bg-green-500/10 text-green-400';
                  } else if (goal > 0 && percent >= 50) {
                    statusText = 'Good progress';
                    statusClass = 'border-blue-500/20 bg-blue-500/10 text-blue-400';
                  } else {
                    statusText = 'Started';
                    statusClass = 'border-primary/20 bg-primary/10 text-primary';
                  }
                }

                return (
                  <tr
                    key={subject.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-2 py-3 sm:px-4 sm:py-4 font-medium text-xs sm:text-sm text-foreground capitalize">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color || '#f97316' }}
                        />
                        <span className="truncate max-w-[80px] sm:max-w-none">{subject.name}</span>
                      </div>
                    </td>
                    <td className="px-1 py-2 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center justify-center text-left rounded-full border px-1.5 py-0.5 text-[9px] sm:text-xs tracking-tighter font-medium whitespace-nowrap ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 font-mono text-[10px] sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                      {`${pad(hours)}:${pad(minutes)}:${pad(seconds)} / ${goal > 0 ? (goal / 3600).toFixed(1).replace(/\.0$/, '') + 'h' : '0h'}`}
                    </td>
                    <td className="px-2 py-2 sm:px-4 sm:py-2 hidden sm:table-cell">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-[70px] sm:min-w-40">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: subject.color || '#f97316',
                            }}
                          />
                        </div>
                        <span className="w-6 sm:w-8 text-right text-[10px] sm:text-xs text-muted-foreground">
                          {percent}%
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-2 sm:px-4 sm:py-2 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <div className="relative flex items-center justify-center">
                          <svg
                            className="absolute inset-0 w-8 h-8 sm:hidden -rotate-90 pointer-events-none"
                            viewBox="0 0 32 32"
                          >
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              fill="none"
                              className="stroke-muted"
                              strokeWidth="2.5"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              fill="none"
                              stroke={subject.color || '#f97316'}
                              strokeWidth="2.5"
                              strokeDasharray="100"
                              strokeDashoffset={100 - percent}
                              pathLength="100"
                              className="transition-all duration-300"
                              strokeLinecap="round"
                            />
                          </svg>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayClick(subject.id)}
                            className="h-6 w-6 sm:h-8 sm:w-8 m-1 sm:m-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center shrink-0"
                          >
                            {isRunning ? (
                              <IoIosPause className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            ) : (
                              <IoIosPlay className="h-3 w-3 sm:h-4 sm:w-4 translate-x-[1px] text-white" />
                            )}
                          </Button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={() => handleEdit(subject)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(subject.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[450px] lg:max-w-[500px] overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 bg-muted/20 pb-4">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Edit Subject
            </DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <form onSubmit={handleEditSubjectSubmit} className="flex flex-col">
              <div className="p-6 pt-2 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    name="name"
                    defaultValue={editingSubject.name}
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
                      defaultValue={
                        ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).hours
                      }
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
                        ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).minutes
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
                        ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).seconds
                      }
                      placeholder="00"
                      className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                    />
                  </div>
                </div>

                {renderColorPicker(editSubjectColor, setEditSubjectColor)}

                <div className="border-t border-muted-foreground/10 pt-4 mt-2">
                  {renderHabitSelector(editSubjectHabits, setEditSubjectHabits)}
                </div>
              </div>
              <DialogFooter className="p-6 bg-muted/20 border-t border-muted-foreground/5 gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSubject(null);
                  }}
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
    </section>
  );
}

export default Subjects;
