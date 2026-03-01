import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subject } from '../app/components/Home/Subjects/columbs';
import { Habit } from '../app/components/Home/Habits';

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

type Store = {
  Subjects: Subject[];
  Habits: Habit[];
  Todos: Todo[];
  timerRunningSubjectId: string | null;
  timer: ReturnType<typeof setInterval> | null;
  pomodoroTimer: number;
  BreakTimer: number;
  changeTimerPomodoro: ({ workSecs, breakSecs }: { workSecs: number; breakSecs: number }) => void;
  addSubject: (name: string, goalWorkSecs: number) => void;
  deleteSubject: (id: string) => void;
  updateSubject: (subject: Subject) => void;
  addHabit: (habit: Habit) => void;
  toggleHabit: (id: string) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addSubtask: (todoId: string, text: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  deleteSubtask: (todoId: string, subtaskId: string) => void;
  incrementWorkSecs: (id: string, newWorkSecs: number) => void;
  toggleTimer: (id: string) => void;
};

export const useCounterStore = create<Store>()(
  persist(
    (set, get) => ({
      pomodoroTimer: 3600,
      BreakTimer: 600,
      changeTimerPomodoro: ({ workSecs, breakSecs }: { workSecs: number; breakSecs: number }) => {
        set({ pomodoroTimer: workSecs, BreakTimer: breakSecs });
      },
      Subjects: [
        {
          id: '123',
          name: 'Maths',
          workSecs: 1234,
          goalWorkSecs: 12345,
          additionInfo: 'a;dkfasdf',
          status: 'excelent',
          date: '12/12/25',
        },
      ],
      Habits: [{ id: '123', name: 'coding', completed: false }],
      Todos: [],
      timerRunningSubjectId: null,
      timer: null,
      addSubject: (name: string, goalWorkSecs: number) => {
        set((state) => ({
          Subjects: [
            ...state.Subjects,
            {
              id: crypto.randomUUID(),
              name,
              workSecs: 0,
              goalWorkSecs,
              status: 'not Started',
              date: new Date().toLocaleDateString(),
            },
          ],
        }));
      },
      deleteSubject: (id: string) => {
        set((state) => ({
          Subjects: state.Subjects.filter((subject) => subject.id !== id),
        }));
      },
      updateSubject: (subject: Subject) => {
        set((state) => ({
          Subjects: state.Subjects.map((s) => (s.id === subject.id ? subject : s)),
        }));
      },
      addHabit: ({ id, name, completed }: Habit) => {
        set((state) => ({
          Habits: [...state.Habits, { id, name, completed }],
        }));
      },
      toggleHabit: (id: string) => {
        set((state) => ({
          Habits: state.Habits.map((habit) =>
            habit.id === id ? { ...habit, completed: !habit.completed } : habit,
          ),
        }));
      },
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
      incrementWorkSecs: (id: string, newWorkSecs: number) => {
        set((state) => ({
          Subjects: state.Subjects.map((subject) =>
            subject.id === id ? { ...subject, workSecs: subject.workSecs + newWorkSecs } : subject,
          ),
        }));
      },
      toggleTimer: (id: string) => {
        const { timer, timerRunningSubjectId, incrementWorkSecs } = get();
        if (timer) {
          clearInterval(timer);
        }

        if (id === timerRunningSubjectId) {
          set({ timerRunningSubjectId: null, timer: null });
        } else {
          const newTimer = setInterval(() => {
            incrementWorkSecs(id, 1);
          }, 1000);
          set({ timerRunningSubjectId: id, timer: newTimer });
        }
      },
    }),
    {
      name: 'store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
