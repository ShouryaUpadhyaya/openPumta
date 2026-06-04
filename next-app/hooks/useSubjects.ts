import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Habit } from './useHabits';

export interface SubjectLog {
  id: number;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  subjectId: number;
}

export interface Subject {
  id: number;
  name: string;
  userId: number;
  subjectLogs?: SubjectLog[];
  workSecs?: number;
  goalWorkSecs?: number;
  color?: string;
  habits?: Habit[];
}

export const useSubjects = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 1);

  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get(
        `/subject/stats?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      return data.data; // ApiResponse.data
    },
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSubject: {
      name: string;
      goalWorkSecs?: number;
      color?: string;
      habits?: number[];
    }) => {
      const { data } = await api.post('/subject', newSubject);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      goalWorkSecs,
      color,
      habits,
    }: {
      id: number;
      name?: string;
      goalWorkSecs?: number;
      color: string;
      habits?: number[];
    }) => {
      const { data } = await api.patch(`/subject/updateSubjectName/${id}`, {
        name,
        goalWorkSecs,
        color,
        habits,
      });
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/subject/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useSubjectTimer = () => {
  const queryClient = useQueryClient();

  const startTimer = useMutation({
    mutationFn: async (subjectId: number) => {
      const { data } = await api.patch(`/subject/${subjectId}/startTimer`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const endTimer = useMutation({
    mutationFn: async (subjectId: number) => {
      const { data } = await api.patch(`/subject/${subjectId}/endTimer`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['habitsWithLogs'] });
    },
  });

  return { startTimer, endTimer };
};
