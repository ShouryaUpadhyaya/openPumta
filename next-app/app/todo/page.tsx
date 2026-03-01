'use client';
import React, { useState } from 'react';
import { useCounterStore, Todo, Subtask } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CornerDownRight, MoreVertical, Plus } from 'lucide-react';

// Small component for adding subtasks
function SubtaskInput({ todoId, onDone }: { todoId: string; onDone: () => void }) {
  const { addSubtask } = useCounterStore();
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      addSubtask(todoId, newSubtaskText.trim());
      setNewSubtaskText('');
      onDone();
    }
  };

  return (
    <div className="flex gap-2 ml-8 mt-4 ">
      <Input
        value={newSubtaskText}
        onChange={(e) => setNewSubtaskText(e.target.value)}
        placeholder="Add a new subtask"
        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
        className="h-8"
        autoFocus
      />
      <Button onClick={handleAddSubtask} size="icon" className="h-8 w-8 flex-shrink-0">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo, toggleSubtask, deleteSubtask } = useCounterStore();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  return (
    <li className="p-4 rounded-lg bg-card">
      <div className="flex items-center gap-2 py-2">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          className="scale-150 ml-2"
        />
        <span
          className={`flex-grow text-2xl ml-4 font-semibold cursor-pointer ${
            todo.completed ? 'line-through text-muted-foreground' : ''
          }`}
          onClick={() => toggleTodo(todo.id)}
        >
          {todo.text}
        </span>
        <div className="opacity-40 hover:opacity-80">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsAddingSubtask(true);
                }}
              >
                Add Subtask
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteTodo(todo.id)} className="text-red-500">
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ul className="mt-2 space-y-2">
        {todo.subtasks.map((subtask: Subtask) => (
          <li key={subtask.id} className="flex items-center gap-4 ml-8">
            <CornerDownRight className="h-4 w-4 text-muted-foreground" />
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => toggleSubtask(todo.id, subtask.id)}
            />
            <span
              className={`flex-grow cursor-pointer ${
                subtask.completed ? 'line-through text-muted-foreground' : ''
              }`}
              onClick={() => toggleSubtask(todo.id, subtask.id)}
            >
              {subtask.text}
            </span>
            <div className="opacity-40 hover:opacity-80">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => deleteSubtask(todo.id, subtask.id)}
                    className="text-red-500"
                  >
                    Delete Subtask
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>
      {isAddingSubtask && (
        <SubtaskInput todoId={todo.id} onDone={() => setIsAddingSubtask(false)} />
      )}
    </li>
  );
}

export default function TodoPage() {
  const { Todos, addTodo } = useCounterStore();
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(newTodoText.trim());
      setNewTodoText('');
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-5xl font-bold mb-4 my-8">To-Do List:</h1>

      <ul className="space-y-4">
        {Todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      <div className="flex gap-2 mt-4 items-center">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new to-do"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          className="p-4 py-6"
        />
        <Button onClick={handleAddTodo} className="py-4 font-black! text-2xl">
          <Plus />
        </Button>
      </div>
    </div>
  );
}
