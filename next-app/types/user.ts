import type { Subject } from './subject';
import type { Habit } from './habit';
import type { ToDo } from './todo';
import type { DailyRating } from './rating';
import type { Space } from './space';

export interface User {
  id: number;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  deleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relations
  subjects?: Subject[];
  habits?: Habit[];
  toDo?: ToDo[];
  dailyRatings?: DailyRating[];
  spaces?: Space[];
}
