'use client';
import React from 'react';
import { pad } from '@/lib/utils';

type ClockTimeProps = {
  hours: number;
  minutes: number;
  seconds: number;
  color?: string;
  isOverflow?: boolean;
};

function ClockTime({ hours, minutes, seconds, color, isOverflow }: ClockTimeProps) {
  const Color = color ? 'white' : 'primary';
  return (
    <div className="relative text-4xl font-bold flex items-center justify-center">
      <h1 className={`font-bold  text-${Color}`}>
        {isOverflow ? '+' : ''}
        {pad(hours)} : {pad(minutes)} : {pad(seconds)}
      </h1>
    </div>
  );
}

export default ClockTime;
