import type { User } from './user';
import type { Habit } from './habit';

export interface Subject {
  id: number;
  name: string;
  goalWorkSecs: number;
  color: string;
  userId: number;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  user?: User;
  habits?: Habit[];
  subjectLogs?: SubjectLog[];
}

export interface SubjectLog {
  id: number;
  startedAt: Date | string;
  endedAt: Date | string | null;
  subjectId: number;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  subject?: Subject;
}
