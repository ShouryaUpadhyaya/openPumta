import { HabitDifficulty } from '@/hooks/useHabits';

export const DIFFICULTY_OPTIONS: { label: string; value: HabitDifficulty; color: string }[] = [
  { label: 'Easy', value: 'LOW', color: 'text-emerald-500' },
  { label: 'Medium', value: 'MID', color: 'text-amber-500' },
  { label: 'Hard', value: 'HIGH', color: 'text-rose-500' },
];
