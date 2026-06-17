import React, { useState } from 'react';
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

interface SubjectLogsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function SubjectLogsDialog({ isOpen, onClose, subject }: SubjectLogsDialogProps) {
  const { data: logs, isLoading } = useSubjectLogs(subject.id);
  const updateLog = useUpdateSubjectLog();
  const deleteLog = useDeleteSubjectLog();

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editStart, setEditStart] = useState<string>('');
  const [editEnd, setEditEnd] = useState<string>('');

  const handleEditClick = (log: SubjectLog) => {
    setEditingLogId(log.id);
    // Format for datetime-local: YYYY-MM-DDThh:mm
    const startStr = new Date(log.startedAt).toISOString().slice(0, 16);
    setEditStart(startStr);
    const endStr = log.endedAt ? new Date(log.endedAt).toISOString().slice(0, 16) : '';
    setEditEnd(endStr);
  };

  const handleSaveEdit = async (logId: number) => {
    try {
      const startedAtDate = new Date(editStart);
      let endedAtDate: Date | null = null;

      if (editEnd) {
        endedAtDate = new Date(editEnd);
        if (endedAtDate < startedAtDate) {
          toast.error('End time cannot be before start time');
          return;
        }
      }

      await updateLog.mutateAsync({
        subjectId: subject.id,
        logId,
        startedAt: startedAtDate.toISOString(),
        endedAt: endedAtDate ? endedAtDate.toISOString() : null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-background border-border">
        <DialogHeader>
          <DialogTitle>
            Manage Logs: <span style={{ color: subject.color }}>{subject.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No logs found for this subject.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const isEditing = editingLogId === log.id;

                const startLabel = new Date(log.startedAt).toLocaleString([], {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });
                const endLabel = log.endedAt
                  ? new Date(log.endedAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'Ongoing';

                const durationSecs = log.endedAt
                  ? Math.floor(
                      (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000,
                    )
                  : Math.floor((new Date().getTime() - new Date(log.startedAt).getTime()) / 1000);
                const { hours, minutes, seconds } = ConvertSecsToTimer({ workSecs: durationSecs });
                const durationLabel = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

                return (
                  <div
                    key={log.id}
                    className="p-3 border border-border rounded-lg bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">Start Time</label>
                          <input
                            type="datetime-local"
                            className="bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">End Time</label>
                          <input
                            type="datetime-local"
                            className="bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editEnd}
                            onChange={(e) => setEditEnd(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">{durationLabel}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {startLabel} — {endLabel}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(log.id)}
                            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingLogId(null)}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(log)}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(log.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
