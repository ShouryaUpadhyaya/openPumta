import type { User } from './user';

export interface DailyRating {
  id: number;
  userId: number;
  rating: number;
  description: string | null;
  date: Date | string;

  user?: User;
}
