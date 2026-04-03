import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TimelineItem {
  id: string;
  type: 'subject' | 'habit' | 'todo';
  name: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
}

export const useDailyTimeline = (userId: number | undefined, date?: string) => {
  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', userId, date],
    queryFn: async () => {
      const { data } = await api.get(`/api/stats/user/${userId}/timeline`, {
        params: { date },
      });
      return data.data;
    },
    enabled: !!userId,
  });
};

export const useDashboardStats = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/stats/user/${userId}/dashboard`);
      return data.data; // { focusTimeArray, habitCompletionRateByDate, summary }
    },
    enabled: !!userId,
  });
};
