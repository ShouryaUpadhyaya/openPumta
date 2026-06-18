import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Habit } from './useHabits';

export interface SubjectLog {
  id: number;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  durationSecs?: number;
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

import { useAuthStore } from '@/store/useAuthStore';
import { getStartOfDay, getEndOfDay } from '@/lib/dateUtils';

export const useSubjects = () => {
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';

  const from = getStartOfDay(startOfDayOffset);
  const to = getEndOfDay(startOfDayOffset);

  return useQuery<Subject[]>({
    queryKey: ['subjects', startOfDayOffset],
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
  const { user } = useAuthStore();
  const startOfDayOffset = user?.startOfDay || '00:00';

  const startTimer = useMutation({
    mutationFn: async (subjectId: number) => {
      const { data } = await api.patch(`/subject/${subjectId}/startTimer`);
      return data.data; // ApiResponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['habitsWithLogs'] });
    },
  });

  const endTimer = useMutation({
    mutationFn: async (subjectId: number) => {
      const from = getStartOfDay(startOfDayOffset);
      const to = getEndOfDay(startOfDayOffset);
      const { data } = await api.patch(`/subject/${subjectId}/endTimer`, {
        from: from.toISOString(),
        to: to.toISOString(),
      });
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

export const useSubjectLogs = (subjectId: number) => {
  return useQuery<SubjectLog[]>({
    queryKey: ['subjectLogs', subjectId],
    queryFn: async () => {
      const { data } = await api.get(`/subject/${subjectId}/logs`);
      return data.data; // ApiResponse.data
    },
    enabled: !!subjectId,
  });
};

export const useUpdateSubjectLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectId,
      logId,
      startedAt,
      endedAt,
    }: {
      subjectId: number;
      logId: number;
      startedAt?: string;
      endedAt?: string | null;
    }) => {
      const { data } = await api.patch(`/subject/${subjectId}/logs/${logId}`, {
        startedAt,
        endedAt,
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjectLogs', variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subjectsWithLogs21'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useDeleteSubjectLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, logId }: { subjectId: number; logId: number }) => {
      const { data } = await api.delete(`/subject/${subjectId}/logs/${logId}`);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjectLogs', variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subjectsWithLogs21'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};
