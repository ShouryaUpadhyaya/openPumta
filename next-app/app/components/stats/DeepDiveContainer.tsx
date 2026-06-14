import React, { useMemo } from 'react';
import type { Subject } from '@/types/subject';
import type { Habit } from '@/types/habit';
import type { DailyRating } from '@/types/rating';
import { TimelineItem } from '@/hooks/useStats';
import {
  computeFocusTrend,
  computeBurnoutRisk,
  computeHabitStreaks,
  computeGoalProgress,
} from '../../stats/lib/metrics';

// Deep Dive Components
import DetailedActivityTimeline from './deep-dive/DetailedActivityTimeline';
import FocusHabitsCorrelation from './deep-dive/FocusHabitsCorrelation';
import GoalRealityBars from './deep-dive/GoalRealityBars';
import BurnoutRiskAssessment from './deep-dive/BurnoutRiskAssessment';
import AdvancedPeriodTrends from './deep-dive/AdvancedPeriodTrends';
import { getLocalIsoDate } from '@/lib/utils';

interface DeepDiveContainerProps {
  focusLogs: { date: string; focusTimeSecs: number }[];
  timeline: TimelineItem[];
  subjects: Subject[];
  habitsData: Habit[];
  ratingStats: { ratings: DailyRating[]; weeklyAverage: number } | undefined;
}

export default function DeepDiveContainer({
  focusLogs,
  timeline,
  subjects,
  habitsData,
  ratingStats,
}: DeepDiveContainerProps) {
  const focusTrend = useMemo(() => computeFocusTrend(focusLogs), [focusLogs]);
  const habitStreaks = useMemo(() => computeHabitStreaks(habitsData), [habitsData]);

  const overallHabitConsistency = useMemo(() => {
    if (!habitStreaks.length) return 0;
    return Math.round(habitStreaks.reduce((s, h) => s + h.consistency, 0) / habitStreaks.length);
  }, [habitStreaks]);

  const burnout = useMemo(
    () =>
      computeBurnoutRisk(focusTrend, ratingStats?.weeklyAverage ?? null, overallHabitConsistency),
    [focusTrend, ratingStats, overallHabitConsistency],
  );

  // C11: Focus Habits Correlation
  const correlationData = useMemo(() => {
    const data = [];
    const d = new Date();
    d.setDate(d.getDate() - 30); // Last 30 days

    // Get habit completion mapping
    const habitMap = new Map<string, { total: number; done: number }>();
    habitsData.forEach((h) => {
      const logs = new Set(
        (h.log || []).filter((l) => !l.deleted).map((l) => l.startedAt.toString().split('T')[0]),
      );
      // We assume every habit is due every day for simple correlation
      for (let i = 0; i < 30; i++) {
        const testD = new Date(d.getTime() + i * 86400000).toISOString().split('T')[0];
        if (!habitMap.has(testD)) habitMap.set(testD, { total: 0, done: 0 });
        const val = habitMap.get(testD)!;
        val.total++;
        if (logs.has(testD)) val.done++;
      }
    });

    for (let i = 0; i < 30; i++) {
      const dStr = getLocalIsoDate(d);
      const log = focusLogs.find((l) => l.date === dStr);
      const focusHours = log ? log.focusTimeSecs / 3600 : 0;
      const hData = habitMap.get(dStr) || { total: 0, done: 0 };
      const habitRate = hData.total > 0 ? Math.round((hData.done / hData.total) * 100) : 0;

      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        focusHours,
        habitRate,
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [focusLogs, habitsData]);

  // C12: Goal Reality Bars
  const goalRealityData = useMemo(() => {
    return computeGoalProgress(subjects).map((g) => ({
      subject: g.name,
      actual: g.actual / 3600,
      goal: g.goal / 3600,
      color: g.color,
    }));
  }, [subjects]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-[600px]">
          <DetailedActivityTimeline timeline={timeline} />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-6 h-[600px]">
          <FocusHabitsCorrelation data={correlationData} />
          <AdvancedPeriodTrends trendData={focusTrend} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalRealityBars data={goalRealityData} />
        <BurnoutRiskAssessment data={burnout as any} />
      </div>
    </div>
  );
}
