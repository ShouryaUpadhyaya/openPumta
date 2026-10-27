import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StopwatchState {
  /** Epoch ms when the current run began; null while paused/idle. */
  startedAt: number | null;
  /** Ms accumulated across previous runs (before the current one). */
  accumulatedMs: number;
  /**
   * Where the user dragged it on the timer page, as fractions (0–1) of the free space
   * horizontally/vertically; null = its default spot under the header.
   */
  position: { x: number; y: number } | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setPosition: (position: { x: number; y: number } | null) => void;
}

export const useStopwatchStore = create<StopwatchState>()(
  persist(
    (set, get) => ({
      startedAt: null,
      accumulatedMs: 0,
      position: null,

      start: () => {
        if (get().startedAt !== null) return; // already running
        set({ startedAt: Date.now() });
      },

      pause: () => {
        const { startedAt, accumulatedMs } = get();
        if (startedAt === null) return; // already paused
        set({
          startedAt: null,
          accumulatedMs: accumulatedMs + Math.max(0, Date.now() - startedAt),
        });
      },

      reset: () => set({ startedAt: null, accumulatedMs: 0 }),

      setPosition: (position) => set({ position }),
    }),
    {
      name: 'stopwatch-store',
      partialize: (s) => ({
        startedAt: s.startedAt,
        accumulatedMs: s.accumulatedMs,
        position: s.position,
      }),
    },
  ),
);

/** Pure helper so components/tests can derive elapsed time from a given "now". */
export const getElapsedMs = (s: Pick<StopwatchState, 'startedAt' | 'accumulatedMs'>, now: number) =>
  s.accumulatedMs + (s.startedAt !== null ? Math.max(0, now - s.startedAt) : 0);
