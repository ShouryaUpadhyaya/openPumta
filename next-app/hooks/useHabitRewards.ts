import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useHabitRewards(completedCount: number) {
  const prevCountRef = useRef<number>(completedCount);

  useEffect(() => {
    const prevCount = prevCountRef.current;

    if (completedCount > prevCount) {
      if (completedCount === 2) {
        // Small burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        });
      } else if (completedCount === 4) {
        // Great burst - Perfect day baseline
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#FFD700', '#FFA500'], // Golden perfection!
            }),
          );
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#FFD700', '#FFA500'],
            }),
          );
        }, 250);
      } else if (completedCount === 6) {
        // Maximum output - all habits completed!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#FFD700'],
        });
      }
    }
    prevCountRef.current = completedCount;
  }, [completedCount]);
}
