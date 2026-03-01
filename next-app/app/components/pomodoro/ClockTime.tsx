'use client';
import React from 'react';
import { pad } from '@/lib/utils';

type ClockTimeProps = {
  hours: number;
  minutes: number;
  seconds: number;
  color?: string;
};

function ClockTime({ hours, minutes, seconds, color }: ClockTimeProps) {
  const Color = color ? 'white' : 'primary';
  return (
    <div className="relative text-4xl font-semibold">
      <h1 className={`font-bold  text-${Color}`}>
        {pad(hours)} : {pad(minutes)} : {pad(seconds)}
      </h1>
    </div>
  );
}

export default ClockTime;
