import React, { useMemo, useState, useEffect } from 'react';
import type { Subject } from '@/types/subject';
import type { ToDo } from '@/types/todo';
import type { Habit } from '@/types/habit';
import type { DailyRating } from '@/types/rating';
import { TimelineItem } from '@/hooks/useStats';
import { useTimerStore } from '@/store/useTimerStore';
import {
  computeFocusTrend,
  computeFocusStreak,
  computeGoalProgress,
  computeReviewInsights,
} from '../../stats/lib/metrics';

// Main Components
import MonthlyCalendarNav from './main/MonthlyCalendarNav';
import DailySummaryCard from './main/DailySummaryCard';
import WeeklyRadarChart from './main/WeeklyRadarChart';
import ConsistencyTracker from './main/ConsistencyTracker';
import FocusStackedBar from './main/FocusStackedBar';
import SubjectDonutChart from './main/SubjectDonutChart';
import SessionStatsPanel from './main/SessionStatsPanel';
import ReviewInsightsPanel from './main/ReviewInsightsPanel';
import TasksProgressRing from './main/TasksProgressRing';
import GoalRealityBars from './deep-dive/GoalRealityBars';
import AdvancedPeriodTrends from './deep-dive/AdvancedPeriodTrends';
import { getLocalIsoDate } from '@/lib/utils';

interface MainDashboardContainerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  focusLogs: { date: string; focusTimeSecs: number }[];
  timeline: TimelineItem[];
  subjects: Subject[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ratingStats: { ratings?: DailyRating[]; weeklyAverage?: number; history?: any[] } | undefined;
  todos: ToDo[];
  habitsData: Habit[];
}

