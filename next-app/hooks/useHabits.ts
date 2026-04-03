import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  userId: number;
  subjectId?: number;
}

export const useHabits = (userId: number) => {
  return useQuery<Habit[]>({
    queryKey: ['habits', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/habits/user/${userId}`);
      return data.data; // ApiResponse.data
    },
    enabled: !!userId,
  });
};

export const useHabitsWithLogs = (userId: number | undefined, fromDate: string) => {
  return useQuery({
    queryKey: ['habitsWithLogs', userId, fromDate],
    queryFn: async () => {
      const { data } = await api.get(`/api/habits/user/${userId}/logs`, {
        params: { from: fromDate },
      });
      return data.data;
    },
    enabled: !!userId,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHabit: Partial<Habit>) => {
      const { data } = await api.post('/api/habits', newHabit);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};

export const useHabitDashboard = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['habitDashboard', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/habits/user/${userId}/dashboard`);
      return data.data; // { habits, todayStats, activeLog }
    },
    enabled: !!userId,
  });
};

export const useToggleHabitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const { data } = await api.patch(`/api/habits/${habitId}/toggle`);
      return data.data; // { completed: boolean }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const { data } = await api.delete(`/api/habits/${habitId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};
