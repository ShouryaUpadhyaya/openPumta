'use client';
import React from 'react';

type ClockCircleProps = {
  size: 'sm' | 'lg';
  percent: number;
  children?: React.ReactNode;
  currentColor?: string;
  backgroundColor?: string;
};

function ClockCircle({
  percent,
  size,
  children,
  currentColor = 'var(--primary)',
  backgroundColor = 'var(--card)',
}: ClockCircleProps) {
  return (
    <div
      className={`relative my-2 mx-2 flex items-center justify-center ${
        size === 'sm'
          ? 'aspect-square h-[min(55vw,55vh)] w-[min(55vw,55vh)] sm:h-64 sm:w-64 max-w-64 max-h-64 min-h-[180px] min-w-[180px]'
          : 'aspect-square h-[min(70vw,48vh)] w-[min(70vw,48vh)] max-lg:landscape:h-[min(38vh,38vw)] max-lg:landscape:w-[min(38vh,38vw)] sm:h-[min(60vw,55vh)] sm:w-[min(60vw,55vh)] max-w-2xl max-h-2xl'
      }`}
    >
      <div
        className="absolute h-full w-full rounded-full"
        style={{
          background: `conic-gradient(${currentColor} ${percent}%, ${backgroundColor} 0)`,
          transition: 'background 0.5s ease-out',
        }}
      />
      <div className="absolute h-[92%] w-[92%] bg-background rounded-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default ClockCircle;
