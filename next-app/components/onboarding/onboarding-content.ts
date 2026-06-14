export type SlideMode = 'full' | 'tour';

export interface OnboardingSlide {
  id: string;
  mode: SlideMode;
  title: string;
  subtitle?: string;
  body: string[];
  caption?: string;
  illustration:
    | 'flow'
    | 'subjects'
    | 'habits'
    | 'workspace'
    | 'analytics'
    | 'export'
    | 'opensource';
  cta: string;
  // For tour mode: where to navigate + what to highlight
  route?: string;
  highlightTarget?: string;
  tourLabel?: string; // short one-liner shown in compact card
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    mode: 'full',
    title: 'Welcome to OpenPumta',
    subtitle: 'A system for deliberate practice and long-term skill development.',
    body: [
      'Track what you study. Build habits that support it.',
      'Plan your work. Journal. Reflect on your progress.',
      'Understand your patterns.',
    ],
    illustration: 'flow',
    cta: 'Get Started',
  },
  {
    id: 'subjects',
    mode: 'tour',
    title: "Track What You're Actually Learning",
    body: ['Every focus session belongs to a subject.', 'See exactly where your effort goes.'],
    illustration: 'subjects',
    cta: 'Continue',
    route: '/',
    highlightTarget: 'subjects-section',
    tourLabel: 'Your subjects and study time live here.',
  },
  {
    id: 'habits',
    mode: 'tour',
    title: 'Build Systems, Not Motivation',
    body: [
      'Habits create consistency when motivation disappears.',
      'Link habits to subjects. Define a bad-day plan.',
    ],
    caption: 'Small actions compound.',
    illustration: 'habits',
    cta: 'Continue',
    route: '/',
    highlightTarget: 'habits-section',
    tourLabel: 'Track daily habits and build real consistency.',
  },
  {
    id: 'workspace',
    mode: 'tour',
    title: 'Turn Goals Into Action',
    body: [
      'Capture ideas, organize projects, and manage tasks.',
      'Everything in one place, without leaving your study environment.',
    ],
    illustration: 'workspace',
    cta: 'Continue',
    route: '/todo',
    highlightTarget: 'workspace-page',
    tourLabel: 'Plan and organise work in your Workspace.',
  },
  {
    id: 'analytics',
    mode: 'tour',
    title: 'Understand Your Patterns',
    body: [
      'Most apps stop at streaks. OpenPumta goes further.',
      'Focus trends, consistency, weekly patterns, goal vs reality.',
    ],
    illustration: 'analytics',
    cta: 'Continue',
    route: '/stats',
    highlightTarget: 'stats-page',
    tourLabel: 'Deep analytics reveal patterns over time.',
  },
  {
    id: 'export',
    mode: 'tour',
    title: 'Your Data Belongs To You',
    body: [
      'Export everything whenever you want.',
      'No lock-in. No hidden ownership. Your history is yours — forever.',
    ],
    illustration: 'export',
    cta: 'Continue',
    route: '/settings',
    highlightTarget: 'export-section',
    tourLabel: 'Export your data anytime from Settings.',
  },
  {
    id: 'opensource',
    mode: 'full',
    title: 'Built In Public',
    body: [
      'OpenPumta is open source.',
      'Inspect the code. Suggest improvements. Report issues. Submit pull requests.',
      'Your feedback is always appreciated.',
    ],
    illustration: 'opensource',
    cta: 'Finish Setup',
  },
];
