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

export interface TextBoxLayout {
  desktop?: {
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    positionSource?: 'auto' | 'user';
  };
  tablet?: {
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    positionSource?: 'auto' | 'user';
  };
  mobile?: {
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    order?: number;
  };
}

export interface TextBox {
  id: number;
  spaceId: number;
  content: any[];
  layout: TextBoxLayout;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  space?: Space;
}
