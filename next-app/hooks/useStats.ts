import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getLocalIsoDate } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  type: 'subject' | 'habit' | 'todo';
  name: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
}

import { useAuthStore } from '@/store/useAuthStore';
import { getStartOfDay, getEndOfDay } from '@/lib/dateUtils';

export const useDailyTimeline = (date?: string) => {
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';

  const baseDate = date ? new Date(date) : new Date();
  const from = getStartOfDay(startOfDayOffset, baseDate);
  const to = getEndOfDay(startOfDayOffset, baseDate);

  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', date, startOfDayOffset],
    queryFn: async () => {
      const { data } = await api.get(`/stats/timeline`, {
        params: { date, from: from.toISOString(), to: to.toISOString() },
      });
      return data.data;
    },
  });
};

export const useDashboardStats = () => {
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';
  const from = getStartOfDay(startOfDayOffset);
  const to = getEndOfDay(startOfDayOffset);

  return useQuery({
    queryKey: ['dashboardStats', startOfDayOffset],
    queryFn: async () => {
      const { data } = await api.get(`/stats/dashboard`, {
        params: { from: from.toISOString(), to: to.toISOString() },
      });
      return data.data; // { focusTimeArray, habitCompletionRateByDate, summary }
    },
  });
};

// ─── Extended Stats Hooks for Overview Page ──────────────────────────────────

export const useSubjectsWithLogs = () => {
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';

  const to = getEndOfDay(startOfDayOffset);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 21);
  const from = getStartOfDay(startOfDayOffset, fromDate);

  return useQuery({
    queryKey: ['subjectsWithLogs21', startOfDayOffset],
    queryFn: async () => {
      const { data } = await api.get(
        `/subject/stats?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      return data.data;
    },
  });
};

export const useDailyRatings21 = () => {
  return useQuery({
    queryKey: ['dailyRatingStats'],
    queryFn: async () => {
      const { data } = await api.get(`/daily-rating/stats`);
      return data.data;
    },
  });
};

export const useTodosAll = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data } = await api.get(`/todo`);
      return data.data;
    },
  });
};

export const useHabitsWithLogs21 = () => {
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 21);
  const from = getStartOfDay(startOfDayOffset, fromDate);

  return useQuery({
    queryKey: ['habitsWithLogs', getLocalIsoDate(from), startOfDayOffset],
    queryFn: async () => {
      const { data } = await api.get(`/habits/logs`, {
        params: { from: from.toISOString() },
      });
      return data.data;
    },
  });
};
