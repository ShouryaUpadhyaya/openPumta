'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDashboardStats, useSubjectsWithLogs } from '@/hooks/useStats';
import { computeSessionStats, computeDayOfWeekPattern } from '@/app/stats/lib/metrics';
import { StatsSkeleton } from './Stats/StatsSkeleton';
import { FocusTimeChart } from './Stats/FocusTimeChart';
import { HabitConsistencyChart } from './Stats/HabitConsistencyChart';
import { WeeklyPatternChart } from './Stats/WeeklyPatternChart';
import { SessionStatsCard } from './Stats/SessionStatsCard';

import { useTimerStore } from '@/store/useTimerStore';
import { getLocalIsoDate } from '@/lib/utils';

const FALLBACK_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF8042'];

function Stats() {
  const { data: statsData, isLoading: isLoadingDashboard } = useDashboardStats();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsWithLogs();

  const [chartColors, setChartColors] = useState<string[]>(FALLBACK_COLORS);

  const store = useTimerStore();
  const [localNow, setLocalNow] = useState(() => Date.now());

  useEffect(() => {
    if (store.phase === 'work' && store.running) {
      const interval = setInterval(() => setLocalNow(Date.now()), 10000);
      return () => clearInterval(interval);
    }
  }, [store.phase, store.running]);

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

  const augmentedSubjects = useMemo(() => {
    if (!subjects) return [];
    if (store.phase === 'work' && store.running && store.activeSubjectId && store.phaseStartedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return subjects.map((s: any) => {
        if (s.id === store.activeSubjectId) {
          return {
            ...s,
            subjectLogs: [
              ...(s.subjectLogs || []),
              {
                id: 'active',
                startedAt: new Date(store.phaseStartedAt as number).toISOString(),
                endedAt: new Date(localNow).toISOString(),
              },
            ],
          };
        }
        return s;
      });
    }
    return subjects;
  }, [subjects, store.phase, store.running, store.activeSubjectId, store.phaseStartedAt, localNow]);

  const augmentedFocusData = useMemo(() => {
    const arr = statsData?.focusTimeArray || [];
    if (store.phase === 'work' && store.running && store.activeSubjectId && store.phaseStartedAt) {
      const durationHrs = (localNow - (store.phaseStartedAt as number)) / 1000 / 3600;
      const todayIso = getLocalIsoDate(new Date(store.phaseStartedAt as number));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = arr.find((l: any) => l.date === todayIso);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const others = arr.filter((l: any) => l.date !== todayIso);
      return [
        ...others,
        {
          date: todayIso,
          focusTimeHrs: (existing?.focusTimeHrs || 0) + durationHrs,
        },
      ].sort((a, b) => a.date.localeCompare(b.date));
    }
    return arr;
  }, [
    statsData,
    store.phase,
    store.running,
    store.activeSubjectId,
    store.phaseStartedAt,
    localNow,
  ]);

  const sessionStats = useMemo(() => computeSessionStats(augmentedSubjects), [augmentedSubjects]);
  const dayOfWeek = useMemo(() => computeDayOfWeekPattern(augmentedSubjects), [augmentedSubjects]);

  if (isLoadingDashboard || isLoadingSubjects) {
    return <StatsSkeleton />;
  }

  const focusData =
    augmentedFocusData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: d.focusTimeHrs,
      }))
      .slice(-7) || [];

  const habitData =
    statsData?.habitCompletionRateByDate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate: d.rate,
      }))
      .slice(-7) || [];

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden overflow-y-auto custom-scrollbar">
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
