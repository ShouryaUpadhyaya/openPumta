'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingSpotlightProps {
  targetId: string | undefined;
  visible: boolean;
  padding?: number;
}

export function OnboardingSpotlight({ targetId, visible, padding = 10 }: OnboardingSpotlightProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const updateRect = useCallback(() => {
    if (!targetId) return;
    const el = document.querySelector(`[data-tour-highlight="${targetId}"]`);
    if (!el) return;

    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [targetId, padding]);

  // Handle initial focus and scrolling when target changes
  useEffect(() => {
    if (!visible || !targetId) return;

    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const maxAttempts = 30; // Up to 3 seconds of polling

    const tryFocus = () => {
      const el = document.querySelector(`[data-tour-highlight="${targetId}"]`);
      if (el) {
        // Element found, scroll it into view and update highlight
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updateRect();
      } else if (attempts < maxAttempts) {
        // Element not yet rendered, keep trying
        attempts++;
        timer = setTimeout(tryFocus, 100);
      }
    };

    // Wait a short moment to allow page transitions to begin
    timer = setTimeout(tryFocus, 300);

    return () => clearTimeout(timer);
  }, [visible, targetId, updateRect]);

  // Keep spotlight attached to the element during resize and scroll
  useEffect(() => {
    if (!visible) return;

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [visible, updateRect]);

  if (!rect) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dark overlay in 4 pieces around the spotlight hole */}
          {/* Top */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{
              background: `rgba(0,0,0,0)`,
              // Use box-shadow trick: clip everything except the rect hole
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.65)`,
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              borderRadius: '12px',
            }}
          />
          {/* Glowing ring around the target */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="fixed pointer-events-none z-40 rounded-xl"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: '0 0 0 2px rgba(249,115,22,0.8), 0 0 24px 4px rgba(249,115,22,0.25)',
              borderRadius: '12px',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
