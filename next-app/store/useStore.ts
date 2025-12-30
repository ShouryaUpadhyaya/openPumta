import { create } from "zustand";
import { Subject } from "../app/components/Home/Subjects/columbs";
import { Habit } from "../app/components/Home/Habits";

type CounterStore = {
  Subjects: Subject[];
  Habits: Habit[];
  addSubject: (subject: Subject) => void;
  addHabit: (habit: Habit) => void;
  updateSubjectWorkSecs: (id: string, newWorkSecs: number) => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  Subjects: [
    {
      id: "123",
      name: "Maths",
      workSecs: 1234,
      goalWorkSecs: 12345,
      additionInfo: "a;dkfasdf",
      status: "excelent",
      date: "12/12/25",
    },
  ],
  Habits: [{ id: "123", name: "coding", completed: false }],
  addSubject: ({
    id,
    name,
    workSecs,
    goalWorkSecs,
    additionInfo,
    status,
    date,
  }: Subject) => {
    console.log(
      "added Subject",
      id,
      name,
      workSecs,
      goalWorkSecs,
      additionInfo,
      status,
      date
    );
    set((state) => ({
      Subjects: [
        ...state.Subjects,
        { id, name, workSecs, goalWorkSecs, additionInfo, status, date },
      ],
    }));
  },
  addHabit: ({ id, name, completed }: Habit) => {
    console.log("add Habit", id, name, completed);
    set((state) => ({ Habits: [...state.Habits, { id, name, completed }] }));
  },
  updateSubjectWorkSecs: (id: string, newWorkSecs: number) => {
    set((state) => ({
      Subjects: state.Subjects.map((subject) =>
        subject.id === id
          ? { ...subject, workSecs: subject.workSecs + newWorkSecs }
          : subject
      ),
    }));
  },
}));
