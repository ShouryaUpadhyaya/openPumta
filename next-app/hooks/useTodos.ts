import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ToDoLog {
  id: number;
  startedAt: string;
  endedAt?: string;
  toDoId: number;
}

export interface ToDo {
  id: number;
  title: string;
  discription?: string;
  isCompleted: boolean;
  userId: number;
  toDoLog?: ToDoLog[];
}

export const useTodos = (userId: number | undefined) => {
  return useQuery<ToDo[]>({
    queryKey: ['todos', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/todo/user/${userId}`);
      return data.data; // ApiResponse.data
    },
    enabled: !!userId,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTodo: { title: string; userId: number; description?: string }) => {
      const { data } = await api.post('/api/todo/create', newTodo);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ToDo> & { id: number }) => {
      const { data } = await api.patch(`/api/todo/${id}`, updates);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/api/todo/${id}`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useTodoTimer = () => {
  const queryClient = useQueryClient();

  const startTimer = useMutation({
    mutationFn: async (toDoId: number) => {
      const { data } = await api.post(`/api/todo/${toDoId}/start`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const endTimer = useMutation({
    mutationFn: async (toDoId: number) => {
      const { data } = await api.post(`/api/todo/${toDoId}/end`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return { startTimer, endTimer };
};
