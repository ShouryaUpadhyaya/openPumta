import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Space {
  id: number;
  userId: number;
  name: string;
  icon?: string | null;
  order: number;
  isArchived: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSpaces = () => {
  return useQuery<Space[]>({
    queryKey: ['spaces'],
    queryFn: async () => {
      const { data } = await api.get('/spaces');
      return data.data;
    },
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; icon?: string }) => {
      const { data } = await api.post('/spaces', payload);
      return data.data as Space;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Space> & { id: number }) => {
      const { data } = await api.patch(`/spaces/${id}`, updates);
      return data.data as Space;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/spaces/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};

export const useReorderSpaces = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (spaces: { id: number; order: number }[]) => {
      await api.patch('/spaces/reorder', { spaces });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};
