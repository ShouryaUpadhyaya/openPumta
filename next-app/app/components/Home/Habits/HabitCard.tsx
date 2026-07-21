import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Habit, useToggleHabitCompletion } from '@/hooks/useHabits';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  isCompletedMinimum: boolean;
  linkedSubject?: { id: number; name: string };
  selectedDateStr?: string;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  isCompleted,
  isCompletedMinimum,
  linkedSubject,
  selectedDateStr,
  onEdit,
}: HabitCardProps) {
  const toggleHabit = useToggleHabitCompletion();

  return (
    <Card
      className={`transition-colors group gap-4 p-2 ${
        isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/40'
      }`}
    >
      <CardContent className="flex items-center justify-between px-3 py-1">
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm font-medium truncate ${
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {habit.name}
          </span>
          {habit.badDayPlan && (
            <span className="text-[10px] text-muted-foreground/80 truncate mb-0.5">
              Minimum: {habit.badDayPlan}
            </span>
          )}
          {linkedSubject && (
            <span className="text-[10px] text-muted-foreground truncate">{linkedSubject.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Edit — always visible on mobile, hover-only on desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>

          {habit.badDayPlan && (
            <>
              {/* Mobile: always visible Min button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleHabit.mutate({
                    habitId: habit.id,
                    isBadDayPlan: true,
                    date: selectedDateStr,
                  })
                }
                disabled={toggleHabit.isPending || isCompleted}
                className={`h-7 px-2 text-[10px] transition-all sm:hidden ${
                  isCompletedMinimum
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'text-muted-foreground border-muted-foreground/30'
                }`}
              >
                Min
              </Button>

              {/* Desktop: hover-reveal Min button with tooltip */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleHabit.mutate({
                          habitId: habit.id,
                          isBadDayPlan: true,
                          date: selectedDateStr,
                        })
                      }
                      disabled={toggleHabit.isPending || isCompleted}
                      className={`h-7 px-2 text-[10px] transition-all hidden sm:flex ${
                        isCompletedMinimum
                          ? 'bg-primary/20 text-primary border-primary/30 opacity-100'
                          : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
                      }`}
                    >
                      Min
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <p>
                      <span className="font-semibold">Bad Day Plan:</span> {habit.badDayPlan}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          <Checkbox
            checked={isCompleted}
            onCheckedChange={() =>
              toggleHabit.mutate({ habitId: habit.id, isBadDayPlan: false, date: selectedDateStr })
            }
            disabled={toggleHabit.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
