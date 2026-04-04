'use client';
import React from 'react';

type ClockCircleProps = {
  size: 'sm' | 'lg';
  percent: number;
};

function ClockCircle({ percent, size }: ClockCircleProps) {
  return (
    <div
      className={`relative my-10 mx-5 flex items-center justify-center ${
        size === 'sm' ? 'h-90 w-90' : 'h-[50vh] w-[50vh]'
      }`}
    >
      <div
        className="absolute h-full w-full rounded-full"
        style={{
          background: `conic-gradient(var(--primary) ${percent}%, var(--card) 0)`,
          transition: 'background 0.5s ease-out',
        }}
      />
    </div>
  );
}

export default ClockCircle;
