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
  textBoxes?: TextBox[];
}

export interface TextBox {
  id: number;
  spaceId: number;
  content: any[];
  layout: any;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  space?: Space;
}
