'use client';

import {
  getAvatarStage,
  getAvatarImagePath,
  AvatarSet,
  getNextMilestone,
} from '@/lib/avatarConfig';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

interface AvatarDisplayProps {
  activeAvatar: AvatarSet;
  focusMs: number;
  onClick?: () => void;
}

export function AvatarDisplay({ activeAvatar, focusMs, onClick }: AvatarDisplayProps) {
  const currentStage = getAvatarStage(focusMs);
  const nextMilestone = getNextMilestone(focusMs);
  const imagePath = getAvatarImagePath(activeAvatar, currentStage.stage);

  // Calculate progress to next milestone
  let progressPercent = 100;
  if (nextMilestone) {
    const currentThreshold = currentStage.thresholdMs;
    const nextThreshold = nextMilestone.thresholdMs;
    const range = nextThreshold - currentThreshold;
    const currentProgress = focusMs - currentThreshold;
    progressPercent = Math.min(100, Math.max(0, (currentProgress / range) * 100));
  }

  return (
    <div
      className="flex flex-col items-center justify-center relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 transition-transform duration-300 hover:scale-105">
        <Image
          src={imagePath}
          alt={`Avatar Stage ${currentStage.stage}`}
          fill
          className="object-contain"
        />
      </div>

      {nextMilestone && (
        <div className="w-full max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">
          <Progress value={progressPercent} className="h-1.5" />
          <div className="text-[10px] text-muted-foreground text-center mt-1">
            {nextMilestone.label}
          </div>
        </div>
      )}
    </div>
  );
}
