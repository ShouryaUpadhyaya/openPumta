import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useSubjectLogs,
  useUpdateSubjectLog,
  useDeleteSubjectLog,
  SubjectLog,
} from '@/hooks/useSubjects';
import { Subject } from './columns';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit2, Check, X } from 'lucide-react';
import { ConvertSecsToTimer } from '@/lib/utils';
import { toast } from 'sonner';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface SubjectLogsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

const pad = (n: number) => String(n).padStart(2, '0');

const formatDuration = (totalSecs: number) => {
  const { hours, minutes, seconds } = ConvertSecsToTimer({ workSecs: totalSecs });
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`;
  return `${seconds}s`;
};

const formatTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Ongoing';
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const getBlockHeight = (durationSecs: number) => {
  const minHeight = 40;
  const maxHeight = 320;
  const pxPerSec = 80 / 3600; // 80px per hour
  const height = Math.floor(durationSecs * pxPerSec);
  if (height < minHeight) return minHeight;
  if (height > maxHeight) return maxHeight;
  return height;
};

export default function SubjectLogsDialog({ isOpen, onClose, subject }: SubjectLogsDialogProps) {
  const { data: logs, isLoading } = useSubjectLogs(subject.id);
  const updateLog = useUpdateSubjectLog();
  const deleteLog = useDeleteSubjectLog();

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editStart, setEditStart] = useState<Date | undefined>(undefined);
  const [editEnd, setEditEnd] = useState<Date | undefined>(undefined);

  const handleEditClick = (log: SubjectLog) => {
    setEditingLogId(log.id);
    setEditStart(new Date(log.startedAt));
    setEditEnd(log.endedAt ? new Date(log.endedAt) : undefined);
  };

  const handleSaveEdit = async (logId: number) => {
    if (!editStart) {
      toast.error('Start time is required');
      return;
    }
    try {
      if (editEnd && editEnd < editStart) {
        toast.error('End time cannot be before start time');
        return;
      }
      await updateLog.mutateAsync({
        subjectId: subject.id,
        logId,
        startedAt: editStart.toISOString(),
        endedAt: editEnd ? editEnd.toISOString() : null,
      });
      toast.success('Log updated successfully');
      setEditingLogId(null);
    } catch {
      toast.error('Failed to update log');
    }
  };

  const handleDelete = async (logId: number) => {
    if (confirm('Are you sure you want to delete this log?')) {
      try {
        await deleteLog.mutateAsync({ subjectId: subject.id, logId });
        toast.success('Log deleted successfully');
      } catch {
        toast.error('Failed to delete log');
      }
    }
  };

  const groupedLogs = useMemo(() => {
    if (!logs) return [];
    const groups = new Map<string, SubjectLog[]>();

    logs.forEach((log) => {
      const dateObj = new Date(log.startedAt);
      const dayKey = dateObj.toLocaleDateString();
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(log);
    });

    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    return Array.from(groups.entries())
      .map(([dayKey, dayLogs]) => {
        dayLogs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        const dateObj = new Date(dayLogs[0].startedAt);

        let label = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        if (dateObj.toDateString() === todayStr) label = 'Today';
        else if (dateObj.toDateString() === yesterdayStr) label = 'Yesterday';

        const totalSecs = dayLogs.reduce((acc, log) => {
          const start = new Date(log.startedAt).getTime();
          const end = log.endedAt ? new Date(log.endedAt).getTime() : new Date().getTime();
          return acc + Math.floor((end - start) / 1000);
        }, 0);

        return { dayKey, dateObj, label, logs: dayLogs, totalSecs };
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [logs]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-background border-border overflow-hidden">
        <DialogHeader className="shrink-0 pb-2 border-b">
          <DialogTitle className="text-xl">
            Manage Logs: <span style={{ color: subject.color }}>{subject.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-8 px-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No logs found for this subject.
            </p>
          ) : (
            <div className="flex flex-col gap-2 relative">
              {groupedLogs.map((group) => (
                <div key={group.dayKey} className="flex flex-col w-full">
                  {/* Day Divider */}
                  <div className="flex items-center gap-3 my-5 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                    <div className="h-px flex-1 bg-border/60" />
                    <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                      {group.label} ·{' '}
                      <span className="text-foreground/70">{formatDuration(group.totalSecs)}</span>
                    </span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  {/* Sessions Timeline */}
                  <div className="flex flex-col">
                    {group.logs.map((log, index) => {
                      const isEditing = editingLogId === log.id;
                      const durationSecs = log.endedAt
                        ? Math.floor(
                            (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) /
                              1000,
                          )
                        : Math.floor(
                            (new Date().getTime() - new Date(log.startedAt).getTime()) / 1000,
                          );

                      const height = getBlockHeight(durationSecs);
                      const isLast = index === group.logs.length - 1;

                      return (
                        <div key={log.id} className="relative flex w-full group/log">
                          {/* Left Axis */}
                          <div className="flex flex-col items-center w-20 shrink-0 relative">
                            <span className="text-[10px] font-semibold text-muted-foreground mb-1 mt-1">
                              {formatTime(log.startedAt)}
                            </span>
                            <div
                              className="w-2.5 h-2.5 rounded-full border-2 border-background ring-2 z-0 transition-transform group-hover/log:scale-125"
                              style={{
                                backgroundColor: subject.color || 'var(--primary)',
                                boxShadow: `0 0 0 2px ${subject.color || 'var(--primary)'}40`,
                              }}
                            />
                            {!isLast && <div className="w-px flex-1 bg-border/60 mt-1 mb-2" />}
                          </div>

                          {/* Content Block */}
                          <div className="flex-1 pb-4 pl-2 min-w-0">
                            {isEditing ? (
                              <div className="p-4 border border-border/60 rounded-xl bg-card shadow-sm flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 animate-in fade-in zoom-in-95">
                                <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Start Time
                                    </label>
                                    <DateTimePicker value={editStart} onChange={setEditStart} />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      End Time
                                    </label>
                                    <DateTimePicker value={editEnd} onChange={setEditEnd} />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSaveEdit(log.id)}
                                    className="flex-1 lg:flex-none h-9 gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-500/10 border-green-500/20"
                                  >
                                    <Check className="h-4 w-4" /> Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingLogId(null)}
                                    className="h-9 w-9 p-0 text-muted-foreground"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="rounded-r-xl rounded-bl-sm border-l-4 p-3 flex flex-col relative transition-all w-full max-w-sm group-hover/log:brightness-95 hover:!brightness-90 cursor-default overflow-hidden"
                                style={{
                                  height: `${height}px`,
                                  backgroundColor: subject.color
                                    ? `${subject.color}15`
                                    : 'rgba(249, 115, 22, 0.1)',
                                  borderLeftColor: subject.color || '#f97316',
                                }}
                              >
                                {/* Persistent Data */}
                                <div
                                  className="flex items-center gap-2 font-bold tracking-tight"
                                  style={{ color: subject.color || '#f97316' }}
                                >
                                  <span className="text-sm">{formatDuration(durationSecs)}</span>
                                  {!log.endedAt && (
                                    <span
                                      className="flex h-2 w-2 rounded-full bg-destructive animate-pulse"
                                      title="Ongoing"
                                    />
                                  )}
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute right-2 top-2 opacity-0 group-hover/log:opacity-100 transition-opacity flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-lg border shadow-sm z-10">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleEditClick(log)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(log.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>

                                {/* Hover Metadata */}
                                {height > 60 && (
                                  <div className="mt-auto opacity-0 group-hover/log:opacity-100 transition-opacity text-xs font-medium text-muted-foreground flex items-center gap-2">
                                    <span>End: {formatTime(log.endedAt)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
