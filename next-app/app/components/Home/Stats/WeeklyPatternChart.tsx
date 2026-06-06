import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface WeeklyPatternChartProps {
  data: { day: string; avgHours: number; totalSessions: number }[];
  color: string;
}

export function WeeklyPatternChart({ data, color }: WeeklyPatternChartProps) {
  return (
    <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
      <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
        <Calendar className="h-4 w-4" style={{ color }} />
        <CardTitle className="text-sm font-medium">Weekly Pattern</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none' }}
            />
            <Bar dataKey="avgHours" fill={color} radius={[6, 6, 0, 0]} name="Avg Hrs" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
