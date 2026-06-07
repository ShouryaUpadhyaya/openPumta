import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

interface GoalRealityBarsProps {
  data: { subject: string; actual: number; goal: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const actualH = Math.floor(d.actual);
    const actualM = Math.round((d.actual - actualH) * 60);
    const goalH = Math.floor(d.goal);
    const goalM = Math.round((d.goal - goalH) * 60);

    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-md text-sm">
        <p className="font-bold text-foreground mb-2">{d.subject}</p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Actual:</span>
          <span className="font-semibold text-primary">
            {actualH > 0 ? `${actualH}h ` : ''}
            {actualM}m
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Goal:</span>
          <span className="font-semibold">
            {goalH > 0 ? `${goalH}h ` : ''}
            {goalM}m
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground text-right">
          {Math.round((d.actual / d.goal) * 100)}% of goal
        </div>
      </div>
    );
  }
  return null;
};

export default function GoalRealityBars({ data }: GoalRealityBarsProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[400px]">
      <h3 className="text-lg font-bold text-foreground mb-1">Goal vs Reality</h3>
      <p className="text-xs text-muted-foreground mb-4">Subject focus time compared to goals</p>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}h`}
            />
            <YAxis
              type="category"
              dataKey="subject"
              tick={{ fontSize: 12, fill: 'var(--foreground)', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />

            {/* Background Bar (Goal) */}
            <Bar dataKey="goal" fill="var(--muted)" radius={[0, 4, 4, 0]} barSize={24} />

            {/* Foreground Bar (Actual) */}
            <Bar dataKey="actual" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-primary opacity-80" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span>Goal</span>
        </div>
      </div>
    </div>
  );
}
