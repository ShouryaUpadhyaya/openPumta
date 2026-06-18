import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingChoice = 'fresh' | 'demo' | null;

export interface GettingStartedTask {
  id: 'create-subject' | 'start-session' | 'add-habit' | 'complete-review';
  label: string;
  completed: boolean;
}

export interface DemoDataIds {
  subjects: number[];
  habits: number[];
  spaces: number[];
  ratings: number[];
}

interface OnboardingState {
  // Has the user seen the onboarding modal?
  hasSeenOnboarding: boolean;
  // What did they choose at the end?
  onboardingChoice: OnboardingChoice;
  // Is the getting-started card dismissed?
  gettingStartedDismissed: boolean;
  // Track individual getting-started checklist items
  gettingStartedTasks: GettingStartedTask[];
  // Track if confetti was fired
  hasSeenConfetti: boolean;
  // Track temporarily generated demo data during the tour
  demoDataIds: DemoDataIds | null;

  // Actions
  markOnboardingComplete: (choice: OnboardingChoice) => void;
  dismissGettingStarted: () => void;
  completeTask: (id: GettingStartedTask['id']) => void;
  resetOnboarding: () => void;
  markConfettiSeen: () => void;
  setDemoDataIds: (ids: DemoDataIds | null) => void;
}

const DEFAULT_TASKS: GettingStartedTask[] = [
  { id: 'create-subject', label: 'Create a subject', completed: false },
  { id: 'start-session', label: 'Start your first focus session', completed: false },
  { id: 'add-habit', label: 'Add a habit with a bad day plan', completed: false },
  { id: 'complete-review', label: 'Complete a daily review', completed: false },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      onboardingChoice: null,
      gettingStartedDismissed: false,
      gettingStartedTasks: DEFAULT_TASKS,
      hasSeenConfetti: false,
      demoDataIds: null,

      markOnboardingComplete: (choice) =>
        set({ hasSeenOnboarding: true, onboardingChoice: choice }),

      dismissGettingStarted: () => set({ gettingStartedDismissed: true }),

      completeTask: (id) =>
        set((state) => ({
          gettingStartedTasks: state.gettingStartedTasks.map((t) =>
            t.id === id ? { ...t, completed: true } : t,
          ),
        })),

      markConfettiSeen: () => set({ hasSeenConfetti: true }),
      setDemoDataIds: (ids) => set({ demoDataIds: ids }),

      resetOnboarding: () =>
        set({
          hasSeenOnboarding: false,
          onboardingChoice: null,
          gettingStartedDismissed: false,
          gettingStartedTasks: DEFAULT_TASKS,
          hasSeenConfetti: false,
          demoDataIds: null,
        }),
    }),
    {
      name: 'onboarding-storage',
    },
  ),
);
