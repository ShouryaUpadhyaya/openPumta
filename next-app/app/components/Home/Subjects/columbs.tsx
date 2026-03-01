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

export type Subject = {
  id: string;
  name: string;
  workSecs: number;
  goalWorkSecs: number;
  status: 'not Started' | 'good progress' | 'excelent' | 'failed';
  date: string;
  additionInfo?: string;
};

export const columns = ({
  toggleTimer,
  runningSubjectId,
  deleteSubject,
  handleEdit,
}: {
  toggleTimer: (subjectId: string) => void;
  runningSubjectId: string | null;
  deleteSubject: (subjectId: string) => void;
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
    accessorKey: 'status',
    header: 'Status',
  },
  {
    header: 'Progress',
    cell: ({ row }) => {
      const { workSecs, goalWorkSecs } = row.original;
      const percent = goalWorkSecs > 0 ? Math.round((workSecs / goalWorkSecs) * 100) : 0;
      return `${percent}%`;
    },
  },
  {
    accessorKey: 'workSecs',
    header: 'Worked (hrs)',
    cell: ({ row }) => {
      const { workSecs, goalWorkSecs } = row.original;

      const hours = Math.floor(workSecs / 3600);
      const minutes = Math.floor((workSecs % 3600) / 60);
      const seconds = Math.floor(workSecs % 60);

      const percent = goalWorkSecs > 0 ? Math.round((workSecs / goalWorkSecs) * 100) : 0;

      const hue = Math.min(120, (percent / 100) * 120);
      // 0   = red
      // 60  = yellow
      // 120 = green

      const style = {
        color: `hsl(${hue}, 80%, 45%)`,
      };

      const pad = (n: number) => String(n).padStart(2, '0');

      return <span style={style}>{`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}</span>;
    },
  },
  {
    accessorKey: 'goalWorkSecs',
    header: 'Goal (hrs)',
    cell: ({ row }) => {
      const { goalWorkSecs } = row.original;
      return (goalWorkSecs / 3600).toFixed(1);
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];
