'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Subject } from './Subjects/columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTimerStore } from '@/store/useTimerStore';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '@/hooks/useSubjects';
import { useAuthStore } from '@/store/useAuthStore';
import { ConvertSecsToTimer } from '@/lib/utils';
import { IoIosPlay, IoIosPause } from 'react-icons/io';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Subjects() {
  const { user } = useAuthStore();
  const { data: Subjects = [] } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const { activeSubjectId, startWork, phase, running } = useTimerStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubjectColor, setNewSubjectColor] = useState('#f97316');
  const [editSubjectColor, setEditSubjectColor] = useState('#f97316');

  const router = useRouter();

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
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubjectMutation.mutate(id);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const totalTrackedSecsToday = Subjects.reduce((total: number, subject: Subject) => {
    const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
    const pastSecs = subject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
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

  return (
    <section className="rounded-xl  bg-background p-4">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!user) return;
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const hours = Number(formData.get('hours')) || 0;
                const minutes = Number(formData.get('minutes')) || 0;
                const seconds = Number(formData.get('seconds')) || 0;
                const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;

                createSubject.mutate({ name, goalWorkSecs, color: newSubjectColor });
                e.currentTarget.reset();
                setNewSubjectColor('#f97316');
                setIsAddDialogOpen(false);
              }}
              className="flex flex-col gap-4"
            >
              <Input name="name" placeholder="Subject Name" required />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Goal Time</span>
                <div className="flex items-center gap-2">
                  <Input name="hours" placeholder="hh" type="number" min={0} />
                  <span>:</span>
                  <Input name="minutes" placeholder="mm" type="number" min={0} max={59} />
                  <span>:</span>
                  <Input name="seconds" placeholder="ss" type="number" min={0} max={59} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Subject Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
              <Button type="submit" disabled={createSubject.isPending}>
                {createSubject.isPending ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex my-4 justify-between items-end  gap-1.5 pt-1">
        <p className="text-md font-medium text-muted-foreground">Total today:</p>
        <span className="font-mono text-2xl font-semibold leading-none tracking-tight text-foreground">
          {totalTrackedFormatted}
        </span>
      </div>
      <div className="rounded-lg border border-border">
        <div className=" overflow-y-scroll">
          <table className="w-full text-lg bg-dashboard-card">
            <tbody>
              {Subjects.map((subject: Subject) => {
                const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
                const pastSecs =
                  subject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
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
                    className="border-b border-border last:border-b-0  hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-sm text-foreground capitalize">
                      {subject.name}
                    </td>
                    <td className="px-0 py-2">
                      <span
                        className={`inline-flex items-center justify-center text-left rounded-full border px-2 py-0.5 text-xs tracking-tighter font-medium whitespace-nowrap ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-muted-foreground whitespace-nowrap">
                      {`${pad(hours)}:${pad(minutes)}:${pad(seconds)} / ${goal > 0 ? (goal / 3600).toFixed(1).replace(/\.0$/, '') + 'h' : '0h'}`}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3 min-w-40">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-scroll">
                          <div
                            className="h-full rounded-full bg-orange-500 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-muted-foreground">
                          {percent}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayClick(subject.id)}
                          className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center shrink-0"
                        >
                          {isRunning ? (
                            <IoIosPause className="h-4 w-4 text-white" />
                          ) : (
                            <IoIosPlay className="h-4 w-4 translate-x-0.5 text-white" />
                          )}
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <form
              onSubmit={(e) => {
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
                });
                setIsEditDialogOpen(false);
                setEditingSubject(null);
              }}
              className="flex flex-col gap-4"
            >
              <Input
                name="name"
                placeholder="Subject Name"
                required
                defaultValue={editingSubject?.name}
              />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Goal Time</span>
                <div className="flex items-center gap-2">
                  <Input
                    name="hours"
                    placeholder="hh"
                    type="number"
                    min={0}
                    defaultValue={
                      ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).hours
                    }
                  />
                  <span>:</span>
                  <Input
                    name="minutes"
                    placeholder="mm"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={
                      ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).minutes
                    }
                  />
                  <span>:</span>
                  <Input
                    name="seconds"
                    placeholder="ss"
                    type="number"
                    min={0}
                    max={59}
                    defaultValue={
                      ConvertSecsToTimer({ workSecs: editingSubject.goalWorkSecs || 0 }).seconds
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Subject Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editSubjectColor}
                    onChange={(e) => setEditSubjectColor(e.target.value)}
                    className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
              <Button type="submit" disabled={updateSubjectMutation.isPending}>
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Subjects;
