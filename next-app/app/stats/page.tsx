'use client';
import { Subject, SubjectLog } from '@/types/subject';
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
  computeFocusStreak,
  computeBurnoutRisk,
  computeHabitStreaks,
  computeGoalProgress,
} from './lib/metrics';

// Main Components
import MonthlyCalendarNav from '../components/stats/main/MonthlyCalendarNav';
import DailySummaryCard from '../components/stats/main/DailySummaryCard';
import WeeklyRadarChart from '../components/stats/main/WeeklyRadarChart';
import ConsistencyTracker from '../components/stats/main/ConsistencyTracker';
import FocusStackedBar from '../components/stats/main/FocusStackedBar';
import SubjectDonutChart from '../components/stats/main/SubjectDonutChart';
import SessionStatsPanel from '../components/stats/main/SessionStatsPanel';
import MoodOverviewPanel from '../components/stats/main/MoodOverviewPanel';
import TasksProgressRing from '../components/stats/main/TasksProgressRing';

// Deep Dive Components
import DetailedActivityTimeline from '../components/stats/deep-dive/DetailedActivityTimeline';
import FocusHabitsCorrelation from '../components/stats/deep-dive/FocusHabitsCorrelation';
import GoalRealityBars from '../components/stats/deep-dive/GoalRealityBars';
import BurnoutRiskAssessment from '../components/stats/deep-dive/BurnoutRiskAssessment';
import AdvancedPeriodTrends from '../components/stats/deep-dive/AdvancedPeriodTrends';

