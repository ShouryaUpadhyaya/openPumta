import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface WeeklyRadarChartProps {
  data: { day: string; hours: number }[];
}

export default function WeeklyRadarChart({ data }: WeeklyRadarChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[320px]">
      <h3 className="text-lg font-bold text-foreground mb-2">Weekly Pattern</h3>
      <p className="text-xs text-muted-foreground mb-4">Focus hours by day (current week)</p>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="day"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number) => [`${value} hours`, 'Focus']}
            />
            <Radar
              name="Focus"
              dataKey="hours"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
