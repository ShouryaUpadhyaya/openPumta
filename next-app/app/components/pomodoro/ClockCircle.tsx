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
      className={`relative my-4 mx-2 flex items-center justify-center ${
        size === 'sm'
          ? 'h-[55vw] w-[55vw] xs:h-[60vw] xs:w-[60vw] sm:h-64 sm:w-64 max-w-64 max-h-64 min-h-[180px] min-w-[180px]'
          : 'h-[70vw] w-[70vw] xl:h-[60vh] xl:w-[60vw] xs:h-[75vw] xs:w-[75vw] sm:h-[45vh] sm:w-[45vh] max-w-3xl max-h-3xl '
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
