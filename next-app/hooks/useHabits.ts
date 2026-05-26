import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  userId: number;
  subjectId?: number;
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
    mutationFn: async (habitId: number) => {
      const { data } = await api.patch(`/habits/${habitId}/toggle`);
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
