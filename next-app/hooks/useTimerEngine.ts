import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

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

  const notifiedRef = useRef(false);

  useEffect(() => {
    notifiedRef.current = false;
  }, [phaseStartedAt, phase]);

  const handleTransition = useCallback(() => {
    if (phase === 'work') {
      endWork(false);
    } else if (phase === 'shortBreak' || phase === 'longBreak') {
      completeBreak();
    }
  }, [phase, endWork, completeBreak]);

  const checkCompletion = useCallback(() => {
    if (mode !== 'pomodoro' || phase === 'idle' || !phaseStartedAt) return;

    const now = Date.now();
    const currentElapsed = now - phaseStartedAt;

    if (currentElapsed >= durationMs) {
      if (!notifiedRef.current) {
        notifiedRef.current = true;

        if (settings.notificationsEnabled) {
          const title = phase === 'work' ? 'Focus Session Complete!' : 'Break Complete!';
          const body =
            phase === 'work' ? 'Great job! Time for a break.' : 'Time to get back to work!';

          toast.success(title, { description: body, duration: 8000 });

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(title, { body });
            } catch (error) {
              console.error('Failed to trigger browser notification:', error);
            }
          }
        }
      }

      if (phase === 'work' && settings.autoStartBreaks) {
        handleTransition();
      } else if ((phase === 'shortBreak' || phase === 'longBreak') && settings.autoStartWork) {
        handleTransition();
      }
    }
  }, [mode, phase, phaseStartedAt, durationMs, settings, handleTransition]);

  // Main tick loop
  useEffect(() => {
    if (!running || !hasHydrated) return;

    const interval = setInterval(() => {
      setLocalNow(Date.now());
      checkCompletion();
    }, 100);

    return () => clearInterval(interval);
  }, [running, hasHydrated, checkCompletion]);

  // Check for missed transitions on hydration or visibility change
  useEffect(() => {
    if (!hasHydrated || !running) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setLocalNow(Date.now());
        checkCompletion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    checkCompletion(); // Check immediately

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasHydrated, running, checkCompletion]);

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
