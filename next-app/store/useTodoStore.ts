import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
};

interface TodoState {
  Todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addSubtask: (todoId: string, text: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  deleteSubtask: (todoId: string, subtaskId: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      Todos: [],
      addTodo: (text: string) => {
        set((state) => ({
          Todos: [
            ...state.Todos,
            { id: crypto.randomUUID(), text, completed: false, subtasks: [] },
          ],
        }));
      },
      toggleTodo: (id: string) => {
        set((state) => ({
          Todos: state.Todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        }));
      },
      deleteTodo: (id: string) => {
        set((state) => ({
          Todos: state.Todos.filter((todo) => todo.id !== id),
        }));
      },
      addSubtask: (todoId: string, text: string) => {
        set((state) => ({
          Todos: state.Todos.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  subtasks: [...todo.subtasks, { id: crypto.randomUUID(), text, completed: false }],
                }
              : todo,
          ),
        }));
      },
      toggleSubtask: (todoId: string, subtaskId: string) => {
        set((state) => ({
          Todos: state.Todos.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  subtasks: todo.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask,
                  ),
                }
              : todo,
          ),
        }));
      },
      deleteSubtask: (todoId: string, subtaskId: string) => {
        set((state) => ({
          Todos: state.Todos.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  subtasks: todo.subtasks.filter((subtask) => subtask.id !== subtaskId),
                }
              : todo,
          ),
        }));
      },
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
