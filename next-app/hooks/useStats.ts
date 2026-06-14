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

export const useDailyTimeline = (date?: string) => {
  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', date],
    queryFn: async () => {
      const { data } = await api.get(`/stats/timeline`, {
        params: { date },
      });
      return data.data;
    },
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get(`/stats/dashboard`);
      return data.data; // { focusTimeArray, habitCompletionRateByDate, summary }
    },
  });
};

// ─── Extended Stats Hooks for Overview Page ──────────────────────────────────

export const useSubjectsWithLogs = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 21);

  return useQuery({
    queryKey: ['subjectsWithLogs21'],
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
  const from = new Date();
  from.setDate(from.getDate() - 21);

  return useQuery({
    queryKey: ['habitsWithLogs', getLocalIsoDate(from)],
    queryFn: async () => {
      const { data } = await api.get(`/habits/logs`, {
        params: { from: from.toISOString() },
      });
      return data.data;
    },
  });
};
