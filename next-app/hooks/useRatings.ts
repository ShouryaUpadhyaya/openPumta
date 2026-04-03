import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDailyRatingStats = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['dailyRatingStats', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/daily-rating/${userId}/stats`);
      return data.data; // { today, yesterday, difference, weeklyAverage, twentyOneDayAverage, description }
    },
    enabled: !!userId,
  });
};

export const useSubmitDailyRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rating,
      description,
      userId,
    }: {
      rating: number;
      description?: string;
      userId: number;
    }) => {
      const { data } = await api.post('/api/daily-rating', { rating, description, userId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyRatingStats'] });
    },
  });
};
