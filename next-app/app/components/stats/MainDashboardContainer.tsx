import React, { useMemo } from 'react';
import type { Subject, SubjectLog } from '@/types/subject';
import type { ToDo } from '@/types/todo';
import type { DailyRating } from '@/types/rating';
import { TimelineItem } from '@/hooks/useStats';
import {
  computeFocusTrend,
  computeFocusStreak,
  computeHabitStreaks,
  computeBurnoutRisk,
} from '../../stats/lib/metrics';

// Main Components
import MonthlyCalendarNav from './main/MonthlyCalendarNav';
import DailySummaryCard from './main/DailySummaryCard';
import WeeklyRadarChart from './main/WeeklyRadarChart';
import ConsistencyTracker from './main/ConsistencyTracker';
import FocusStackedBar from './main/FocusStackedBar';
import SubjectDonutChart from './main/SubjectDonutChart';
import SessionStatsPanel from './main/SessionStatsPanel';
import MoodOverviewPanel from './main/MoodOverviewPanel';
import TasksProgressRing from './main/TasksProgressRing';

interface MainDashboardContainerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  focusLogs: { date: string; focusTimeSecs: number }[];
  timeline: TimelineItem[];
  subjects: Subject[];
  ratingStats: { ratings: DailyRating[]; weeklyAverage: number } | undefined;
  todos: ToDo[];
}

export default function MainDashboardContainer({
  selectedDate,
  onSelectDate,
  focusLogs,
  timeline,
  subjects,
  ratingStats,
  todos,
}: MainDashboardContainerProps) {
  const focusTrend = useMemo(() => computeFocusTrend(focusLogs), [focusLogs]);
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
    return map;
  }, [subjects]);

  // C2: Daily Hours for selected date
  const dailyHours = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
    const item = focusLogs.find((l) => l.date === dStr);
    return item ? item.focusTimeSecs / 3600 : 0;
  }, [focusLogs, selectedDate]);

  // C3: Weekly Radar Data
  const weeklyRadarData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const dStr = d.toISOString().split('T')[0];
      const log = focusLogs.find((l) => l.date === dStr);
      data.push({
        day: dayNames[d.getDay()],
        hours: log ? Math.round((log.focusTimeSecs / 3600) * 10) / 10 : 0,
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [selectedDate, focusLogs]);

  // C4: Consistency Tracker Data
  const consistencyData = useMemo(() => {
    const data = [];
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 20);
    for (let i = 0; i < 21; i++) {
      const dStr = d.toISOString().split('T')[0];
      const log = focusLogs.find((l) => l.date === dStr);
      data.push({
        date: dStr,
        goalMet: log ? log.focusTimeSecs >= 4 * 3600 : false,
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [selectedDate, focusLogs]);

  // C5: Focus Stacked Bar Data
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

  // C6: Subject Donut Chart Data
  const selectedDateSubjectData = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
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

    const t = [...timeline].sort(
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
    const todayRating = ratingStats?.ratings?.find((r) => r.date.toString().startsWith(dStr));
    return {
      rating: todayRating?.rating || null,
      sleep: todayRating?.description ? parseInt(todayRating.description) : undefined, // fallback logic
      energy: undefined,
    };
  }, [selectedDate, ratingStats]);

  // C9: Tasks Progress Ring
  const taskStats = useMemo(() => {
    const dStr = selectedDate.toISOString().split('T')[0];
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyRadarChart data={weeklyRadarData} />
        <div className="flex flex-col justify-end h-full">
          <ConsistencyTracker data={consistencyData} currentStreak={focusStreak} />
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
  );
}
