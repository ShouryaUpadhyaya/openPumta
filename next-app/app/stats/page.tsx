'use client';

import React, { useState } from 'react';
import {
  useDashboardStats,
  useDailyTimeline,
  useSubjectsWithLogs,
  useDailyRatings21,
  useTodosAll,
  useHabitsWithLogs21,
} from '@/hooks/useStats';

import MainDashboardContainer from '../components/stats/MainDashboardContainer';
import DeepDiveContainer from '../components/stats/DeepDiveContainer';

import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export default function StatsPage() {
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

  const focusLogs = statsData?.focusTimeArray || [];

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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/20 text-primary">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stats</h1>
          <p className="text-muted-foreground text-sm">Comprehensive performance dashboard</p>
        </div>
      </div>

      <MainDashboardContainer
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        focusLogs={focusLogs}
        timeline={timeline}
        subjects={subjects}
        ratingStats={ratingStats}
        todos={todos}
        habitsData={habitsData}
      />

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

      {showDeepDive && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DeepDiveContainer
            focusLogs={focusLogs}
            timeline={timeline}
            subjects={subjects}
            habitsData={habitsData}
            ratingStats={ratingStats}
          />
        </div>
      )}
    </main>
  );
}
