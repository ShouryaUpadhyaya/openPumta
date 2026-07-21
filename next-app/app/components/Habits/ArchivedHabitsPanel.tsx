'use client';

import React, { useState } from 'react';
import { useArchivedHabits, useRestoreHabit } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { DIFFICULTY_OPTIONS } from './constants';
import { toast } from 'sonner';
import { HabitDifficulty } from '@/hooks/useHabits';

interface ArchivedHabitsPanelProps {
  activeHabitsCount: number;
}

function getDifficultyLabel(difficulty?: HabitDifficulty) {
  const opt = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
  return opt ?? null;
}

function formatArchivedDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ArchivedHabitsPanel({ activeHabitsCount }: ArchivedHabitsPanelProps) {
  const [open, setOpen] = useState(false);
  const { data: archived, isLoading } = useArchivedHabits();
  const restoreHabit = useRestoreHabit();

  const canRestore = activeHabitsCount < 6;

  if (isLoading || !archived || archived.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1 group`}
      >
        <Archive className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        <span>Archived Habits</span>
        <span className="ml-1 bg-muted/60 text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
          {archived.length}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 ml-1 opacity-50" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
        )}
      </button>

      {/* Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        {!canRestore && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-medium">
            You have 6 active habits. Remove one to restore an archived habit.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {archived.map((habit) => {
            const diffOpt = getDifficultyLabel(habit.difficulty as HabitDifficulty);
            const archivedOn = formatArchivedDate(habit.deletedAt);

            return (
              <div
                key={habit.id}
                className="flex flex-col gap-2 p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-semibold text-sm text-foreground/80 truncate">
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {diffOpt && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${diffOpt.color}`}
                        >
                          {diffOpt.label}
                        </span>
                      )}
                      {habit._count.log > 0 && (
                        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {habit._count.log} sessions
                        </span>
                      )}
                    </div>
                    {archivedOn && (
                      <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                        Archived {archivedOn}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canRestore || restoreHabit.isPending}
                    onClick={() =>
                      restoreHabit.mutate(habit.id, {
                        onSuccess: (data: any) =>
                          toast.success(`"${data.name}" restored with all past history!`),
                        onError: (err: any) =>
                          toast.error(err?.response?.data?.message || 'Could not restore habit'),
                      })
                    }
                    className="h-7 px-2.5 text-xs gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </Button>
                </div>

                {habit.badDayPlan && (
                  <p className="text-[10px] text-muted-foreground/60 truncate">
                    Min: {habit.badDayPlan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
