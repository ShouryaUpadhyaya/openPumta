import React from 'react';
import { Subject } from './columns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { IoIosPlay, IoIosPause } from 'react-icons/io';
import { ConvertSecsToTimer } from '@/lib/utils';
import { useDeleteSubject } from '@/hooks/useSubjects';
import { useTimerStore } from '@/store/useTimerStore';
import { useRouter } from 'next/navigation';
import SubjectLogsDialog from './SubjectLogsDialog';

interface SubjectRowProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function SubjectRow({ subject, onEdit }: SubjectRowProps) {
  const router = useRouter();
  const deleteSubjectMutation = useDeleteSubject();
  const { activeSubjectId, startWork, phase, running } = useTimerStore();
  const [isLogsDialogOpen, setIsLogsDialogOpen] = React.useState(false);

  const handlePlayClick = async () => {
    try {
      await startWork(subject.id);
      if (phase !== 'work') router.push('/pomodoro');
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubjectMutation.mutate(subject.id);
    }
  };

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

  const activeLog = subject.subjectLogs?.find((log) => !log.endedAt);
  const pastSecs = subject.subjectLogs?.reduce((acc, log) => acc + getSubjectLogSecs(log), 0) || 0;
  const totalSecs =
    pastSecs +
    (activeLog
      ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
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
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
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
        {`${pad(hours)}:${pad(minutes)}:${pad(seconds)} / ${
          goal > 0 ? (goal / 3600).toFixed(1).replace(/\.0$/, '') + 'h' : '0h'
        }`}
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
              onClick={handlePlayClick}
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
              <DropdownMenuItem onClick={() => onEdit(subject)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsLogsDialogOpen(true)}>
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
      <SubjectLogsDialog
        isOpen={isLogsDialogOpen}
        onClose={() => setIsLogsDialogOpen(false)}
        subject={subject}
      />
    </tr>
  );
}
