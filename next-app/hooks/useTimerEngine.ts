import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';

export function useTimerEngine() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const store = useTimerStore(
    useShallow((s) => ({
      running: s.running,
      phase: s.phase,
      mode: s.mode,
      phaseStartedAt: s.phaseStartedAt,
      durationMs: s.durationMs,
      activeSubjectId: s.activeSubjectId,
      completedPomodoros: s.completedPomodoros,
      settings: s.settings,
      endWork: s.endWork,
      completeBreak: s.completeBreak,
    })),
  );

  const { running, phase, mode, phaseStartedAt, durationMs, endWork, completeBreak, settings } =
    store;

  const [localNow, setLocalNow] = useState(() => Date.now());

  const elapsedMs = useMemo(() => {
    if (running && phaseStartedAt) {
      return Math.max(0, localNow - phaseStartedAt);
    }
    return 0;
  }, [running, phaseStartedAt, localNow]);

  const progress = useMemo(() => {
    if (mode === 'pomodoro' && durationMs > 0) {
      return (elapsedMs / durationMs) * 100;
    }
    return 0;
  }, [mode, durationMs, elapsedMs]);

  const remainingMs = useMemo(() => {
    if (mode === 'pomodoro') {
      return durationMs - elapsedMs;
    }
    return elapsedMs;
  }, [mode, durationMs, elapsedMs]);

  const handleTransition = useCallback(() => {
    if (phase === 'work') {
      endWork(false); // Auto-transition
    } else if (phase === 'shortBreak' || phase === 'longBreak') {
      completeBreak();
    }
  }, [phase, endWork, completeBreak]);

  // Main tick loop
  useEffect(() => {
    console.log('inside main tick loop');

    if (!running || !hasHydrated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setLocalNow(now);

      // Transition Logic
      if (mode === 'pomodoro' && phase !== 'idle') {
        const currentElapsed = now - (phaseStartedAt || now);
        if (currentElapsed >= durationMs) {
          if (phase === 'work' && settings.autoStartBreaks) {
            handleTransition();
          } else if ((phase === 'shortBreak' || phase === 'longBreak') && settings.autoStartWork) {
            handleTransition();
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [running, mode, phase, phaseStartedAt, durationMs, handleTransition, hasHydrated, settings]);

  // Check for missed transitions on hydration or visibility change
  useEffect(() => {
    if (!hasHydrated || !running || mode !== 'pomodoro' || phase === 'idle') return;

    const now = Date.now();
    const currentElapsed = now - (phaseStartedAt || now);
    if (currentElapsed >= durationMs) {
      if (phase === 'work' && settings.autoStartBreaks) {
        handleTransition();
      } else if ((phase === 'shortBreak' || phase === 'longBreak') && settings.autoStartWork) {
        handleTransition();
      }
    }
  }, [hasHydrated, running, mode, phase, phaseStartedAt, durationMs, handleTransition, settings]);

  return {
    elapsedMs,
    remainingMs,
    progress,
    running,
    phase,
    mode,
    activeSubjectId: store.activeSubjectId,
    completedPomodoros: store.completedPomodoros,
    settings: store.settings,
  };
}
