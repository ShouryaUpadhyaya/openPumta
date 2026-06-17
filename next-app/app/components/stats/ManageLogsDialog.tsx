import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { Subject } from '../Home/Subjects/columns';
import SubjectLogsDialog from '../Home/Subjects/SubjectLogsDialog';

export default function ManageLogsDialog({ subjects }: { subjects: Subject[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleOpenLogs = () => {
    if (selectedSubject) {
      setIsLogsOpen(true);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 rounded-xl">
            <Settings2 className="h-4 w-4" />
            Manage Logs
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle>Manage Subject Logs</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <label className="text-sm font-medium text-muted-foreground">
              Select a subject to edit its logs:
            </label>
            <Select
              value={selectedSubjectId ? selectedSubjectId.toString() : undefined}
              onValueChange={(val) => setSelectedSubjectId(Number(val))}
            >
              <SelectTrigger className="w-full rounded-lg border-border">
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-lg">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject.color || '#f97316' }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="mt-2 w-full rounded-lg"
              disabled={!selectedSubject}
              onClick={handleOpenLogs}
            >
              View & Edit Logs
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedSubject && (
        <SubjectLogsDialog
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          subject={selectedSubject}
        />
      )}
    </>
  );
}
