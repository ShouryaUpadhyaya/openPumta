import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDailyRatingStats = () => {
  return useQuery({
    queryKey: ['dailyRatingStats'],
    queryFn: async () => {
      const { data } = await api.get(`/api/daily-rating/stats`);
      return data.data; // { today, yesterday, difference, weeklyAverage, twentyOneDayAverage, description }
    },
  });
};

export const useSubmitDailyRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, description }: { rating: number; description?: string }) => {
      const { data } = await api.post('/api/daily-rating', { rating, description });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyRatingStats'] });
    },
  });
};
