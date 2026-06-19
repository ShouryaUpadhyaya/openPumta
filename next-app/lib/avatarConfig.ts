export type AvatarSet = 'bunny' | 'pup' | 'hatch' | 'warrior';

export interface Milestone {
  stage: number;
  thresholdMs: number; // The minimum focus time needed to reach this stage
  label: string; // The UI label for the threshold (e.g., '01:00:00')
}

// Based on the user screenshots, milestones are at 1h, 2h, ... 10h.
// We will also add a 0h (base) stage, and maybe a 10m stage as mentioned in the original prompt if needed,
// but screenshots show strictly 1h increments up to 10h.
export const AVATAR_MILESTONES: Milestone[] = [
  { stage: 0, thresholdMs: 0, label: '00:00:00' },
  { stage: 1, thresholdMs: 1 * 60 * 60 * 1000, label: '01:00:00' },
  { stage: 2, thresholdMs: 2 * 60 * 60 * 1000, label: '02:00:00' },
  { stage: 3, thresholdMs: 3 * 60 * 60 * 1000, label: '03:00:00' },
  { stage: 4, thresholdMs: 4 * 60 * 60 * 1000, label: '04:00:00' },
  { stage: 5, thresholdMs: 5 * 60 * 60 * 1000, label: '05:00:00' },
  { stage: 6, thresholdMs: 6 * 60 * 60 * 1000, label: '06:00:00' },
  { stage: 7, thresholdMs: 7 * 60 * 60 * 1000, label: '07:00:00' },
  { stage: 8, thresholdMs: 8 * 60 * 60 * 1000, label: '08:00:00' },
  { stage: 9, thresholdMs: 10 * 60 * 60 * 1000, label: '10:00:00' }, // Notice it jumps to 10h in screenshot
];

export const AVATAR_SETS: { id: AvatarSet; name: string; description: string }[] = [
  {
    id: 'bunny',
    name: 'Confi Bunny',
    description: "Believe you can, then jump. Believe you can, and you're already halfway there.",
  },
  {
    id: 'pup',
    name: 'Smart Pup',
    description: 'Think fast, keep your paws steady. Run toward your goal again today!',
  },
  {
    id: 'hatch',
    name: 'Giant Bird-Hatch!',
    description: "I'm still small, right? I grow when I study. Becoming a Mega Bird-Hatch...",
  },
  { id: 'warrior', name: 'Warrior Deity', description: 'Focus like a warrior deity.' },
];

export function getAvatarStage(focusMs: number): Milestone {
  // Find the highest milestone the user has reached
  for (let i = AVATAR_MILESTONES.length - 1; i >= 0; i--) {
    if (focusMs >= AVATAR_MILESTONES[i].thresholdMs) {
      return AVATAR_MILESTONES[i];
    }
  }
  return AVATAR_MILESTONES[0];
}

export function getNextMilestone(focusMs: number): Milestone | null {
  for (let i = 0; i < AVATAR_MILESTONES.length; i++) {
    if (focusMs < AVATAR_MILESTONES[i].thresholdMs) {
      return AVATAR_MILESTONES[i];
    }
  }
  return null; // Reached the max
}

export function getAvatarImagePath(avatarSet: AvatarSet, stage: number): string {
  // We'll use a placeholder URL generator or local SVG path here.
  // Since we don't have the actual assets, we'll map to a cute placeholder or an SVG string.
  // In a real app, this would be `/avatars/${avatarSet}/stage${stage}.svg` or similar.
  // For the sake of the demo, let's assume we have them in public/avatars/ or use a fallback.
  return `/avatars/${avatarSet}/stage${stage}.svg`;
}
