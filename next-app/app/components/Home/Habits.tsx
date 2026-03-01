'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCounterStore } from '@/store/useStore';

export type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

export default function Habits() {
  const { Habits, addHabit, toggleHabit } = useCounterStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Daily Habits</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Habit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements[0] as HTMLInputElement).value;
                if (name) {
                  addHabit({
                    id: crypto.randomUUID(),
                    name,
                    completed: false,
                  });
                  form.reset();
                  setIsDialogOpen(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <Input placeholder="Habit Name" required />
              <Button type="submit">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-hidden grid gap-3 content-start">
        {Habits.length > 0 ? (
          Habits.slice(0, 6).map((habit) => (
            <Card key={habit.id} size="sm" className="bg-background border-border/40">
              <CardContent className="flex items-center justify-between p-3">
                <span
                  className={`text-sm ${habit.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {habit.name}
                </span>
                <Checkbox checked={habit.completed} onCheckedChange={() => toggleHabit(habit.id)} />
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No habits yet. Add one to get started!</p>
        )}
      </div>
    </section>
  );
}