export default function MainDashboardContainer({
  selectedDate,
  onSelectDate,
  focusLogs,
  timeline,
  subjects,
  ratingStats,
  todos,
  habitsData,
}: MainDashboardContainerProps) {
  const store = useTimerStore();
  const [localNow, setLocalNow] = useState(() => Date.now());

  useEffect(() => {
    if (store.phase === 'work' && store.running) {
      const interval = setInterval(() => setLocalNow(Date.now()), 10000);
      return () => clearInterval(interval);
    }
  }, [store.phase, store.running]);

  const activeTimelineItem = useMemo(() => {
    if (store.phase === 'work' && store.running && store.activeSubjectId && store.phaseStartedAt) {
      const isToday = getLocalIsoDate(new Date()) === getLocalIsoDate(selectedDate);
      if (!isToday) return null;

      const subject = subjects.find((s) => s.id === store.activeSubjectId);
      return {
        id: 'active-timer',
        type: 'subject' as const,
        name: subject?.name || 'Active Focus',
        startedAt: new Date(store.phaseStartedAt).toISOString(),
        endedAt: new Date(localNow).toISOString(),
        duration: Math.floor((localNow - store.phaseStartedAt) / 1000),
      };
    }
    return null;
  }, [
    store.phase,
    store.running,
    store.activeSubjectId,
    store.phaseStartedAt,
    localNow,
    selectedDate,
    subjects,
  ]);

  const augmentedTimeline = useMemo(() => {
    if (activeTimelineItem) {
      return [...timeline, activeTimelineItem];
    }
    return timeline;
  }, [timeline, activeTimelineItem]);

  const augmentedFocusLogs = useMemo(() => {
    if (!activeTimelineItem) return focusLogs;
    const activeDateIso = getLocalIsoDate(new Date(activeTimelineItem.startedAt));

    const existing = focusLogs.find((l) => l.date === activeDateIso);
    const others = focusLogs.filter((l) => l.date !== activeDateIso);

    return [
      ...others,
      {
        date: activeDateIso,
        focusTimeSecs: (existing?.focusTimeSecs || 0) + activeTimelineItem.duration,
      },
    ].sort((a, b) => a.date.localeCompare(b.date));
  }, [focusLogs, activeTimelineItem]);

  const focusTrend = useMemo(() => computeFocusTrend(augmentedFocusLogs), [augmentedFocusLogs]);
  const focusStreak = useMemo(() => computeFocusStreak(subjects), [subjects]);

  // Daily Subject Focus (for Stacked Bar & Radar)
  const dailySubjectMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    subjects.forEach((s) => {
      (s.subjectLogs || []).forEach((log) => {
        if (!log.endedAt) return;
        const dStr = log.startedAt.toString().split('T')[0];
        const dur =
          (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000 / 3600; // hours
        if (!map.has(dStr)) map.set(dStr, {});
        const dayData = map.get(dStr)!;
        dayData[s.name] = (dayData[s.name] || 0) + dur;
      });
    });

    if (activeTimelineItem) {
      const dStr = getLocalIsoDate(new Date(activeTimelineItem.startedAt));
      if (!map.has(dStr)) map.set(dStr, {});
      const dayData = map.get(dStr)!;
      dayData[activeTimelineItem.name] =
        (dayData[activeTimelineItem.name] || 0) + activeTimelineItem.duration / 3600;
    }

    return map;
  }, [subjects, activeTimelineItem]);

  // C2: Daily Hours for selected date
  const dailyHours = useMemo(() => {
    const dStr = getLocalIsoDate(selectedDate);
    const item = augmentedFocusLogs.find((l) => l.date === dStr);
    let hours = item ? item.focusTimeSecs / 3600 : 0;
    // We already added activeTimelineItem to augmentedFocusLogs, so no need to add it again here!
    return hours;
  }, [augmentedFocusLogs, selectedDate]);

  // C3: Weekly Radar Data
  const weeklyRadarData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const dStr = getLocalIsoDate(d);
      const log = augmentedFocusLogs.find((l) => l.date === dStr);
      data.push({
        day: dayNames[d.getDay()],
        hours: log ? Math.round((log.focusTimeSecs / 3600) * 10) / 10 : 0,
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [selectedDate, augmentedFocusLogs]);

  // C5: Focus Stacked Bar Data
  const stackedBarData = useMemo(() => {
    const data = [];
    const d = new Date();
    d.setDate(d.getDate() - 20);
    for (let i = 0; i < 21; i++) {
      const dStr = getLocalIsoDate(d);
      const sMap = dailySubjectMap.get(dStr) || {};
      data.push({ date: dStr, ...sMap });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [dailySubjectMap]);

  // C6: Subject Donut Chart Data
  const selectedDateSubjectData = useMemo(() => {
    const dStr = getLocalIsoDate(selectedDate);
    const sMap = dailySubjectMap.get(dStr) || {};
    return Object.entries(sMap).map(([name, value]) => {
      const subj = subjects.find((s) => s.name === name);
      return { name, value: value * 3600, color: subj?.color || '#E8521A' };
    });
  }, [selectedDate, dailySubjectMap, subjects]);

  const { studySecs, breakSecs, otherSecs } = useMemo(() => {
    let study = 0;
    let brk = 0;
    let other = 0;

    const t = [...augmentedTimeline].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );

    for (let i = 0; i < t.length; i++) {
      if (t[i].type === 'subject') study += t[i].duration;
      else other += t[i].duration;

      if (i > 0 && t[i - 1].endedAt) {
        const gap =
          (new Date(t[i].startedAt).getTime() - new Date(t[i - 1].endedAt!).getTime()) / 1000;
        if (gap > 0 && gap < 7200) brk += gap;
      }
    }
    return { studySecs: study, breakSecs: brk, otherSecs: other };
  }, [augmentedTimeline]);
  const goalRealityData = useMemo(() => {
    return computeGoalProgress(subjects).map((g) => ({
      subject: g.name,
      actual: g.actual / 3600,
      goal: g.goal / 3600,
      color: g.color,
    }));
  }, [subjects]);
  // C7: Session Stats Panel
  const sessionStats = useMemo(() => {
    const subjLogs = augmentedTimeline.filter((t) => t.type === 'subject' && t.endedAt);
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
  }, [augmentedTimeline, focusStreak, breakSecs]);

  // C8: Review Insights Overview
  const moodData = useMemo(() => {
    const dStr = getLocalIsoDate(selectedDate);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayRating = ratingStats?.history?.find((r: any) => r.date.startsWith(dStr));
    const insights = todayRating?.content
      ? computeReviewInsights(todayRating.content)
      : { total: 0, completed: 0, completionRate: 0, items: [] };

    return {
      rating: todayRating?.rating || null,
      insights,
    };
  }, [selectedDate, ratingStats]);

  // C9: Tasks Progress Ring
  const taskStats = useMemo(() => {
    const dStr = getLocalIsoDate(selectedDate);
    const todayTodos = todos.filter(
      (t) => t.dueDate?.toString().startsWith(dStr) || t.createdAt?.toString().startsWith(dStr),
    );
    return {
      done: todayTodos.filter((t) => t.status === 'DONE').length,
      pending: todayTodos.filter((t) => t.status === 'PENDING').length,
      inProgress: todayTodos.filter((t) => t.status === 'IN_PROGRESS').length,
      cancelled: todayTodos.filter((t) => t.status === 'CANCELLED').length,
    };
  }, [todos, selectedDate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <MonthlyCalendarNav
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            focusLogs={augmentedFocusLogs}
          />
        </div>
        <div className="lg:col-span-7">
          <DailySummaryCard
            selectedDate={selectedDate}
            timeline={augmentedTimeline}
            dailyHours={dailyHours}
            avgDailyHours={focusTrend.avgDaily / 3600}
            currentStreak={focusStreak}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="flex flex-col justify-end h-full lg:col-span-4">
          <ConsistencyTracker habits={habitsData} selectedDate={selectedDate} />
        </div>
        <div className="flex flex-col lg:col-span-2 justify-end gap-6">
          <WeeklyRadarChart data={weeklyRadarData} />
          <GoalRealityBars data={goalRealityData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FocusStackedBar
          data={stackedBarData}
          subjects={subjects.map((s) => ({ name: s.name, color: s.color }))}
          onBarClick={(dateStr) => onSelectDate(new Date(dateStr))}
        />
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <SessionStatsPanel stats={sessionStats} />
            <ReviewInsightsPanel moodRating={moodData.rating} reviewInsights={moodData.insights} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <TasksProgressRing {...taskStats} />
        </div>

        <div className="lg:col-span-4">
          <AdvancedPeriodTrends trendData={focusTrend} />
        </div>
      </div>
    </div>
  );
}
