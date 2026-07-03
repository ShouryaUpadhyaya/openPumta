'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useSubjects } from '@/hooks/useSubjects';
import { useHabits } from '@/hooks/useHabits';
import { useDailyRatingStats } from '@/hooks/useRatings';

export function GettingStartedCard() {
  const {
    onboardingChoice,
    gettingStartedDismissed,
    gettingStartedTasks,
    hasSeenConfetti,
    completeTask,
    dismissGettingStarted,
    markConfettiSeen,
  } = useOnboardingStore();

  const confettiFired = useRef(false);

  // ── Live data to auto-check tasks ─────────────────────────────────────────
  const { data: subjects = [] } = useSubjects();
  const { data: habits = [] } = useHabits();
  const { data: ratingStats } = useDailyRatingStats();

  // Check 1: subject created
  useEffect(() => {
    if (subjects.length > 0) completeTask('create-subject');
  }, [subjects.length, completeTask]);

  // Check 2: focus session started (any subject has a log)
  useEffect(() => {
    const hasSession = subjects.some((s) => s.subjectLogs && s.subjectLogs.length > 0);
    if (hasSession) completeTask('start-session');
  }, [subjects, completeTask]);

  // Check 3: habit with bad day plan exists
  useEffect(() => {
    const hasBadDayHabit = habits.some((h) => !!h.badDayPlan);
    if (hasBadDayHabit) completeTask('add-habit');
  }, [habits, completeTask]);

  // Check 4: daily review completed today
  useEffect(() => {
    if (ratingStats?.today !== null && ratingStats?.today !== undefined) {
      completeTask('complete-review');
    }
  }, [ratingStats?.today, completeTask]);

  // ── Confetti + auto-dismiss on completion ─────────────────────────────────
  const allDone = gettingStartedTasks.every((t) => t.completed);

  // Fix hydration mismatch for Zustand persist
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!allDone || hasSeenConfetti || confettiFired.current) return;
    confettiFired.current = true;
    markConfettiSeen();

    // Full page confetti burst
    confetti({
      particleCount: 250,
      spread: 120,
      origin: { x: 0.5, y: 0.4 },
      zIndex: 9999,
      colors: ['#f97316', '#fb923c', '#fbbf24', '#ffffff', '#a3a3a3'],
    });

    // Auto-dismiss after 4s
    const timer = setTimeout(() => dismissGettingStarted(), 4000);
    return () => clearTimeout(timer);
  }, [allDone, hasSeenConfetti, markConfettiSeen, dismissGettingStarted]);

  // Show for any completed onboarding (fresh or demo) who haven't dismissed
  const shouldShow = onboardingChoice !== null && !gettingStartedDismissed && !allDone;

  const completedCount = gettingStartedTasks.filter((t) => t.completed).length;

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {(shouldShow || (allDone && onboardingChoice !== null)) && !gettingStartedDismissed && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          className="fixed lg:bottom-6 lg:right-6 z-40 w-75 max-w-[calc(100vw-2rem)] bg-card border border-border/40 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
          role="complementary"
          aria-label="Getting started checklist"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Getting Started</span>
            </div>
            <button
              onClick={dismissGettingStarted}
              aria-label="Dismiss getting started card"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-white/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* All done state */}
          {allDone ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 px-4 py-6 text-center"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <p className="font-semibold text-foreground">You&apos;re ready!</p>
              <p className="text-xs text-muted-foreground">
                All tasks complete. Enjoy OpenPumta 🎉
              </p>
            </motion.div>
          ) : (
            <>
              {/* Task list */}
              <div className="px-4 py-3 space-y-2">
                {gettingStartedTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={task.completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs leading-snug ${
                        task.completed
                          ? 'line-through text-muted-foreground/50'
                          : 'text-foreground/80'
                      }`}
                    >
                      {task.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-4 pt-1">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                  <span>Progress</span>
                  <span>
                    {completedCount} / {gettingStartedTasks.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / gettingStartedTasks.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
