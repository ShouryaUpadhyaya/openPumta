'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from './onboarding-progress';
import type { OnboardingSlide } from './onboarding-content';

interface OnboardingTourCardProps {
  slide: OnboardingSlide;
  slideIndex: number;
  totalSlides: number;
  direction: number;
  slideKey: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  canGoPrev: boolean;
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
  }),
};

export function OnboardingTourCard({
  slide,
  slideIndex,
  totalSlides,
  direction,
  slideKey,
  onNext,
  onPrev,
  onSkip,
  canGoPrev,
}: OnboardingTourCardProps) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border/40 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
      role="dialog"
      aria-modal="false"
      aria-label={`Tour: ${slide.title}`}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <OnboardingProgress total={totalSlides} current={slideIndex} />
        <button
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tour label chip */}
      <div className="px-4 pb-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live Tour
        </span>
      </div>

      {/* Slide content */}
      <div className="px-4 pb-2 min-h-[80px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slideKey}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <h3 className="text-base font-bold text-foreground leading-tight mb-1.5">
              {slide.title}
            </h3>
            {slide.tourLabel && (
              <p className="text-sm text-muted-foreground leading-relaxed">{slide.tourLabel}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border/30 mt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="gap-1.5 text-muted-foreground"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <span className="text-xs text-muted-foreground">
          {slideIndex + 1} / {totalSlides}
        </span>

        <Button
          size="sm"
          onClick={onNext}
          className="gap-1.5 bg-primary hover:bg-primary/90"
          aria-label="Next step"
        >
          {slide.cta}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
