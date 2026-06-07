import type { User } from './user';
import type { Subject } from './subject';

export enum Difficulty {
  HIGH = 'HIGH',
  MID = 'MID',
  LOW = 'LOW',
}

export interface Habit {
  id: number;
  name: string;
  userId: number;
  subjectId: number | null;
  description: string;
  difficulty: Difficulty;
  autoCompleteTime: number | null;
  badDayPlan: string | null;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  user?: User;
  subject?: Subject | null;
  log?: HabitTimeLog[];
}

export interface HabitTimeLog {
  id: number;
  startedAt: Date | string;
  endedAt: Date | string | null;
  habitId: number;
  isBadDayPlan: boolean;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  habit?: Habit;
}
