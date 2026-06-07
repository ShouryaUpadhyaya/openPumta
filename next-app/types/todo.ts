import type { User } from './user';

export enum ToDoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export interface ToDo {
  id: number;
  title: string;
  description: string;
  status: ToDoStatus;
  priority: number;
  dueDate: Date | string | null;
  completedAt: Date | string | null;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: number;

  // Relations
  user?: User;
  toDoLog?: ToDoLog[];
}

export interface ToDoLog {
  id: number;
  startedAt: Date | string;
  endedAt: Date | string | null;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  toDoId: number;

  // Relations
  toDo?: ToDo;
}
