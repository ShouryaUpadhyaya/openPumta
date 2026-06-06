import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2 } from 'lucide-react';
import { HabitDifficulty } from '@/hooks/useHabits';

interface HabitHeatmapCardProps {
  habit: any;
  isCompletedToday: boolean;
  completionDates: Map<string, boolean>; // date -> isBadDayPlan
  linkedSubject?: any;
  daysArray: string[];
  gridCols: string;
  filterRange: number | 'all';
  onEdit: (habit: any) => void;
  onDelete: (habitId: number) => void;
  onToggle: (habitId: number, isBadDayPlan: boolean) => void;
  isCompletedMinimum: boolean;
}

const DIFFICULTY_OPTIONS: { label: string; value: HabitDifficulty; color: string }[] = [
  { label: 'Easy', value: 'LOW', color: 'text-emerald-500' },
  { label: 'Medium', value: 'MID', color: 'text-amber-500' },
  { label: 'Hard', value: 'HIGH', color: 'text-rose-500' },
];

export function HabitHeatmapCard({
  habit,
  isCompletedToday,
  completionDates,
  linkedSubject,
  daysArray,
  gridCols,
  filterRange,
  onEdit,
  onDelete,
  onToggle,
  isCompletedMinimum,
}: HabitHeatmapCardProps) {
  const getDifficultyBadge = (difficulty?: HabitDifficulty) => {
    const opt = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    if (!opt) return null;
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  return (
    <Card
      className={`transition-all group ${
        isCompletedToday ? 'border-primary/50 bg-primary/5' : 'bg-background border-border/40'
      } flex flex-col`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle className="text-base leading-tight truncate">{habit.name}</CardTitle>
          {habit.badDayPlan && (
            <span className="text-[10px] text-muted-foreground/80 truncate mb-0.5">
              Minimum: {habit.badDayPlan}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {getDifficultyBadge(habit.difficulty)}
            {linkedSubject && (
              <>
                {habit.difficulty && (
                  <span className="text-muted-foreground/40 text-[10px]">·</span>
                )}
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  {linkedSubject.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit Habit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {habit.badDayPlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(habit.id, true)}
              disabled={isCompletedToday}
              className={`h-7 px-2 text-[10px] transition-all ${
                isCompletedMinimum
                  ? 'bg-primary/20 text-primary border-primary/30 opacity-100'
                  : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
              }`}
            >
              Min
            </Button>
          )}

          <Checkbox
            checked={isCompletedToday}
            onCheckedChange={() => onToggle(habit.id, false)}
            className="h-5 w-5 rounded-md mx-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(habit.id)}
            className="text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Habit"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-muted-foreground mb-2 flex justify-between font-medium">
          <span>{filterRange === 'all' ? 'All Time' : `Last ${filterRange} Days`}</span>
          <span>
            {completionDates.size} / {filterRange === 'all' ? daysArray.length : filterRange}
          </span>
        </div>
        <div className={`grid ${gridCols} gap-1`}>
          {daysArray.map((dateStr, i) => {
            const done = completionDates.has(dateStr);
            const isBadDayPlan = done ? completionDates.get(dateStr) : false;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <div
                key={i}
                title={dateStr}
                className={`aspect-square rounded-sm transition-colors ${
                  done ? (isBadDayPlan ? 'bg-primary/50' : 'bg-primary') : 'bg-muted/40'
                } ${isToday && !done ? 'border-2 border-primary/40' : ''}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
