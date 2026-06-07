import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface FocusHabitsCorrelationProps {
  data: { date: string; focusHours: number; habitRate: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-md text-sm">
        <p className="font-bold text-foreground mb-1">{d.date}</p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Focus:</span>
          <span className="font-semibold">{d.focusHours.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Habits:</span>
          <span className="font-semibold">{d.habitRate}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function FocusHabitsCorrelation({ data }: FocusHabitsCorrelationProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[400px]">
      <h3 className="text-lg font-bold text-foreground mb-1">Focus vs. Habits</h3>
      <p className="text-xs text-muted-foreground mb-4">Correlation over the last 30 days</p>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              type="number"
              dataKey="focusHours"
              name="Focus Hours"
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              label={{
                value: 'Focus Hours',
                position: 'bottom',
                fill: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="habitRate"
              name="Habit Success %"
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              label={{
                value: 'Habit Success %',
                angle: -90,
                position: 'insideLeft',
                fill: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: 'var(--muted)' }}
            />
            <Scatter name="Days" data={data} fill="var(--primary)" fillOpacity={0.7} line={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
