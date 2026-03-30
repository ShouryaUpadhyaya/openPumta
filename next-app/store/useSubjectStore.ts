import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Subject } from '../app/components/Home/Subjects/columbs';

interface SubjectState {
  Subjects: Subject[];
  timerRunningSubjectId: string | null;
  timer: ReturnType<typeof setInterval> | null;
  addSubject: (name: string, goalWorkSecs: number) => void;
  deleteSubject: (id: string) => void;
  updateSubject: (subject: Subject) => void;
  incrementWorkSecs: (id: string, newWorkSecs: number) => void;
  toggleTimer: (id: string) => void;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
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
      name: 'subject-storage',
      storage: createJSONStorage(() => localStorage),
      // We don't want to persist the timer itself as it's a runtime object
      partialize: (state) => ({
        Subjects: state.Subjects,
        timerRunningSubjectId: state.timerRunningSubjectId,
      }),
    },
  ),
);
