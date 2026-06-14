'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingIllustration } from './onboarding-illustration';
import type { OnboardingSlide } from './onboarding-content';

interface OnboardingSlideProps {
  slide: OnboardingSlide;
  direction: number; // 1 = forward, -1 = backward
  slideKey: string;
}

const variants = {
  enter: (direction: number) => ({
    x: direction * 50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction * -50,
    opacity: 0,
  }),
};

export function OnboardingSlidePanel({ slide, direction, slideKey }: OnboardingSlideProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={slideKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col md:flex-row gap-6 md:gap-10 items-center w-full"
      >
        {/* Illustration panel */}
        <div className="w-full md:w-[45%] flex items-center justify-center shrink-0 py-2">
          <div className="w-full max-w-[260px] md:max-w-none">
            <OnboardingIllustration type={slide.illustration} />
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {slide.subtitle && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              OpenPumta
            </p>
          )}

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-foreground">
            {slide.title}
          </h2>

          {slide.subtitle && (
            <p className="text-base text-muted-foreground leading-relaxed">{slide.subtitle}</p>
          )}

          <ul className="space-y-2">
            {slide.body.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                {line}
              </motion.li>
            ))}
          </ul>

          {slide.caption && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs italic text-primary/70 border-l-2 border-primary/30 pl-3 mt-2"
            >
              {slide.caption}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
