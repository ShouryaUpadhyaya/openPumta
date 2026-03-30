import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PomodoroState {
  pomodoroTimer: number;
  BreakTimer: number;
  changeTimerPomodoro: ({ workSecs, breakSecs }: { workSecs: number; breakSecs: number }) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      pomodoroTimer: 3600,
      BreakTimer: 600,
      changeTimerPomodoro: ({ workSecs, breakSecs }: { workSecs: number; breakSecs: number }) => {
        set({ pomodoroTimer: workSecs, BreakTimer: breakSecs });
      },
    }),
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
