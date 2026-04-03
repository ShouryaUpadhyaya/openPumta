import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SubjectTimerState {
  timerRunningSubjectId: number | null;
  activeSeconds: number;
  startLocalTimer: (id: number) => void;
  stopLocalTimer: () => void;
  tick: () => void;
}

export const useSubjectTimerStore = create<SubjectTimerState>()(
  persist(
    (set) => ({
      timerRunningSubjectId: null,
      activeSeconds: 0,
      startLocalTimer: (id: number) => set({ timerRunningSubjectId: id, activeSeconds: 0 }),
      stopLocalTimer: () => set({ timerRunningSubjectId: null, activeSeconds: 0 }),
      tick: () => set((state) => ({ activeSeconds: state.activeSeconds + 1 })),
    }),
    {
      name: 'subject-timer-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
