'use client';
import React, { useState } from 'react';
import { Subject } from './Subjects/columns';
import { useSubjects } from '@/hooks/useSubjects';
import { useHabits } from '@/hooks/useHabits';
import { ConvertSecsToTimer } from '@/lib/utils';
import { SubjectSkeleton } from './Subjects/SubjectSkeleton';
import { AddSubjectDialog } from './Subjects/AddSubjectDialog';
import { EditSubjectDialog } from './Subjects/EditSubjectDialog';
import { SubjectRow } from './Subjects/SubjectRow';

function Subjects() {
  const { data: Subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: habits = [] } = useHabits();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
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

  return (
    <section className="rounded-xl bg-background p-4">
      {subjectsLoading && <SubjectSkeleton />}

      <div className="my-4 flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl mb-2 font-semibold tracking-tight text-foreground">Subjects</h1>
        </div>
        <AddSubjectDialog habits={habits} />
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
              {Subjects.map((subject: Subject) => (
                <SubjectRow key={subject.id} subject={subject} onEdit={handleEdit} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditSubjectDialog
        subject={editingSubject}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        habits={habits}
      />
    </section>
  );
}

export default Subjects;
