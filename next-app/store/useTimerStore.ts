'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { invalidateSubjectTimerQueries } from '@/lib/queryClient';

export type TimerPhase = 'work' | 'shortBreak' | 'longBreak' | 'idle';
export type TimerMode = 'pomodoro' | 'stopwatch';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  notificationsEnabled: boolean;
}

interface TimerState {
  // Core State
  phase: TimerPhase;
  running: boolean;
  mode: TimerMode;
  activeSubjectId: number | null;
  phaseStartedAt: number | null;
  durationMs: number;
  completedPomodoros: number;

  // Settings & UI
  settings: TimerSettings;
  showProgressBar: boolean;
  workColor: string;
  shortBreakColor: string;
  longBreakColor: string;

  // Actions
  setMode: (mode: TimerMode) => void;
  setShowProgressBar: (show: boolean) => void;
  setSettings: (settings: Partial<TimerSettings>) => void;
  setColors: (work: string, short: string, long: string) => void;

  startWork: (subjectId: number) => Promise<void>;
  endWork: (manual?: boolean) => Promise<void>;
  completeBreak: () => void;
  skipBreak: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      running: false,
      mode: 'pomodoro',
      activeSubjectId: null,
      phaseStartedAt: null,
      durationMs: 0,
      completedPomodoros: 0,

      settings: {
        workDuration: 60 * 60 * 1000,
        shortBreakDuration: 5 * 60 * 1000,
        longBreakDuration: 15 * 60 * 1000,
        autoStartBreaks: false,
        autoStartWork: false,
        notificationsEnabled: false,
      },
      showProgressBar: true,
      workColor: '#f97316',
      shortBreakColor: '#22c55e',
      longBreakColor: '#3b82f6',

      setMode: (mode) => set({ mode }),
      setShowProgressBar: (showProgressBar) => set({ showProgressBar }),
      setSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setColors: (work, short, long) =>
        set({ workColor: work, shortBreakColor: short, longBreakColor: long }),

      startWork: async (subjectId) => {
        const state = get();

        // 1. If already in work for THIS subject end session
        if (state.phase === 'work' && state.activeSubjectId === subjectId && state.running) {
          await api.patch(`/subject/${state.activeSubjectId}/endTimer`, {
            endedAt: new Date(),
          });
          await invalidateSubjectTimerQueries();
          if (state.mode === 'stopwatch') {
            set({
              phase: 'idle',
              running: false,
              phaseStartedAt: null,
              durationMs: 0,
            });
            return;
          }

          const nextCompleted = state.completedPomodoros + 1;
          const isLongBreak = nextCompleted % 4 === 0;
          const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
          const breakDuration = isLongBreak
            ? state.settings.longBreakDuration
            : state.settings.shortBreakDuration;

          set({
            completedPomodoros: nextCompleted,
            phase: nextPhase,
            running: true,
            phaseStartedAt: Date.now(),
            durationMs: breakDuration,
          });
          return;
        }

        // 2. If switching subjects or currently in work, end the previous session
        if (state.phase === 'work' && state.activeSubjectId) {
          try {
            await api.patch(`/subject/${state.activeSubjectId}/endTimer`, {
              endedAt: new Date(),
            });
            await invalidateSubjectTimerQueries();
          } catch (e) {
            console.error('Failed to end previous timer:', e);
          }
        }

        // 3. Start new backend log
        try {
          await api.patch(`/subject/${subjectId}/startTimer`);
          await invalidateSubjectTimerQueries();
        } catch (e) {
          console.error('Failed to start new timer:', e);
          return;
        }

        // 4. Update local state
        set({
          activeSubjectId: subjectId,
          phase: 'work',
          running: true,
          phaseStartedAt: Date.now(),
          durationMs: state.settings.workDuration,
        });
      },

      endWork: async (manual = true) => {
        const state = get();
        if (state.phase !== 'work' || !state.activeSubjectId) return;

        // 1. Finalize backend log
        const targetEnd = manual
          ? Date.now()
          : (state.phaseStartedAt || Date.now()) + state.durationMs;

        try {
          await api.patch(`/subject/${state.activeSubjectId}/endTimer`, {
            endedAt: new Date(targetEnd),
          });
          await invalidateSubjectTimerQueries();
        } catch (e) {
          console.error('Failed to end timer:', e);
        }

        // 2. Determine next phase
        if (state.mode === 'stopwatch') {
          set({
            phase: 'idle',
            running: false,
            phaseStartedAt: null,
            durationMs: 0,
          });
          return;
        }

        const nextCompleted = state.completedPomodoros + 1;
        const isLongBreak = nextCompleted % 4 === 0;
        const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
        const breakDuration = isLongBreak
          ? state.settings.longBreakDuration
          : state.settings.shortBreakDuration;

        set({
          completedPomodoros: nextCompleted,
          phase: nextPhase,
          running: true,
          phaseStartedAt: Date.now(),
          durationMs: breakDuration,
        });
      },

      completeBreak: () => {
        const state = get();
        if (state.phase === 'work' || state.phase === 'idle') return;

        if (state.settings.autoStartWork && state.activeSubjectId) {
          get().startWork(state.activeSubjectId);
        } else {
          set({
            phase: 'idle',
            running: false,
            phaseStartedAt: null,
            durationMs: 0,
          });
        }
      },

      skipBreak: () => {
        get().completeBreak();
      },

      reset: () => {
        set({
          phase: 'idle',
          running: false,
          phaseStartedAt: null,
          durationMs: 0,
          completedPomodoros: 0,
        });
      },
    }),
    {
      name: 'timer-storage',
    },
  ),
);
