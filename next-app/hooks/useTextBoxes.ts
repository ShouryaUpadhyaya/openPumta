import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { TextBox } from '@/types/space';

export const useTextBoxes = (spaceId: number) => {
  return useQuery<TextBox[]>({
    queryKey: ['textBoxes', spaceId],
    queryFn: async () => {
      const { data } = await api.get(`/spaces/${spaceId}/textboxes`);
      return data.data;
    },
    enabled: !!spaceId,
  });
};

export const useCreateTextBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      spaceId,
      layout,
      content,
    }: {
      spaceId: number;
      layout?: any;
      content?: any;
    }) => {
      const { data } = await api.post(`/spaces/${spaceId}/textboxes`, { layout, content });
      return data.data as TextBox;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.spaceId] }),
  });
};

export const useUpdateTextBoxLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spaceId, layout }: { id: number; spaceId: number; layout: any }) => {
      const { data } = await api.patch(`/spaces/${spaceId}/textboxes/${id}/layout`, { layout });
      return data.data as TextBox;
    },
    onMutate: async ({ id, spaceId, layout }) => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['textBoxes', spaceId] });

      // Snapshot the previous value
      const previousTextBoxes = queryClient.getQueryData(['textBoxes', spaceId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['textBoxes', spaceId], (old: TextBox[] | undefined) => {
        if (!old) return old;
        return old.map((box) => (box.id === id ? { ...box, layout } : box));
      });

      // Return a context with the previous data
      return { previousTextBoxes };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousTextBoxes) {
        queryClient.setQueryData(['textBoxes', variables.spaceId], context.previousTextBoxes);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.spaceId] });
    },
  });
};

export const useUpdateTextBoxContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spaceId, content }: { id: number; spaceId: number; content: any }) => {
      const { data } = await api.patch(`/spaces/${spaceId}/textboxes/${id}/content`, { content });
      return data.data as TextBox;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.spaceId] }),
  });
};

export const useDeleteTextBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spaceId }: { id: number; spaceId: number }) => {
      await api.delete(`/spaces/${spaceId}/textboxes/${id}`);
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.spaceId] }),
  });
};

export const useMoveTextBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      sourceSpaceId,
      targetSpaceId,
    }: {
      id: number;
      sourceSpaceId: number;
      targetSpaceId: number;
    }) => {
      const { data } = await api.patch(`/spaces/${sourceSpaceId}/textboxes/${id}/move`, {
        targetSpaceId,
      });
      return data.data as TextBox;
    },
    onSuccess: (_, variables) => {
      // Invalidate both source and target space caches
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.sourceSpaceId] });
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.targetSpaceId] });
    },
  });
};
