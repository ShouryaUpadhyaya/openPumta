import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Habit } from '@/hooks/useHabits';

interface HabitSelectorProps {
  habits: Habit[];
  selectedHabits: number[];
  onChange: (habits: number[]) => void;
}

export function HabitSelector({ habits, selectedHabits, onChange }: HabitSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Linked Habits
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {habits.map((habit) => {
          const isChecked = selectedHabits.includes(habit.id);
          return (
            <label
              key={habit.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                isChecked
                  ? 'border-primary bg-primary/10'
                  : 'bg-muted/10 hover:bg-muted/30 border-muted-foreground/10',
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedHabits, habit.id]);
                  } else {
                    onChange(selectedHabits.filter((id) => id !== habit.id));
                  }
                }}
              />
              <span className="text-sm font-medium leading-none truncate">{habit.name}</span>
            </label>
          );
        })}
        {habits.length === 0 && (
          <span className="text-sm text-muted-foreground col-span-2">No habits available.</span>
        )}
      </div>
    </div>
  );
}
