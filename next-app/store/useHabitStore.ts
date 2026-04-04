import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface HabitState {
  Habits: Habit[];
  addHabit: (habit: Habit) => void;
  toggleHabit: (id: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      Habits: [{ id: '123', name: 'coding', completed: false }],
      addHabit: (habit: Habit) => {
        set((state) => ({
          Habits: [...state.Habits, habit],
        }));
      },
      toggleHabit: (id: string) => {
        set((state) => ({
          Habits: state.Habits.map((habit) =>
            habit.id === id ? { ...habit, completed: !habit.completed } : habit,
          ),
        }));
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
