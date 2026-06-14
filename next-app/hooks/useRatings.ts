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
    mutationFn: async ({ rating, description }: { rating: number; description?: string }) => {
      const { data } = await api.post('/daily-rating', { rating, description });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyRatingStats'] });
    },
  });
};
