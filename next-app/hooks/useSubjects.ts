import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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
}

export const useSubjects = (userId: number | undefined) => {
  return useQuery<Subject[]>({
    queryKey: ['subjects', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/subject/${userId}/stats`);
      return data.data; // ApiResponse.data
    },
    enabled: !!userId,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSubject: { name: string; userId: number; goalWorkSecs?: number }) => {
      const { data } = await api.post('/api/subject', newSubject);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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
    }: {
      id: number;
      name?: string;
      goalWorkSecs?: number;
    }) => {
      const { data } = await api.patch(`/api/subject/updateSubjectName/${id}`, {
        name,
        goalWorkSecs,
      });
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/api/subject/${id}`);
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
      const { data } = await api.patch(`/api/subject/${subjectId}/startTimer`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const endTimer = useMutation({
    mutationFn: async (subjectId: number) => {
      const { data } = await api.patch(`/api/subject/${subjectId}/endTimer`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return { startTimer, endTimer };
};
