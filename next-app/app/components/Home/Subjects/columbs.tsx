'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { IoIosPlay, IoIosPause } from 'react-icons/io';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ConvertSecsToTimer } from '@/lib/utils';

export type SubjectLog = {
  id: number;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  subjectId: number;
};

export type Subject = {
  id: number;
  name: string;
  userId: number;
  subjectLogs?: SubjectLog[];
  // UI fields
  goalWorkSecs?: number;
  createdAt?: string;
};

export const columns = ({
  toggleTimer,
  runningSubjectId,
  deleteSubject,
  handleEdit,
}: {
  toggleTimer: (subjectId: number) => void;
  runningSubjectId: number | null;
  deleteSubject: (subjectId: number) => void;
  handleEdit: (subject: Subject) => void;
}): ColumnDef<Subject>[] => [
  {
    id: 'actions',
    cell: ({ row }) => {
      const subject = row.original;
      const isRunning = runningSubjectId === subject.id;
      return (
        <div className="flex items-center">
          <Button onClick={() => toggleTimer(subject.id)} variant="ghost">
            {isRunning ? <IoIosPause /> : <IoIosPlay />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(subject)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteSubject(subject.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Subject',
  },
  {
    header: 'Status',
    cell: ({ row }) => {
      const subject = row.original;
      const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
      const pastSecs = subject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
      const totalSecs =
        pastSecs +
        (activeLog
          ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
          : 0);

      const goal = subject.goalWorkSecs || 0;

      if (totalSecs === 0) return 'not Started';
      if (goal > 0) {
        const percent = (totalSecs / goal) * 100;
        if (percent >= 100) return 'excelent';
        if (percent >= 50) return 'good progress';
      }
      return 'started';
    },
  },
  {
    header: 'Progress',
    cell: ({ row }) => {
      const subject = row.original;
      const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
      const pastSecs = subject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
      const totalSecs =
        pastSecs +
        (activeLog
          ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
          : 0);

      const goal = subject.goalWorkSecs || 0;
      const percent = goal > 0 ? Math.round((totalSecs / goal) * 100) : 0;
      return `${percent}%`;
    },
  },
  {
    accessorKey: 'workSecs',
    header: 'Worked (hrs)',
    cell: ({ row }) => {
      const subject = row.original;
      const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
      const pastSecs = subject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;
      const totalSecs =
        pastSecs +
        (activeLog
          ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
          : 0);

      const { hours, minutes, seconds } = ConvertSecsToTimer({ workSecs: totalSecs });
      const pad = (n: number) => String(n).padStart(2, '0');

      const goal = subject.goalWorkSecs || 0;
      const percent = goal > 0 ? Math.round((totalSecs / goal) * 100) : 0;
      const hue = Math.min(120, (percent / 100) * 120);

      return (
        <span style={{ color: `hsl(${hue}, 80%, 45%)` }}>
          {`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
        </span>
      );
    },
  },
  {
    header: 'Goal (hrs)',
    cell: ({ row }) => {
      const subject = row.original;
      return ((subject.goalWorkSecs || 0) / 3600).toFixed(1);
    },
  },
  {
    header: 'Date',
    cell: ({ row }) => {
      const subject = row.original;
      return subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : 'N/A';
    },
  },
];
