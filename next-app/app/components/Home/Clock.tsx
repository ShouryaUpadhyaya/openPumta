'use client';

import React from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { ConvertSecsToTimer } from '@/lib/utils';
import ClockCircle from '../pomodoro/ClockCircle';
import ClockTime from '../pomodoro/ClockTime';
import ClockDialogBox from '../ClockDialogBox';

function Clock() {
  const store = useTimerStore();
  const { remainingMs, progress, phase, mode } = useTimerEngine();

  const isOverflow = remainingMs < 0;
  const displayMs = Math.abs(remainingMs);

  const { hours, minutes, seconds } = ConvertSecsToTimer({
    workSecs: Math.floor(displayMs / 1000),
  });

  const getPhaseColor = () => {
    if (mode === 'stopwatch') return store.workColor;
    switch (phase) {
      case 'work':
        return store.workColor;
      case 'shortBreak':
        return store.shortBreakColor;
      case 'longBreak':
        return store.longBreakColor;
      default:
        return store.workColor;
    }
  };

  const primaryColor = getPhaseColor();
  const secondaryColor = `color-mix(in srgb, ${primaryColor} 50%, white)`;
  const loopIndex = Math.floor(progress / 100);
  const cyclePercent = progress % 100;

  let currentColor = primaryColor;
  let backgroundColor = 'var(--card)';
  if (loopIndex > 0) {
    if (loopIndex % 2 === 1) {
      currentColor = secondaryColor;
      backgroundColor = primaryColor;
    } else {
      currentColor = primaryColor;
      backgroundColor = secondaryColor;
    }
  }

  return (
    <section className="flex justify-center items-center scale-90 lg:scale-100">
      <ClockDialogBox
        child={
          <div className="relative flex justify-center items-center transition-transform hover:scale-105 duration-300">
            <ClockCircle
              percent={cyclePercent}
              size={'sm'}
              currentColor={currentColor}
              backgroundColor={backgroundColor}
            />
            <div className="absolute">
              <ClockTime
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                color={'#fff'}
                isOverflow={isOverflow}
              />
            </div>
          </div>
        }
      />
    </section>
  );
}

export default Clock;
