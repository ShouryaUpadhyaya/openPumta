'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardStats, useSubjectsWithLogs } from '@/hooks/useStats';
import { computeSessionStats, computeDayOfWeekPattern } from '@/app/stats/lib/metrics';
import { StatsSkeleton } from './Stats/StatsSkeleton';
import { FocusTimeChart } from './Stats/FocusTimeChart';
import { HabitConsistencyChart } from './Stats/HabitConsistencyChart';
import { WeeklyPatternChart } from './Stats/WeeklyPatternChart';
import { SessionStatsCard } from './Stats/SessionStatsCard';

const FALLBACK_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF8042'];

function Stats() {
  const { data: statsData, isLoading: isLoadingDashboard } = useDashboardStats();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsWithLogs();

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

  const sessionStats = useMemo(() => computeSessionStats(subjects || []), [subjects]);
  const dayOfWeek = useMemo(() => computeDayOfWeekPattern(subjects || []), [subjects]);

  if (isLoadingDashboard || isLoadingSubjects) {
    return <StatsSkeleton />;
  }

  const focusData =
    statsData?.focusTimeArray
      ?.map((d: { date: string | number | Date; focusTimeHrs: number }) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: d.focusTimeHrs,
      }))
      .slice(-7) || [];

  const habitData =
    statsData?.habitCompletionRateByDate
      ?.map((d: { date: string | number | Date; rate: number }) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate: d.rate,
      }))
      .slice(-7) || [];

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden overflow-y-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-75 lg:h-100 mb-4 shrink-0">
        <FocusTimeChart data={focusData} color={chartColors[0]} />
        <HabitConsistencyChart data={habitData} color={chartColors[1]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-62.5 lg:h-75 shrink-0">
        <WeeklyPatternChart data={dayOfWeek} color={chartColors[2] || FALLBACK_COLORS[2]} />
        <SessionStatsCard stats={sessionStats} color={chartColors[0] || FALLBACK_COLORS[0]} />
      </div>
    </section>
  );
}

export default Stats;
