'use client';

import React, { useState, useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip, StatTable, HBar, HeatCell, SectionHeader, StatRow } from './shared';
import { ChartTheme } from '@/store/useChartThemeStore';
import {
  computeTaskStatusDistribution,
  computeOverdueTasks,
  computeProcrastinationDelta,
  computeCancellationRate,
  computeAvgCompletionTime,
  computeTaskWorkTime,
  computeHabitDifficultyBreakdown,
  computeHabitTimeOfDay,
  computePerformanceBalance,
  computeFocusTrend,
  computeTaskCompletion,
  computeHabitStreaks,
} from '../../stats/lib/metrics';
import {
  ListChecks,
  Hourglass,
  XCircle,
  Dumbbell,
  Sun,
  Sparkles,
  Layers,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react';

// ─── Tab navigation (mobile only) ──────────────────────────────────────────

const MOBILE_TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'habits', label: 'Habits', icon: Dumbbell },
  { id: 'performance', label: 'Performance', icon: Sparkles },
] as const;

type MobileTabId = (typeof MOBILE_TABS)[number]['id'];

// ─── Task Section ───────────────────────────────────────────────────────────

function TasksSection({ todos, accent }: { todos: any; accent: string }) {
  const taskStatusDist = useMemo(() => computeTaskStatusDistribution(todos || []), [todos]);
  const overdueTasks = useMemo(() => computeOverdueTasks(todos || []), [todos]);
  const procrastination = useMemo(() => computeProcrastinationDelta(todos || []), [todos]);
  const cancellationRate = useMemo(() => computeCancellationRate(todos || []), [todos]);
  const avgCompletion = useMemo(() => computeAvgCompletionTime(todos || []), [todos]);
  const taskWorkTime = useMemo(() => computeTaskWorkTime(todos || []), [todos]);

  const taskStats: StatRow[] = [
    {
      label: 'Overdue Tasks',
      value: overdueTasks.count,
      accent: overdueTasks.count > 0 ? '#ef4444' : undefined,
    },
    {
      label: 'Cancellation Rate',
      value: `${cancellationRate}%`,
      accent: cancellationRate > 20 ? '#ef4444' : undefined,
    },
    {
      label: 'Avg Completion Time',
      value: `${avgCompletion.avgHours}h`,
      sub: `${avgCompletion.count} tasks`,
    },
    { label: 'Work Time Logged', value: `${taskWorkTime}m`, sub: 'on tasks' },
    {
      label: 'Avg Delay to Start',
      value:
        procrastination.avgMins < 60
          ? `${procrastination.avgMins}m`
          : `${Math.round(procrastination.avgMins / 60)}h`,
      sub: `${procrastination.count} tasks`,
    },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Tasks Deep Dive" icon={ListChecks} accent={accent} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-3.5 w-3.5" style={{ color: accent }} /> Status
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {taskStatusDist.map((s) => (
              <HBar
                key={s.status}
                label={s.status.replace('_', ' ')}
                value={s.count}
                maxValue={Math.max(...taskStatusDist.map((x) => x.count), 1)}
                color={s.color}
                suffix={` (${s.pct}%)`}
              />
            ))}
          </CardContent>
        </Card>

        {/* Task Stats Table */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hourglass className="h-3.5 w-3.5" style={{ color: accent }} /> Task Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatTable accent={accent} rows={taskStats} />
          </CardContent>
        </Card>
      </div>

      {/* Procrastination by Priority */}
      {procrastination.byPriority.length > 0 && (
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hourglass className="h-3.5 w-3.5" style={{ color: accent }} /> Procrastination by
              Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {procrastination.byPriority
              .sort((a, b) => b.avgMins - a.avgMins)
              .map((p) => (
                <HBar
                  key={p.priority}
                  label={`Priority ${p.priority}`}
                  value={p.avgMins}
                  maxValue={Math.max(...procrastination.byPriority.map((x) => x.avgMins), 1)}
                  color={accent}
                  suffix=" min"
                />
              ))}
          </CardContent>
        </Card>
      )}

      {/* Overdue Task List */}
      {overdueTasks.count > 0 && (
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-red-400" /> Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.tasks.map((t: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-[10px] text-red-400">
                    Due: {new Date(t.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Habits Section ─────────────────────────────────────────────────────────

function HabitsSection({ habitsData, accent }: { habitsData: any; accent: string }) {
  const difficultyBreakdown = useMemo(
    () => computeHabitDifficultyBreakdown(habitsData || []),
    [habitsData],
  );
  const habitTimeOfDay = useMemo(() => computeHabitTimeOfDay(habitsData || []), [habitsData]);

  return (
    <div className="space-y-4">
      <SectionHeader title="Habits Deep Dive" icon={Dumbbell} accent={accent} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty vs Consistency */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5" style={{ color: accent }} /> Difficulty vs
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {difficultyBreakdown.length > 0 ? (
              <div className="space-y-3">
                {difficultyBreakdown.map((d) => (
                  <div key={d.difficulty} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-12 shrink-0 text-right"
                      style={{ color: d.color }}
                    >
                      {d.difficulty}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${d.avgConsistency}%`, backgroundColor: d.color }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">
                        {d.avgConsistency}%
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-14 shrink-0">
                      {d.count} habit{d.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-3">
                No habits with difficulty assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Habit Time of Day */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sun className="h-3.5 w-3.5" style={{ color: accent }} /> When You Complete Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 justify-around text-[10px] text-muted-foreground font-semibold py-1 pr-1 border-r border-border/40 pb-5">
                <span>AM</span>
                <span>PM</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="grid grid-cols-12 gap-1">
                  {habitTimeOfDay.slice(0, 12).map((h) => (
                    <HeatCell
                      key={h.hour}
                      intensity={h.intensity}
                      label={h.label}
                      value={`${h.count} times`}
                      accent={accent}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {habitTimeOfDay.slice(12).map((h) => (
                    <HeatCell
                      key={h.hour}
                      intensity={h.intensity}
                      label={h.label}
                      value={`${h.count} times`}
                      accent={accent}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1 pt-1">
                  {['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map(
                    (time, i) => (
                      <div key={i} className="text-center text-[9px] text-muted-foreground">
                        {time}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Performance Balance Section ────────────────────────────────────────────

function PerformanceBalanceSection({
  statsData,
  ratingStats,
  habitsData,
  todos,
  accent,
}: {
  statsData: any;
  ratingStats: any;
  habitsData: any;
  todos: any;
  accent: string;
}) {
  const focusTrend = useMemo(() => computeFocusTrend(statsData?.focusTimeArray || []), [statsData]);
  const taskCompletion = useMemo(() => computeTaskCompletion(todos || []), [todos]);
  const habitStreaks = useMemo(() => computeHabitStreaks(habitsData || []), [habitsData]);
  const overallHabitConsistency = useMemo(() => {
    if (!habitStreaks.length) return 0;
    return Math.round(
      habitStreaks.reduce((s: number, h: any) => s + h.consistency, 0) / habitStreaks.length,
    );
  }, [habitStreaks]);
  const balance = useMemo(
    () =>
      computePerformanceBalance(
        focusTrend,
        ratingStats,
        overallHabitConsistency,
        taskCompletion.rate,
      ),
    [focusTrend, ratingStats, overallHabitConsistency, taskCompletion],
  );

  const radarData = useMemo(() => balance.metrics.map((m) => ({ ...m, fullMark: 100 })), [balance]);

  // Build the stat table rows for the right side
  const balanceRows: StatRow[] = balance.metrics.map((m) => ({
    label: `${m.icon}  ${m.label}`,
    value: `${Math.round(m.value)}%`,
    accent: m.value >= 70 ? '#22c55e' : m.value >= 40 ? '#f59e0b' : '#ef4444',
  }));
  balanceRows.push({ label: '🏆  Overall Balance', value: `${balance.overall}%`, accent });

  return (
    <div className="space-y-4">
      <SectionHeader title="Performance Balance" icon={Sparkles} accent={accent} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance Radar (square) */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" style={{ color: accent }} /> Balance Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="aspect-square max-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#52525b" opacity={0.3} />
                <PolarAngleAxis dataKey="label" fontSize={10} tick={{ fill: '#a1a1aa' }} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={8} tick={{ fill: '#71717a' }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke={accent}
                  fill={accent}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance stat tables */}
        <div className="space-y-4">
          <Card className="bg-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Balance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <StatTable accent={accent} rows={balanceRows} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main DetailedView ──────────────────────────────────────────────────────

export default function DetailedView({
  theme,
  subjects,
  todos,
  habitsData,
  ratingStats,
  statsData,
}: {
  theme: ChartTheme;
  subjects: any;
  todos: any;
  habitsData: any;
  ratingStats: any;
  statsData: any;
}) {
  const [mobileTab, setMobileTab] = useState<MobileTabId>('tasks');
  const accent = theme.colors[0]; // single accent for everything

  return (
    <div className="rounded-2xl border border-border/30 bg-gradient-to-b from-muted/10 to-muted/5 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold tracking-tight">Deep Dive Analytics</h2>
        </div>
      </div>

      {/* ── Mobile Tabs (visible only on small screens) ──────────────────── */}
      <div className="px-5 pb-4 md:hidden">
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
          {MOBILE_TABS.map((tab) => {
            const isActive = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-card shadow-md border border-border/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <tab.icon
                  className="h-3.5 w-3.5"
                  style={isActive ? { color: accent } : undefined}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: All sections visible in flow ────────────────────────── */}
      <div className="hidden md:block px-5 pb-5 space-y-8">
        <TasksSection todos={todos} accent={accent} />
        <HabitsSection habitsData={habitsData} accent={accent} />
        <PerformanceBalanceSection
          statsData={statsData}
          ratingStats={ratingStats}
          habitsData={habitsData}
          todos={todos}
          accent={accent}
        />
      </div>

      {/* ── Mobile: Tab content ──────────────────────────────────────────── */}
      <div className="md:hidden px-5 pb-5">
        {mobileTab === 'tasks' && <TasksSection todos={todos} accent={accent} />}
        {mobileTab === 'habits' && <HabitsSection habitsData={habitsData} accent={accent} />}
        {mobileTab === 'performance' && (
          <PerformanceBalanceSection
            statsData={statsData}
            ratingStats={ratingStats}
            habitsData={habitsData}
            todos={todos}
            accent={accent}
          />
        )}
      </div>
    </div>
  );
}
