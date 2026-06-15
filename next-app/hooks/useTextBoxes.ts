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
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['textBoxes', variables.spaceId] }),
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
