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
import { useCounterStore } from '@/store/useStore';
import { ConvertSecsToTimer } from '@/lib/utils';

function Subjects() {
  const { addSubject, Subjects, toggleTimer, timerRunningSubjectId, deleteSubject, updateSubject } =
    useCounterStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const router = useRouter();

  const handlePlayClick = (subjectId: string) => {
    toggleTimer(subjectId);
    router.push('/pomodoro');
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
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
                const form = e.currentTarget;
                const name = (form.elements[0] as HTMLInputElement).value;
                const hours = Number((form.elements[1] as HTMLInputElement).value) || 0;
                const minutes = Number((form.elements[2] as HTMLInputElement).value) || 0;
                const seconds = Number((form.elements[3] as HTMLInputElement).value) || 0;
                const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;
                addSubject(name, goalWorkSecs);
                form.reset();
                setIsAddDialogOpen(false);
              }}
              className="flex flex-col gap-4"
            >
              <Input placeholder="Subject Name" required />
              <div className="flex items-center gap-2">
                <Input placeholder="hh" type="number" />
                <span>:</span>
                <Input placeholder="mm" type="number" />
                <span>:</span>
                <Input placeholder="ss" type="number" />
              </div>
              <Button type="submit">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns({
            toggleTimer: handlePlayClick,
            runningSubjectId: timerRunningSubjectId,
            deleteSubject: deleteSubject,
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
                const form = e.currentTarget;
                const name = (form.elements[0] as HTMLInputElement).value;
                const hours = Number((form.elements[1] as HTMLInputElement).value) || 0;
                const minutes = Number((form.elements[2] as HTMLInputElement).value) || 0;
                const seconds = Number((form.elements[3] as HTMLInputElement).value) || 0;
                const goalWorkSecs = hours * 3600 + minutes * 60 + seconds;
                updateSubject({
                  ...editingSubject,
                  name,
                  goalWorkSecs,
                });
                setIsEditDialogOpen(false);
                setEditingSubject(null);
              }}
              className="flex flex-col gap-4"
            >
              <Input placeholder="Subject Name" required defaultValue={editingSubject?.name} />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="hh"
                  type="number"
                  defaultValue={
                    ConvertSecsToTimer({
                      workSecs: editingSubject.goalWorkSecs,
                    }).hours
                  }
                />
                <span>:</span>
                <Input
                  placeholder="mm"
                  type="number"
                  defaultValue={
                    ConvertSecsToTimer({
                      workSecs: editingSubject.goalWorkSecs,
                    }).minutes
                  }
                />
                <span>:</span>
                <Input
                  placeholder="ss"
                  type="number"
                  defaultValue={
                    ConvertSecsToTimer({
                      workSecs: editingSubject.goalWorkSecs,
                    }).seconds
                  }
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Subjects;
