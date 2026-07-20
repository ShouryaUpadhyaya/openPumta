import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HabitDifficulty } from '@/hooks/useHabits';
import { getLocalIsoDate } from '@/lib/utils';
import { DIFFICULTY_OPTIONS } from './constants';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface HabitHeatmapCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  habit: any;
  isCompletedOnSelectedDate: boolean;
  completionDates: Map<string, boolean>; // date -> isBadDayPlan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkedSubject?: any;
  daysArray: string[];
  gridCols: string;
  filterRange: number | 'all';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (habit: any) => void;
  onDelete: (habitId: number) => void;
  onToggle: (habitId: number, isBadDayPlan: boolean) => void;
  isCompletedMinimum: boolean;
  selectedDateStr?: string;
}

export function HabitHeatmapCard({
  habit,
  isCompletedOnSelectedDate,
  completionDates,
  linkedSubject,
  daysArray,
  gridCols,
  filterRange,
  onEdit,
  onDelete,
  onToggle,
  isCompletedMinimum,
  selectedDateStr,
}: HabitHeatmapCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getDifficultyBadge = (difficulty?: HabitDifficulty) => {
    const opt = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    if (!opt) return null;
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  const handleConfirmDelete = () => {
    onDelete(habit.id);
    setIsDeleteOpen(false);
  };

  return (
    <Card
      className={`transition-all group ${
        isCompletedOnSelectedDate
          ? 'border-primary/50 bg-primary/5'
          : 'bg-background border-border/40'
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
          {/* Desktop: hover-reveal icons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit Habit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {habit.badDayPlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(habit.id, true)}
              disabled={isCompletedOnSelectedDate}
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
            checked={isCompletedOnSelectedDate}
            onCheckedChange={() => onToggle(habit.id, false)}
            className="h-5 w-5 rounded-md mx-1"
          />

          {/* Desktop: hover-reveal delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive hover:bg-destructive/10 h-8 w-8 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Habit"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Mobile: always-visible ⋯ dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            const isToday = dateStr === getLocalIsoDate(new Date());
            const isSelected = dateStr === selectedDateStr;
            return (
              <div
                key={i}
                title={dateStr}
                className={`aspect-square rounded-sm transition-colors ${
                  done ? (isBadDayPlan ? 'bg-primary/50' : 'bg-primary') : 'bg-muted/40'
                } ${isToday && !done ? 'border-2 border-primary/40' : ''} ${
                  isSelected && !isToday
                    ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background'
                    : ''
                }`}
              />
            );
          })}
        </div>
      </CardContent>

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete Habit?"
        description={`"${habit.name}" will be hidden from your active list. Its past completion history will still appear in your analytics.`}
      />
    </Card>
  );
}
