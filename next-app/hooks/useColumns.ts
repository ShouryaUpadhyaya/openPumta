import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Column {
  id: number;
  spaceId: number;
  title: string;
  order: number;
  width?: number | null;
  height?: number | null;
  isCollapsed: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useColumns = (spaceId: number | null) => {
  return useQuery<Column[]>({
    queryKey: ['columns', spaceId],
    queryFn: async () => {
      const { data } = await api.get(`/spaces/${spaceId}/columns`);
      return data.data;
    },
    enabled: !!spaceId,
  });
};

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ spaceId, title }: { spaceId: number; title: string }) => {
      const { data } = await api.post(`/spaces/${spaceId}/columns`, { title });
      return data.data as Column;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] });
    },
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      spaceId,
      id,
      ...updates
    }: Partial<Column> & { spaceId: number; id: number }) => {
      const { data } = await api.patch(`/spaces/${spaceId}/columns/${id}`, updates);
      return data.data as Column;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] });
    },
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ spaceId, id }: { spaceId: number; id: number }) => {
      await api.delete(`/spaces/${spaceId}/columns/${id}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] });
    },
  });
};

export const useReorderColumns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      spaceId,
      columns,
    }: {
      spaceId: number;
      columns: { id: number; order: number }[];
    }) => {
      await api.patch(`/spaces/${spaceId}/columns/reorder`, { columns });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] });
    },
  });
};
