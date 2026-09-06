'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  // Keep a ref to avoid stale closures in the scroll/resize handlers
  const targetIdRef = useRef(targetId);
  const paddingRef = useRef(padding);
  targetIdRef.current = targetId;
  paddingRef.current = padding;

  const measureRect = useCallback(() => {
    const id = targetIdRef.current;
    if (!id) return;
    const el = document.querySelector(`[data-tour-highlight="${id}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = paddingRef.current;
    setRect({ top: r.top - p, left: r.left - p, width: r.width + p * 2, height: r.height + p * 2 });
  }, []);

  // ── Find element, scroll it into view, then measure after scroll settles ───
  useEffect(() => {
    if (!visible || !targetId) {
      // Clear rect when not visible or no target
      if (!visible) setRect(null);
      return;
    }

    let rafId: number;
    let pollTimer: ReturnType<typeof setTimeout>;
    let scrollTimer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const MAX_ATTEMPTS = 40; // 4 seconds max

    const measureAfterScroll = () => {
      // Give scroll animation time to settle (smooth scroll takes ~300-600ms)
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        rafId = requestAnimationFrame(measureRect);
      }, 350);
    };

    const tryFindAndScroll = () => {
      const el = document.querySelector(`[data-tour-highlight="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        measureAfterScroll();
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        attempts++;
        pollTimer = setTimeout(tryFindAndScroll, 100);
        return;
      }

      setRect(null);
    };

    // Small initial delay to let page transition begin rendering
    pollTimer = setTimeout(tryFindAndScroll, 200);

    return () => {
      clearTimeout(pollTimer);
      clearTimeout(scrollTimer);
      cancelAnimationFrame(rafId);
    };
  }, [visible, targetId, measureRect]);

  // ── Re-measure on resize (element may reflow) ─────────────────────────────
  useEffect(() => {
    if (!visible || !rect) return;

    const onResize = () => {
      requestAnimationFrame(measureRect);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible, rect, measureRect]);

  // ── Re-measure after any scroll (catches manual scrolling during tour) ────
  useEffect(() => {
    if (!visible) return;

    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureRect);
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      cancelAnimationFrame(rafId);
    };
  }, [visible, measureRect]);

  return (
    <AnimatePresence>
      {visible && rect && (
        <>
          {/* Shadow overlay with cutout hole using box-shadow */}
          <motion.div
            key={`spotlight-shadow-${targetId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed pointer-events-none z-[9998]"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            }}
          />
          {/* Glowing ring */}
          <motion.div
            key={`spotlight-ring-${targetId}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="fixed pointer-events-none z-[9998]"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              borderRadius: '12px',
              boxShadow: '0 0 0 2px rgba(249,115,22,0.85), 0 0 28px 6px rgba(249,115,22,0.2)',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
