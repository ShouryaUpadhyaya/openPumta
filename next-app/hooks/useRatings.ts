import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DailyRatingStatsResponse {
  today: number | null;
  description: string;
  yesterday: number | null;
  difference: number | null;
  weeklyAverage: number;
  twentyOneDayAverage: number;
  history: {
    date: string;
    rating: number;
    description: string;
    content: any;
  }[];
}

export const useDailyRatingStats = () => {
  return useQuery<DailyRatingStatsResponse>({
    queryKey: ['dailyRatingStats'],
    queryFn: async () => {
      const { data } = await api.get(`/daily-rating/stats`);
      return data.data; // { today, yesterday, difference, weeklyAverage, twentyOneDayAverage, description, history }
    },
  });
};

export const useSubmitDailyRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, description, date, content }: { rating?: number; description?: string; date?: string; content?: any }) => {
      const { data } = await api.post('/daily-rating', { rating, description, date, content });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRatingStats'] });
      if (variables.date) {
        queryClient.invalidateQueries({ queryKey: ['dailyRating', variables.date] });
      }
    },
  });
};

export const useDailyRatingByDate = (date: string) => {
  return useQuery({
    queryKey: ['dailyRating', date],
    queryFn: async () => {
      const { data } = await api.get(`/daily-rating/date`, { params: { date } });
      return data.data; // { rating: { ... }, template: [...] }
    },
    enabled: !!date,
  });
};

export const useUpdateReviewTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ template }: { template: any }) => {
      const { data } = await api.patch('/daily-rating/template', { template });
      return data.data;
    },
    onSuccess: () => {
      // Invalidate the current date's rating query so template changes reflect immediately on blank days
      queryClient.invalidateQueries({ queryKey: ['dailyRating'] });
    },
  });
};
