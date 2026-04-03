'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardStats } from '@/hooks/useStats';

const FALLBACK_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF8042'];

function Stats() {
  const { user } = useAuthStore();
  const { data: statsData, isLoading } = useDashboardStats(user?.id);
  const [chartColors, setChartColors] = useState<string[]>(FALLBACK_COLORS);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const colors = [
      rootStyles.getPropertyValue('--chart-1').trim(),
      rootStyles.getPropertyValue('--chart-2').trim(),
      rootStyles.getPropertyValue('--chart-3').trim(),
      rootStyles.getPropertyValue('--chart-4').trim(),
      rootStyles.getPropertyValue('--chart-5').trim(),
    ].filter((color) => color);

    if (colors.length > 0) {
      requestAnimationFrame(() => {
        setChartColors(colors);
      });
    }
  }, []);

  if (isLoading) {
    return <div className="p-4 flex items-center justify-center">Loading statistics...</div>;
  }

  const focusData =
    statsData?.focusTimeArray
      ?.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: d.focusTimeHrs,
      }))
      .slice(-7) || [];

  const habitData =
    statsData?.habitCompletionRateByDate
      ?.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate: d.rate,
      }))
      .slice(-7) || [];

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold">21-Day Analytics</h1>
        {statsData?.summary && (
          <div className="flex gap-4 text-xs">
            <span className="text-muted-foreground">
              Perfect Days:{' '}
              <strong className="text-foreground">{statsData.summary.perfectDaysLast21}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium">Focus Time (Days)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="hours" fill={chartColors[0]} radius={[4, 4, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium">Habit Consistency</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={habitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[1]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors[1]} stopOpacity={0} />
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
                  stroke={chartColors[1]}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  name="Completion %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default Stats;
