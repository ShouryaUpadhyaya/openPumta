'use client';

import React, { useMemo, useState } from 'react';
import {
  useDashboardStats,
  useDailyTimeline,
  useSubjectsWithLogs,
  useDailyRatings21,
  useTodosAll,
  useHabitsWithLogs21,
} from '@/hooks/useStats';
import { useChartThemeStore } from '@/store/useChartThemeStore';
import {
  computeFocusTrend,
  computeSubjectDistribution,
  computeGoalProgress,
  computeHabitStreaks,
  computeTaskCompletion,
  computeBurnoutRisk,
  computeProductivityScore,
} from './lib/metrics';
import OverviewGrid from '../components/stats/OverviewGrid';
import DailyTimeline from '../components/stats/DailyTimeline';
import DetailedView from '../components/stats/DetailedView';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export default function StatsPage() {
  const theme = useChartThemeStore((s) => s.getTheme());
  const { data: statsData, isLoading } = useDashboardStats();
  const { data: timeline = [] } = useDailyTimeline();
  const { data: subjects } = useSubjectsWithLogs();
  const { data: ratingStats } = useDailyRatings21();
  const { data: todos } = useTodosAll();
  const { data: habitsData } = useHabitsWithLogs21();
  const [showDetailed, setShowDetailed] = useState(false);

  // ── Compute overview metrics ──────────────────────────────────────────────
  const focusTrend = useMemo(() => computeFocusTrend(statsData?.focusTimeArray || []), [statsData]);
  const subjectDist = useMemo(() => computeSubjectDistribution(subjects || []), [subjects]);
  const goalProgress = useMemo(() => computeGoalProgress(subjects || []), [subjects]);
  const habitStreaks = useMemo(() => computeHabitStreaks(habitsData || []), [habitsData]);
  const taskCompletion = useMemo(() => computeTaskCompletion(todos || []), [todos]);

  const overallHabitConsistency = useMemo(() => {
    if (!habitStreaks.length) return 0;
    return Math.round(habitStreaks.reduce((s, h) => s + h.consistency, 0) / habitStreaks.length);
  }, [habitStreaks]);

  const burnout = useMemo(
    () =>
      computeBurnoutRisk(focusTrend, ratingStats?.weeklyAverage ?? null, overallHabitConsistency),
    [focusTrend, ratingStats, overallHabitConsistency],
  );

  const productivityScore = useMemo(() => {
    const avgGoalPct = goalProgress.length
      ? Math.round(goalProgress.reduce((s, g) => s + g.pct, 0) / goalProgress.length)
      : 0;
    const moodNorm = ratingStats?.weeklyAverage ? (ratingStats.weeklyAverage / 5) * 100 : 50;
    return computeProductivityScore(
      avgGoalPct,
      overallHabitConsistency,
      taskCompletion.rate,
      moodNorm,
    );
  }, [goalProgress, overallHabitConsistency, taskCompletion, ratingStats]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6 pb-28 max-w-[1400px] mx-auto">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/20 text-primary">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground text-sm">Your 21-day overview</p>
        </div>
      </div>

      {/* ── Overview Grid (12 KEEP metrics) ──────────────────────────────── */}
      <OverviewGrid
        theme={theme}
        statsData={statsData}
        subjects={subjects}
        ratingStats={ratingStats}
        todos={todos}
        habitsData={habitsData}
        focusTrend={focusTrend}
        subjectDist={subjectDist}
        goalProgress={goalProgress}
        habitStreaks={habitStreaks}
        taskCompletion={taskCompletion}
        overallHabitConsistency={overallHabitConsistency}
        burnout={burnout}
        productivityScore={productivityScore}
      />

      {/* ── Daily Timeline ───────────────────────────────────────────────── */}
      <div className="mt-4">
        <DailyTimeline timeline={timeline} accentColor={theme.colors[0]} />
      </div>

      {/* ── Deep Dive Toggle ─────────────────────────────────────────────── */}
      <div className="mt-6">
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            {showDetailed ? 'Hide' : 'Show'} Deep Dive Analytics
          </span>
          {showDetailed ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors animate-bounce" />
          )}
        </button>
      </div>

      {/* ── Detailed View (18 deep-dive metrics) ─────────────────────────── */}
      {showDetailed && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DetailedView
            theme={theme}
            subjects={subjects}
            todos={todos}
            habitsData={habitsData}
            ratingStats={ratingStats}
            statsData={statsData}
          />
        </div>
      )}
    </main>
  );
}
