'use client';

import { motion, LayoutGroup } from 'framer-motion';

interface OnboardingProgressProps {
  total: number;
  current: number; // 0-indexed
}

export function OnboardingProgress({ total, current }: OnboardingProgressProps) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      <LayoutGroup>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                i === current
                  ? 'bg-primary w-6'
                  : i < current
                    ? 'bg-primary/40 w-1.5'
                    : 'bg-white/10 w-1.5'
              }`}
            />
          ))}
        </div>
      </LayoutGroup>
      <span className="text-[10px] text-muted-foreground font-medium sr-only">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}
