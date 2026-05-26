import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type BlockType = 'HEADING' | 'PARAGRAPH' | 'TODO' | 'DIVIDER';

export interface Block {
  id: number;
  columnId: number;
  type: BlockType;
  content: string;
  order: number;
  deleted: boolean;
  isCompleted: boolean;
  scheduledAt?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'today' | 'last1w' | 'overdue' | 'dateRange';

export const useBlocks = (
  columnId: number | null,
  filter: FilterType = 'all',
  dateRange?: { from: string; to: string },
) => {
  return useQuery<Block[]>({
    queryKey: ['blocks', columnId, filter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('filter', filter);
      if (filter === 'dateRange' && dateRange) {
        params.set('from', dateRange.from);
        params.set('to', dateRange.to);
      }
      const { data } = await api.get(`/columns/${columnId}/blocks?${params}`);
      return data.data;
    },
    enabled: !!columnId,
  });
};

export const useCreateBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      columnId,
      ...payload
    }: {
      columnId: number;
      type: BlockType;
      content?: string;
      scheduledAt?: string | null;
      dueAt?: string | null;
      reminderAt?: string | null;
    }) => {
      const { data } = await api.post(`/columns/${columnId}/blocks`, payload);
      return data.data as Block;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.columnId] });
    },
  });
};

export const useUpdateBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      columnId,
      id,
      ...updates
    }: Partial<Block> & { columnId: number; id: number }) => {
      const { data } = await api.patch(`/columns/${columnId}/blocks/${id}`, updates);
      return data.data as Block;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.columnId] });
    },
  });
};

export const useDeleteBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ columnId, id }: { columnId: number; id: number }) => {
      await api.delete(`/columns/${columnId}/blocks/${id}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.columnId] });
    },
  });
};

export const useReorderBlocks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      columnId,
      blocks,
    }: {
      columnId: number;
      blocks: { id: number; order: number }[];
    }) => {
      await api.patch(`/columns/${columnId}/blocks/reorder`, { blocks });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.columnId] });
    },
  });
};

export const useMoveBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      sourceColumnId,
      targetColumnId,
      order,
    }: {
      id: number;
      sourceColumnId: number;
      targetColumnId: number;
      order: number;
    }) => {
      const { data } = await api.post(`/blocks/${id}/move`, { targetColumnId, order });
      return data.data as Block;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.sourceColumnId] });
      queryClient.invalidateQueries({ queryKey: ['blocks', variables.targetColumnId] });
    },
  });
};
