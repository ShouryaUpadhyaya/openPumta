import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FocusTimeChartProps {
  data: { date: string; hours: number }[];
  color: string;
}

export function FocusTimeChart({ data, color }: FocusTimeChartProps) {
  return (
    <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm font-medium">Focus Time (Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none' }}
            />
            <Bar dataKey="hours" fill={color} radius={[4, 4, 0, 0]} name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
