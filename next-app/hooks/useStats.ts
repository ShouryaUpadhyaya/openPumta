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

export const useDailyTimeline = (date?: string) => {
  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', date],
    queryFn: async () => {
      const { data } = await api.get(`/api/stats/timeline`, {
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
      const { data } = await api.get(`/api/stats/dashboard`);
      return data.data; // { focusTimeArray, habitCompletionRateByDate, summary }
    },
  });
};
