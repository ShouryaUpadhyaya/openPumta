'use client';

import React, { useState } from 'react';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListTodo } from 'lucide-react';
import { toast } from 'sonner';

export default function TodoPage() {
  const { user } = useAuthStore();
  const { data: todos, isLoading } = useTodos(user?.id);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    createTodo.mutate(
      { title: newTaskTitle.trim(), userId: user.id },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          toast.success('Task added');
        },
        onError: () => toast.error('Failed to add task'),
      },
    );
  };

  const handleToggle = (id: number, currentStatus: boolean) => {
    updateTodo.mutate({ id, isCompleted: !currentStatus });
  };

  const handleDelete = (id: number) => {
    deleteTodo.mutate(id, {
      onSuccess: () => toast.success('Task deleted'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        Loading tasks...
      </div>
    );
  }

  const activeTodos = todos?.filter((t) => !t.isCompleted) || [];
  const completedTodos = todos?.filter((t) => t.isCompleted) || [];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <ListTodo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your action items.</p>
        </div>
      </div>

      <form onSubmit={handleAddTodo} className="flex gap-2 mb-8 relative">
        <Input
          className="flex-1 bg-background border-border/60 rounded-xl h-12 px-4 shadow-sm"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Button
          type="submit"
          disabled={!newTaskTitle.trim() || createTodo.isPending}
          className="h-12 w-12 rounded-xl shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
              <ListTodo className="h-12 w-12 mb-4 opacity-20" />
              <p>Your task list is empty.</p>
              <p className="text-sm">Add a task above to get started.</p>
            </div>
          ) : activeTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">All caught up!</p>
          ) : (
            activeTodos.map((todo) => (
              <Card
                key={todo.id}
                className="bg-background border-border/40 shadow-sm transition-all hover:shadow-md group"
              >
                <CardContent className="flex items-center gap-3 p-3 lg:p-4">
                  <Checkbox
                    checked={todo.isCompleted}
                    onCheckedChange={() => handleToggle(todo.id, todo.isCompleted)}
                    className="h-5 w-5 rounded-md"
                  />
                  <span className="flex-1 text-foreground font-medium">{todo.title}</span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(todo.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {completedTodos.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
              Completed ({completedTodos.length})
            </h2>
            {completedTodos.map((todo) => (
              <Card key={todo.id} className="bg-muted/30 border-border/20 shadow-none group">
                <CardContent className="flex items-center gap-3 p-3 lg:p-4 opacity-60">
                  <Checkbox
                    checked={todo.isCompleted}
                    onCheckedChange={() => handleToggle(todo.id, todo.isCompleted)}
                    className="h-5 w-5 rounded-md"
                  />
                  <span className="flex-1 text-muted-foreground line-through">{todo.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