import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export default function StatsPage() {
  const theme = useChartThemeStore((s) => s.getTheme());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDeepDive, setShowDeepDive] = useState(false);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const { data: statsData, isLoading: isLoading1 } = useDashboardStats();
  const { data: timeline = [], isLoading: isLoading2 } = useDailyTimeline(selectedDateStr);
  const { data: subjects = [], isLoading: isLoading3 } = useSubjectsWithLogs();
  const { data: ratingStats, isLoading: isLoading4 } = useDailyRatings21();
  const { data: todos = [], isLoading: isLoading5 } = useTodosAll();
  const { data: habitsData = [], isLoading: isLoading6 } = useHabitsWithLogs21();

  const isLoading =
    isLoading1 || isLoading2 || isLoading3 || isLoading4 || isLoading5 || isLoading6;

  // ── Compute Metrics ────────────────────────────────────────────────────────

  const focusLogs = statsData?.focusTimeArray || [];
  const focusTrend = useMemo(() => computeFocusTrend(focusLogs), [focusLogs]);
  const focusStreak = useMemo(() => computeFocusStreak(subjects), [subjects]);

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

  // Daily Subject Focus (for Stacked Bar & Radar)
  const dailySubjectMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    subjects.forEach((s: Subject) => {
      (s.subjectLogs || []).forEach((log: SubjectLog) => {
        if (!log.endedAt) return;
        const dStr = log.startedAt.toString().split('T')[0];
        const dur =
          (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000 / 3600; // hours
        if (!map.has(dStr)) map.set(dStr, {});
        const dayData = map.get(dStr)!;
        dayData[s.name] = (dayData[s.name] || 0) + dur;
      });
    });
    return map;
  }, [subjects]);

  // C2: Daily Hours for selected date
  const dailyHours = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
    const item = focusLogs.find((l: any) => l.date === dStr);
    return item ? item.focusTimeSecs / 3600 : 0;
  }, [focusLogs, selectedDate]);

  // C3: Weekly Radar Data (current week ending on selected date)
  const weeklyRadarData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const d = new Date(selectedDate);
    // Go back 6 days to get a full 7 days ending today
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const dStr = d.toISOString().split('T')[0];
      const log = focusLogs.find((l: any) => l.date === dStr);
      data.push({
        day: dayNames[d.getDay()],
        hours: log ? Math.round((log.focusTimeSecs / 3600) * 10) / 10 : 0,
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [selectedDate, focusLogs]);

  // C4: Consistency Tracker Data (Last 21 days)
  const consistencyData = useMemo(() => {
    const data = [];
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 20);
    for (let i = 0; i < 21; i++) {
      const dStr = d.toISOString().split('T')[0];
      const log = focusLogs.find((l: any) => l.date === dStr);
      data.push({
        date: dStr,
        goalMet: log ? log.focusTimeSecs >= 4 * 3600 : false, // Assuming 4 hours is the daily goal
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [selectedDate, focusLogs]);

  // C5: Focus Stacked Bar Data (Last 21 days)
  const stackedBarData = useMemo(() => {
    const data = [];
    const d = new Date();
    d.setDate(d.getDate() - 20);
    for (let i = 0; i < 21; i++) {
      const dStr = d.toISOString().split('T')[0];
      const sMap = dailySubjectMap.get(dStr) || {};
      data.push({ date: dStr, ...sMap });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [dailySubjectMap]);

  // C6: Subject Donut Chart Data (For selected date)
  const selectedDateSubjectData = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
    const sMap = dailySubjectMap.get(dStr) || {};
    return Object.entries(sMap).map(([name, value]) => {
      const subj = subjects.find((s: any) => s.name === name);
      return { name, value: value * 3600, color: subj?.color || '#E8521A' };
    });
  }, [selectedDate, dailySubjectMap, subjects]);

  const { studySecs, breakSecs, otherSecs } = useMemo(() => {
    let study = 0;
    let brk = 0; // estimate from gaps
    let other = 0; // tasks/habits

    // Sort timeline
    const t = [...timeline].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );

    for (let i = 0; i < t.length; i++) {
      if (t[i].type === 'subject') study += t[i].duration;
      else other += t[i].duration;

      if (i > 0 && t[i - 1].endedAt) {
        const gap =
          (new Date(t[i].startedAt).getTime() - new Date(t[i - 1].endedAt!).getTime()) / 1000;
        if (gap > 0 && gap < 7200) brk += gap; // Gap < 2 hours is a break
      }
    }
    return { studySecs: study, breakSecs: brk, otherSecs: other };
  }, [timeline]);

  // C7: Session Stats Panel
  const sessionStats = useMemo(() => {
    const subjLogs = timeline.filter((t) => t.type === 'subject' && t.endedAt);
    const avg = subjLogs.length
      ? subjLogs.reduce((s, l) => s + l.duration, 0) / subjLogs.length
      : 0;
    const longest = subjLogs.length ? Math.max(...subjLogs.map((l) => l.duration)) : 0;

    return [
      { label: 'Avg Session', value: `${Math.round(avg / 60)}m` },
      { label: 'Longest Session', value: `${Math.round(longest / 60)}m` },
      { label: 'Total Sessions', value: `${subjLogs.length}` },
      { label: 'Focus Streak', value: `${focusStreak} Days`, isHighlight: true },
      {
        label: 'Avg Break',
        value:
          breakSecs > 0
            ? `${Math.round(breakSecs / 60 / Math.max(1, subjLogs.length - 1))}m`
            : '0m',
      },
      { label: 'Context Switches', value: `${Math.max(0, subjLogs.length - 1)}` },
    ];
  }, [timeline, focusStreak, breakSecs]);

  // C8: Mood Overview
  const moodData = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
    const todayRating = ratingStats?.ratings?.find((r: any) => r.date === dStr);
    return {
      rating: todayRating?.rating || null,
      sleep: todayRating?.sleepHours || undefined,
      energy: todayRating?.energyLevel || undefined,
    };
  }, [selectedDate, ratingStats]);

  // C9: Tasks Progress Ring
  const taskStats = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
    const todayTodos = todos.filter(
      (t: any) => t.dueDate?.startsWith(dStr) || t.createdAt?.startsWith(dStr),
    );
    return {
      done: todayTodos.filter((t: any) => t.status === 'DONE').length,
      pending: todayTodos.filter((t: any) => t.status === 'PENDING').length,
      inProgress: todayTodos.filter((t: any) => t.status === 'IN_PROGRESS').length,
      cancelled: todayTodos.filter((t: any) => t.status === 'CANCELLED').length,
    };
  }, [todos, selectedDate]);

  // C11: Focus Habits Correlation
  const correlationData = useMemo(() => {
    const data = [];
    const d = new Date();
    d.setDate(d.getDate() - 30); // Last 30 days

    // Get habit completion mapping
    const habitMap = new Map<string, { total: number; done: number }>();
    habitsData.forEach((h: any) => {
      const logs = new Set(
        (h.log || []).filter((l: any) => !l.deleted).map((l: any) => l.startedAt.split('T')[0]),
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
      const dStr = d.toISOString().split('T')[0];
      const log = focusLogs.find((l: any) => l.date === dStr);
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
    return computeGoalProgress(subjects).map((g: any) => ({
      subject: g.name,
      actual: g.actual / 3600,
      goal: g.goal / 3600,
      color: g.color,
    }));
  }, [subjects]);

  // ── Render Loading ────────────────────────────────────────────────────────
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
          <h1 className="text-3xl font-bold tracking-tight">FocusFlow Stats</h1>
          <p className="text-muted-foreground text-sm">Comprehensive performance dashboard</p>
        </div>
      </div>

      {/* ── Main Stats Page (9 Components) ───────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MonthlyCalendarNav
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              focusLogs={focusLogs}
            />
          </div>
          <div className="lg:col-span-7">
            <DailySummaryCard
              selectedDate={selectedDate}
              timeline={timeline}
              dailyHours={dailyHours}
              avgDailyHours={focusTrend.avgDaily / 3600}
              currentStreak={focusStreak}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyRadarChart data={weeklyRadarData} />
          <div className="flex flex-col justify-end h-full">
            <ConsistencyTracker data={consistencyData} currentStreak={focusStreak} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 gap-6">
          <FocusStackedBar
            data={stackedBarData}
            subjects={subjects.map((s: any) => ({ name: s.name, color: s.color }))}
            onBarClick={(dateStr) => setSelectedDate(new Date(dateStr))}
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <SubjectDonutChart
              subjectData={selectedDateSubjectData}
              totalStudySecs={studySecs}
              studySecs={studySecs}
              breakSecs={breakSecs}
              otherSecs={otherSecs}
            />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[220px]">
              <SessionStatsPanel stats={sessionStats} />
              <MoodOverviewPanel
                moodRating={moodData.rating}
                sleepHours={moodData.sleep}
                energyLevel={moodData.energy}
              />
            </div>
            <div className="h-[220px]">
              <TasksProgressRing {...taskStats} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Deep Dive Toggle ─────────────────────────────────────────────── */}
      <div className="mt-8 mb-6">
        <button
          onClick={() => setShowDeepDive(!showDeepDive)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            {showDeepDive ? 'Hide' : 'Show'} Deep Dive Analytics
          </span>
          {showDeepDive ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors animate-bounce" />
          )}
        </button>
      </div>

      {/* ── Deep Dive Analytics (5 Components) ─────────────────────────── */}
      {showDeepDive && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
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
      )}
    </main>
  );
}
