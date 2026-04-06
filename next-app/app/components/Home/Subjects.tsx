'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Subject, columns } from './Subjects/columbs';
import { DataTable } from './Subjects/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSubjectTimerStore } from '@/store/useSubjectStore';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useSubjectTimer,
  useDeleteSubject,
} from '@/hooks/useSubjects';
import { useAuthStore } from '@/store/useAuthStore';
import { ConvertSecsToTimer } from '@/lib/utils';

function Subjects() {
  const { user } = useAuthStore();
  const { data: Subjects = [] } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const { startTimer, endTimer } = useSubjectTimer();

  const { timerRunningSubjectId, startLocalTimer, stopLocalTimer } = useSubjectTimerStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const router = useRouter();

  const handlePlayClick = async (subjectId: number) => {
    if (timerRunningSubjectId === subjectId) {
      try {
        await endTimer.mutateAsync(subjectId);
      } catch (error) {
        console.error('Failed to end timer:', error);
      }
      stopLocalTimer();
    } else {
      if (timerRunningSubjectId) {
        try {
          await endTimer.mutateAsync(timerRunningSubjectId);
        } catch (error) {
          console.error('Failed to end previous timer:', error);
        }
      }
      try {
        await startTimer.mutateAsync(subjectId);
        startLocalTimer(subjectId);
        router.push('/pomodoro');
      } catch (error) {
        console.error('Failed to start timer:', error);
      }
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubjectMutation.mutate(id);
    }
  };

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size={'sm'} className="font-bold">
              Add Subject
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

                createSubject.mutate({ name, goalWorkSecs });
                e.currentTarget.reset();
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
              <Button type="submit" disabled={createSubject.isPending}>
                {createSubject.isPending ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns({
            toggleTimer: handlePlayClick,
            runningSubjectId: timerRunningSubjectId,
            deleteSubject: handleDelete,
            handleEdit: handleEdit,
          })}
          data={Subjects}
        />
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
