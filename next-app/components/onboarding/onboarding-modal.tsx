'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { ONBOARDING_SLIDES } from './onboarding-content';
import { OnboardingProgress } from './onboarding-progress';
import { OnboardingSlidePanel } from './onboarding-slide';
import { OnboardingTourCard } from './onboarding-tour-card';
import { OnboardingSpotlight } from './onboarding-spotlight';
import { OnboardingCompletion } from './onboarding-completion';
import { generateDemoData, removeDemoData } from './demo-data-generator';
import { useAuthStore } from '@/store/useAuthStore';
import { queryClient } from '@/lib/queryClient';

const TOTAL = ONBOARDING_SLIDES.length;

export function OnboardingModal() {
  const router = useRouter();
  const { hasSeenOnboarding, markOnboardingComplete, demoDataIds, setDemoDataIds } =
    useOnboardingStore();
  const { user } = useAuthStore();

  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showCompletion, setShowCompletion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const generationAttempted = useRef(false);

  // Hydration guard — deferred to avoid set-state-in-effect lint rule
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Auto-generate temporary demo data for the tour ────────────────────────
  useEffect(() => {
    if (!mounted || hasSeenOnboarding || demoDataIds || generationAttempted.current || user) return;
    generationAttempted.current = true;
    requestAnimationFrame(() => setIsGenerating(true));
    generateDemoData()
      .then((ids) => {
        setDemoDataIds(ids);
        setIsGenerating(false);
      })
      .catch(() => {
        setIsGenerating(false);
      });
  }, [mounted, hasSeenOnboarding, demoDataIds, setDemoDataIds, user]);

  const cleanupDemoData = useCallback(async () => {
    if (demoDataIds) {
      const ids = demoDataIds;
      setDemoDataIds(null); // Clear immediately to prevent double-calls
      await removeDemoData(ids, false);
    }
  }, [demoDataIds, setDemoDataIds]);

  const currentSlide = ONBOARDING_SLIDES[slideIndex];
  const isFullMode = currentSlide?.mode === 'full' || showCompletion;
  const isTourMode = currentSlide?.mode === 'tour' && !showCompletion;

  // ── Navigate to the relevant page when entering tour slides ──────────────────
  useEffect(() => {
    if (!mounted || hasSeenOnboarding) return;
    if (isTourMode && currentSlide?.route) {
      router.push(currentSlide.route);
    }
  }, [slideIndex, mounted, hasSeenOnboarding, isTourMode, currentSlide?.route, router]);

  // ── Focus trap ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || hasSeenOnboarding) return;
    firstFocusableRef.current?.focus();
  }, [mounted, hasSeenOnboarding, showCompletion, slideIndex]);

  useEffect(() => {
    if (hasSeenOnboarding || !mounted) return;

    const handleFocusIn = (e: FocusEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        firstFocusableRef.current?.focus();
      }
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [hasSeenOnboarding, mounted]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    cleanupDemoData();
    markOnboardingComplete('fresh');
    window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    queryClient.clear();
    window.location.href = '/';
  }, [markOnboardingComplete, cleanupDemoData]);

  const handleNext = useCallback(() => {
    if (showCompletion || isGenerating) return;
    if (slideIndex === TOTAL - 1) {
      setShowCompletion(true);
      return;
    }
    setDirection(1);
    setSlideIndex((i) => Math.min(i + 1, TOTAL - 1));
  }, [slideIndex, showCompletion, isGenerating]);

  const handlePrev = useCallback(() => {
    if (showCompletion) {
      setShowCompletion(false);
      setDirection(-1);
      return;
    }
    if (slideIndex === 0) return;
    setDirection(-1);
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, [slideIndex, showCompletion]);

  useEffect(() => {
    if (hasSeenOnboarding) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [hasSeenOnboarding, handleSkip, handleNext, handlePrev]);

  // ─────────────────────────────────────────────────────────────────────────────

  if (!mounted || hasSeenOnboarding) return null;

  return (
    <>
      {/* ── Spotlight for tour slides ─────────────────────────────────────────── */}
      <OnboardingSpotlight
        targetId={isTourMode ? currentSlide?.highlightTarget : undefined}
        visible={isTourMode}
      />

      {/* ── Compact tour card ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isTourMode && (
          <OnboardingTourCard
            slide={currentSlide}
            slideIndex={slideIndex}
            totalSlides={TOTAL}
            direction={direction}
            slideKey={`tour-${currentSlide.id}`}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            canGoPrev={slideIndex > 0}
          />
        )}
      </AnimatePresence>

      {/* ── Full modal (slides 1, 7, completion) ──────────────────────────────── */}
      <AnimatePresence>
        {isFullMode && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={handleSkip}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label="OpenPumta onboarding"
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-[720px] bg-card border border-border/30 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden max-h-[90vh]">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                  <OnboardingProgress
                    total={TOTAL}
                    current={showCompletion ? TOTAL - 1 : slideIndex}
                  />
                  <button
                    ref={firstFocusableRef}
                    onClick={handleSkip}
                    aria-label="Skip onboarding"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    Skip
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                  {showCompletion ? (
                    <OnboardingCompletion onClose={() => {}} />
                  ) : (
                    <OnboardingSlidePanel
                      slide={currentSlide}
                      direction={direction}
                      slideKey={currentSlide.id}
                    />
                  )}
                </div>

                {/* Bottom nav (hidden on completion — it has its own CTAs) */}
                {!showCompletion && (
                  <div className="flex items-center justify-between px-6 pb-5 pt-3 border-t border-border/20 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrev}
                      disabled={slideIndex === 0}
                      aria-label="Previous slide"
                      className="gap-1.5 text-muted-foreground disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>

                    <span className="text-xs text-muted-foreground" aria-live="polite">
                      {slideIndex + 1} of {TOTAL}
                    </span>

                    <Button
                      size="sm"
                      onClick={handleNext}
                      disabled={isGenerating}
                      aria-label={currentSlide.cta}
                      className="gap-1.5 bg-primary hover:bg-primary/90 min-w-[110px]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {currentSlide.cta}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
