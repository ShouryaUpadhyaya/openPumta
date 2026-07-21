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
import CallToAction from './Subjects/CallToAction';

function Subjects() {
  const { data: Subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: habits = [] } = useHabits();

  const activeSubjects = Subjects.filter((s: Subject) => !s.deleted && !s.isDeleted);

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

  const totalTrackedSecsToday = activeSubjects.reduce((total: number, subject: Subject) => {
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

  console.log('empty ', Subjects.length === 0);
  return (
    <section
      className="flex flex-col h-full rounded-xl bg-background p-4"
      data-tour-highlight="subjects-section"
    >
      {subjectsLoading && <SubjectSkeleton />}

      <div className="shrink-0">
        <div className="my-4 flex items-start justify-between ">
          <div className="space-y-1">
            <h1 className="text-2xl mb-2 font-semibold tracking-tight text-foreground">Subjects</h1>
          </div>
          <div>
            {activeSubjects.length > 0 && <AddSubjectDialog habits={habits} empty={false} />}
          </div>
        </div>

        <div className="flex my-2 justify-between items-end gap-1.5 pt-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total today:</p>
          <span className="font-mono text-lg sm:text-2xl font-semibold leading-none tracking-tight text-foreground">
            {totalTrackedFormatted}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg border border-border mt-2">
        {activeSubjects.length === 0 && (
          <div>
            <CallToAction habits={habits} />
            {/* <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Skeleton className="h-10 w-10 mb-2 opacity-20">
              <CheckCircle className="h-10 w-10 mb-2 opacity-20" />
            </Skeleton>
            <p className="text-xl ">Add a Suject to track using the add subject !!!</p>
          </div> */}
          </div>
        )}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs sm:text-sm lg:text-base bg-dashboard-card">
            <tbody>
              {activeSubjects.map((subject: Subject) => (
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
