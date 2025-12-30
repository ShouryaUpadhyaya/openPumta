"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      completed: false,
    };
    setHabits((prev) => [...prev, newHabit]);
    setIsDialogOpen(false);
  };

  const toggleHabit = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <section className="min-w-5xl px-10 py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Daily Habits</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Habit</Button>
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
                  addHabit(name);
                  form.reset();
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
      <div className="grid gap-4">
        {habits.length > 0 ? (
          habits.map((habit) => (
            <Card key={habit.id} size="sm" className="">
              <CardContent className="flex items-center justify-between p-4">
                <span className={habit.completed ? "line-through" : ""}>
                  {habit.name}
                </span>
                <Checkbox
                  checked={habit.completed}
                  onCheckedChange={() => toggleHabit(habit.id)}
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No habits yet. Add one to get started!</p>
        )}
      </div>
    </section>
  );
}
