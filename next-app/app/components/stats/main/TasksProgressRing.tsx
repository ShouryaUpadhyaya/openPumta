import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface TasksProgressRingProps {
  done: number;
  pending: number;
  cancelled: number;
  inProgress: number;
}

export default function TasksProgressRing({
  done,
  pending,
  cancelled,
  inProgress,
}: TasksProgressRingProps) {
  const total = done + pending + cancelled + inProgress;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // For RadialBarChart, we want a background ring (grey) and a foreground ring (primary).
  // Easiest way in Recharts is to provide one data point with the percentage.
  const data = [
    {
      name: 'Tasks',
      value: pct,
      fill: 'var(--primary)',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full min-h-[220px]">
      <h3 className="text-lg font-bold text-foreground mb-2">Task Completion</h3>

      <div className="flex-1 flex items-center">
        {/* Ring */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={10}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-foreground">{pct}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="ml-6 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {done} / {total}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">{inProgress} In Prog</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">{pending} Wait</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
