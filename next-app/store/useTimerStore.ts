'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { invalidateSubjectTimerQueries } from '@/lib/queryClient';
import { getStartOfDay, getEndOfDay } from '@/lib/dateUtils';
import { useAuthStore } from '@/store/useAuthStore';

// Close the subject's open log. The day window lets the server auto-complete linked habits
// against the user's start-of-day instead of server midnight.
const endSubjectLog = async (subjectId: number, endedAt: Date) => {
  const offset = useAuthStore.getState().user?.startOfDay || '00:00';
  await api.patch(`/subject/${subjectId}/endTimer`, {
    endedAt,
    from: getStartOfDay(offset).toISOString(),
    to: getEndOfDay(offset).toISOString(),
  });
  await invalidateSubjectTimerQueries();
};

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
  /** User the session belongs to — timer state is persisted per browser, not per account */
  ownerId?: number;
  phaseStartedAt: number | null;
  durationMs: number;
  completedPomodoros: number;

  // Settings & UI
  settings: TimerSettings;
  showProgressBar: boolean;
  showAvatar: boolean;
  /** The separate free-running stopwatch on the timer page */
  showStopwatch: boolean;
  workColor: string;
  shortBreakColor: string;
  longBreakColor: string;

  // Actions
  setMode: (mode: TimerMode) => void;
  setShowProgressBar: (show: boolean) => void;
  setShowAvatar: (show: boolean) => void;
  setShowStopwatch: (show: boolean) => void;
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
      showAvatar: false,
      showStopwatch: true,
      workColor: '#f97316',
      shortBreakColor: '#22c55e',
      longBreakColor: '#3b82f6',

      // A running focus session carries over (only the display changes). Breaks only exist in
      // pomodoro mode, so switching to the stopwatch ends the current one.
      setMode: (mode) =>
        set((state) =>
          mode === 'stopwatch' && (state.phase === 'shortBreak' || state.phase === 'longBreak')
            ? { mode, phase: 'idle', running: false, phaseStartedAt: null, durationMs: 0 }
            : { mode },
        ),
      setShowProgressBar: (showProgressBar) => set({ showProgressBar }),
      setShowAvatar: (showAvatar) => set({ showAvatar }),
      setShowStopwatch: (showStopwatch) => set({ showStopwatch }),
      setSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setColors: (work, short, long) =>
        set({ workColor: work, shortBreakColor: short, longBreakColor: long }),

      startWork: async (subjectId) => {
        const state = get();

        // 1. If already in work for THIS subject end session
        if (state.phase === 'work' && state.activeSubjectId === subjectId && state.running) {
          await endSubjectLog(state.activeSubjectId, new Date());
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
            await endSubjectLog(state.activeSubjectId, new Date());
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
          ownerId: useAuthStore.getState().user?.id,
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
          await endSubjectLog(state.activeSubjectId, new Date(targetEnd));
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
        const state = get();
        // Close the running session now; otherwise it stays open server-side and the next
        // start closes it late, crediting the idle time in between as focus time.
        if (state.phase === 'work' && state.running && state.activeSubjectId) {
          endSubjectLog(state.activeSubjectId, new Date()).catch((e) =>
            console.error('Failed to end timer on reset:', e),
          );
        }
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

const IDLE_SESSION = {
  phase: 'idle',
  running: false,
  activeSubjectId: null,
  phaseStartedAt: null,
  durationMs: 0,
  completedPomodoros: 0,
} as const;

// When a different account signs in on this browser, drop the previous account's session
// instead of showing it as running (and closing someone else's subject log on stop).
// State saved before ownerId existed is adopted by whoever is signed in.
useAuthStore.subscribe(({ user }) => {
  if (!user) return;
  const { ownerId } = useTimerStore.getState();
  if (ownerId === user.id) return;
  useTimerStore.setState(
    ownerId === undefined ? { ownerId: user.id } : { ...IDLE_SESSION, ownerId: user.id },
  );
});
