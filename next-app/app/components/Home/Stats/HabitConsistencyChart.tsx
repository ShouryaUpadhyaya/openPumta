import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HabitConsistencyChartProps {
  data: { date: string; rate: number }[];
  color: string;
}

export function HabitConsistencyChart({ data, color }: HabitConsistencyChartProps) {
  return (
    <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm font-medium">Habit Consistency</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={color}
              fillOpacity={1}
              fill="url(#colorRate)"
              name="Completion %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
