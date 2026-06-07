import type { User } from './user';

export interface Space {
  id: number;
  userId: number;
  name: string;
  icon: string | null;
  order: number;
  isArchived: boolean;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  user?: User;
  columns?: Column[];
}

export interface Column {
  id: number;
  spaceId: number;
  title: string;
  order: number;
  width: number | null;
  height: number | null;
  isCollapsed: boolean;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  space?: Space;
  blocks?: Block[];
}

export enum BlockType {
  HEADING = 'HEADING',
  PARAGRAPH = 'PARAGRAPH',
  TODO = 'TODO',
  DIVIDER = 'DIVIDER',
}

export interface Block {
  id: number;
  columnId: number;
  type: BlockType;
  content: string;
  order: number;
  deleted: boolean;
  isCompleted: boolean;
  scheduledAt: Date | string;
  dueAt: Date | string | null;
  reminderAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  column?: Column;
}
