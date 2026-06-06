import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type HabitDifficulty = 'HIGH' | 'MID' | 'LOW';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  difficulty?: HabitDifficulty;
  autoCompleteTime?: number | null;
  userId: number;
  subjectId?: number | null;
  badDayPlan?: string | null;
}

export const useHabits = () => {
  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data } = await api.get(`/habits`);
      return data.data; // ApiResponse.data
    },
  });
};

export const useHabitsWithLogs = (fromDate: string) => {
  return useQuery({
    queryKey: ['habitsWithLogs', fromDate],
    queryFn: async () => {
      const { data } = await api.get(`/habits/logs`, {
        params: { from: fromDate },
      });
      return data.data;
    },
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHabit: Partial<Habit>) => {
      const { data } = await api.post('/habits', newHabit);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};

export const useHabitDashboard = () => {
  return useQuery({
    queryKey: ['habitDashboard'],
    queryFn: async () => {
      const { data } = await api.get(`/habits/dashboard`);
      return data.data; // { habits, todayStats, activeLog }
    },
  });
};

export const useToggleHabitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, isBadDayPlan }: { habitId: number; isBadDayPlan?: boolean }) => {
      const { data } = await api.patch(`/habits/${habitId}/toggle`, { isBadDayPlan });
      return data.data; // { completed: boolean }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitsWithLogs'] }); // keep heatmap in sync as this is needed - krish
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const { data } = await api.delete(`/habits/${habitId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      difficulty,
      subjectId,
      autoCompleteTime,
      badDayPlan,
    }: {
      id: number;
      name?: string;
      description?: string;
      difficulty?: HabitDifficulty;
      subjectId?: number | null;
      autoCompleteTime?: number | null;
      badDayPlan?: string | null;
    }) => {
      const { data } = await api.patch(`/habits/${id}`, {
        name,
        description,
        difficulty,
        subjectId,
        autoCompleteTime,
        badDayPlan,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['habitsWithLogs'] });
    },
  });
};
