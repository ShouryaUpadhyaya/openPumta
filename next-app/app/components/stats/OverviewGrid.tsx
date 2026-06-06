'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartTooltip, KPICard, StatTable, HeatCell, SectionHeader } from './shared';
import { ChartTheme } from '@/store/useChartThemeStore';
import {
  computeSessionStats,
  computePeakHours,
  computeDayOfWeekPattern,
  computeFocusStreak,
  computeImplicitBreaks,
  computeContextSwitching,
} from '../../stats/lib/metrics';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Target,
  Brain,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Heart,
  Activity,
  Timer,
  Sun,
  Calendar,
  Coffee,
  Shuffle,
} from 'lucide-react';

interface OverviewGridProps {
  theme: ChartTheme;
  statsData: any;
  subjects: any;
  ratingStats: any;
  todos: any;
  habitsData: any;
  focusTrend: any;
  subjectDist: any[];
  goalProgress: any[];
  habitStreaks: any[];
  taskCompletion: any;
  overallHabitConsistency: number;
  burnout: any;
  productivityScore: number;
}

export default function OverviewGrid({
  theme,
  statsData,
  subjects,
  ratingStats,
  todos,
  habitsData,
  focusTrend,
  subjectDist,
  goalProgress,
  habitStreaks,
  taskCompletion,
  overallHabitConsistency,
  burnout,
  productivityScore,
}: OverviewGridProps) {
  // ── Chart data ──────────────────────────────────────────────────────────────
  const focusChartData = useMemo(() => {
    return (statsData?.focusTimeArray || []).map((d: any) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: d.focusTimeHrs,
    }));
  }, [statsData]);

  const moodFocusData = useMemo(() => {
    if (!statsData?.focusTimeArray) return [];
    const ratingMap: Record<string, number> = {};
    (statsData?.habitCompletionRateByDate || []).forEach((d: any) => {
      ratingMap[d.date] = d.rate;
    });
    return statsData.focusTimeArray.slice(-21).map((d: any) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      focus: d.focusTimeHrs,
      habits: ratingMap[d.date] || 0,
    }));
  }, [statsData]);

  // ── Focus deep-dive metrics (promoted from DetailedView) ────────────────────
  const sessionStats = useMemo(() => computeSessionStats(subjects || []), [subjects]);
  const peakHours = useMemo(() => computePeakHours(subjects || []), [subjects]);
  const dayOfWeek = useMemo(() => computeDayOfWeekPattern(subjects || []), [subjects]);
  const focusStreak = useMemo(() => computeFocusStreak(subjects || []), [subjects]);
  const implicitBreaks = useMemo(() => computeImplicitBreaks(subjects || []), [subjects]);
  const contextSwitch = useMemo(() => computeContextSwitching(subjects || []), [subjects]);

  const radarData = useMemo(
    () =>
      dayOfWeek.map((d) => ({
        ...d,
        fullMark: Math.max(...dayOfWeek.map((x) => x.avgHours), 1),
      })),
    [dayOfWeek],
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const TrendIcon =
    focusTrend.direction === 'up'
      ? TrendingUp
      : focusTrend.direction === 'down'
        ? TrendingDown
        : Minus;
  const trendColor =
    focusTrend.direction === 'up'
      ? '#22c55e'
      : focusTrend.direction === 'down'
        ? '#ef4444'
        : '#a1a1aa';
  const burnoutColor =
    burnout.level === 'high' ? '#ef4444' : burnout.level === 'moderate' ? '#f59e0b' : '#22c55e';
  const todayFocusHrs = statsData?.summary?.todayFocusHrs || 0;
  const weeklyAvgHrs = statsData?.summary?.weeklyFocusHrsAvg || 0;
  const c = theme.colors; // shorthand

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO KPI ROW
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          icon={Clock}
          label="Today"
          value={`${todayFocusHrs}h`}
          sub="Focus time"
          color={c[0]}
        />
        <KPICard
          icon={BarChart3}
          label="Weekly Avg"
          value={`${weeklyAvgHrs}h`}
          sub="Per day"
          color={c[1]}
        />
        <KPICard
          icon={TrendIcon}
          label="Trend"
          value={`${focusTrend.pctChange > 0 ? '+' : ''}${focusTrend.pctChange}%`}
          sub={
            focusTrend.direction === 'up'
              ? 'Improving'
              : focusTrend.direction === 'down'
                ? 'Declining'
                : 'Steady'
          }
          color={trendColor}
        />
        <KPICard
          icon={Zap}
          label="Score"
          value={productivityScore}
          sub="Productivity"
          color={c[2]}
        />
        <KPICard
          icon={burnout.level === 'low' ? Heart : AlertTriangle}
          label="Burnout"
          value={burnout.level.charAt(0).toUpperCase() + burnout.level.slice(1)}
          sub={burnout.reasons[0] || "You're doing great"}
          color={burnoutColor}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FOCUS BAR CHART (2/3) + SUBJECT DONUT (1/3)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-card border-border/40 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: c[0] }} /> Focus Time — Last 21 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] p-2 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={focusChartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c[0]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c[0]} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="date"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a' }}
                interval="preserveStartEnd"
              />
              <YAxis
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a' }}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="hours" fill="url(#focusGrad)" radius={[6, 6, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 bg-card border-border/40 overflow-hidden relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: c[1] }} /> Subject Split
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] flex items-center justify-center p-2">
          {subjectDist.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDist}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {subjectDist.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color || c[i % c.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No subject data yet</p>
          )}
          {subjectDist.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {subjectDist.slice(0, 4).map((s: any, i: number) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color || c[i % c.length] }}
                  />
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          PEAK HOURS HEATMAP (2/3) + SESSION STATS TABLE (1/3)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="h-4 w-4" style={{ color: c[0] }} /> Peak Study Hours
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
                {peakHours.slice(0, 12).map((h) => (
                  <HeatCell
                    key={h.hour}
                    intensity={h.intensity}
                    label={h.label}
                    value={`${h.mins} min`}
                    accent={c[0]}
                  />
                ))}
              </div>
              <div className="grid grid-cols-12 gap-1">
                {peakHours.slice(12).map((h) => (
                  <HeatCell
                    key={h.hour}
                    intensity={h.intensity}
                    label={h.label}
                    value={`${h.mins} min`}
                    accent={c[0]}
                  />
                ))}
              </div>
              <div className="grid grid-cols-12 gap-1 pt-1">
                {['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map((time, i) => (
                  <div key={i} className="text-center text-[9px] text-muted-foreground">
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 bg-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Timer className="h-4 w-4" style={{ color: c[0] }} /> Session Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatTable
            accent={c[0]}
            rows={[
              { label: 'Avg Session', value: `${sessionStats.avgDurationMins}m` },
              { label: 'Longest Session', value: `${sessionStats.longestMins}m` },
              { label: 'Total Sessions', value: sessionStats.totalSessions, sub: '21 days' },
              { label: 'Focus Streak', value: `${focusStreak}d`, sub: 'consecutive' },
              { label: 'Avg Break', value: `${implicitBreaks.avgBreakMins}m` },
              { label: 'Context Switches', value: contextSwitch.avgSessionsPerDay, sub: 'avg/day' },
            ]}
          />
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          DAY-OF-WEEK RADAR (square, 1/3) + GOAL VS REALITY (1/3) + HABITS (1/3)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="col-span-1 bg-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: c[2] }} /> Weekly Pattern
          </CardTitle>
        </CardHeader>
        <CardContent className="aspect-square max-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#52525b" opacity={0.3} />
              <PolarAngleAxis dataKey="day" fontSize={10} tick={{ fill: '#a1a1aa' }} />
              <PolarRadiusAxis fontSize={8} tick={{ fill: '#71717a' }} />
              <Radar
                name="Avg Hours"
                dataKey="avgHours"
                stroke={c[0]}
                fill={c[0]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 bg-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: c[2] }} /> Goal vs Reality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goalProgress.length > 0 ? (
            goalProgress.map((g, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate max-w-[140px]">{g.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{g.pct}%</span>
                </div>
                <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${g.pct}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Set daily goals to see progress
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4" style={{ color: c[3] }} /> 21-Day Habit Consistency
            <Badge variant="outline" className="ml-auto text-xs font-mono">
              Overall: {overallHabitConsistency}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habitsData && habitsData.length > 0 ? (
            <div className="space-y-4">
              {habitsData.map((habit: any, i: number) => {
                const logs = habit.log || [];
                const completionMap = new Map<string, boolean>();
                logs.forEach((l: any) => {
                  if (!l.deleted) {
                    const dStr = new Date(l.startedAt).toISOString().split('T')[0];
                    completionMap.set(dStr, l.isBadDayPlan || false);
                  }
                });

                // Generate last 21 days
                const daysArray = [];
                for (let j = 20; j >= 0; j--) {
                  const d = new Date();
                  d.setDate(d.getDate() - j);
                  daysArray.push(d.toISOString().split('T')[0]);
                }

                // Find consistency for this habit from habitStreaks
                const streakData = habitStreaks.find((hs: any) => hs.name === habit.name);

                return (
                  <div key={habit.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: c[i % c.length] }}
                        />
                        <span className="truncate max-w-[120px] md:max-w-xs">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-mono">
                        {streakData && <span>🔥 {streakData.streak}</span>}
                        <span>{streakData ? streakData.consistency : 0}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-[repeat(21,minmax(0,1fr))] gap-1">
                      {daysArray.map((dateStr, idx) => {
                        const done = completionMap.has(dateStr);
                        const isBadDayPlan = done ? completionMap.get(dateStr) : false;
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        return (
                          <div
                            key={idx}
                            title={`${dateStr}${isBadDayPlan ? ' (Minimum)' : ''}`}
                            className={`aspect-square rounded-sm transition-colors ${
                              done ? (isBadDayPlan ? 'opacity-50' : 'opacity-100') : 'bg-muted/40'
                            } ${isToday && !done ? 'border border-primary/40' : ''}`}
                            style={{
                              backgroundColor: done ? c[i % c.length] : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">No habits tracked yet</p>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          FOCUS vs HABITS CORRELATION (2/3) + TASK GAUGE (1/3)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-card border-border/40 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: c[4] }} /> Focus vs Habits — 21 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[240px] p-2 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={moodFocusData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="focusAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="date"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a' }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a' }}
                tickFormatter={(v) => `${v}h`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="focus"
                fill="url(#focusAreaGrad)"
                stroke={c[0]}
                strokeWidth={2}
                name="Focus (hrs)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="habits"
                stroke={c[3]}
                strokeWidth={2}
                dot={false}
                name="Habits (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 bg-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" style={{ color: c[2] }} /> Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={c[2]}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${taskCompletion.rate * 2.64} 264`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{taskCompletion.rate}%</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                Done
              </span>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{taskCompletion.done} done</span>
            <span>{taskCompletion.pending} pending</span>
            <span>{taskCompletion.inProgress} active</span>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          BURNOUT RISK (1/3) + MOOD OVERVIEW (2/3)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card
        className={`col-span-1 border-border/40 overflow-hidden ${burnout.level === 'high' ? 'bg-red-500/5 border-red-500/20' : burnout.level === 'moderate' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: burnoutColor }} /> Burnout Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold" style={{ color: burnoutColor }}>
              {burnout.level.charAt(0).toUpperCase() + burnout.level.slice(1)}
            </div>
            <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (burnout.score / 6) * 100)}%`,
                  backgroundColor: burnoutColor,
                }}
              />
            </div>
          </div>
          {burnout.reasons.length > 0 ? (
            <ul className="space-y-1.5">
              {burnout.reasons.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: burnoutColor }}
                  />
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">All signals healthy 🎉</p>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2 bg-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4" style={{ color: c[4] }} /> Mood Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Today', val: ratingStats?.today ?? '—' },
              { label: 'Yesterday', val: ratingStats?.yesterday ?? '—' },
              { label: '7-Day Avg', val: ratingStats?.weeklyAverage ?? '—' },
              { label: '21-Day Avg', val: ratingStats?.twentyOneDayAverage ?? '—' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-2xl font-bold">{m.val}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
          {ratingStats?.difference != null && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              {ratingStats.difference > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : ratingStats.difference < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">
                {ratingStats.difference > 0 ? '+' : ''}
                {ratingStats.difference} from yesterday
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
