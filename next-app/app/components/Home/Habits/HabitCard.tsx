import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil } from 'lucide-react';
import { Habit, useToggleHabitCompletion } from '@/hooks/useHabits';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  linkedSubject?: { id: number; name: string };
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, isCompleted, linkedSubject, onEdit }: HabitCardProps) {
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
          {linkedSubject && (
            <span className="text-[10px] text-muted-foreground truncate">{linkedSubject.name}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => toggleHabit.mutate(habit.id)}
            disabled={toggleHabit.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
