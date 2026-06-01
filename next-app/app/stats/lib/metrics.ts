// ─── Pure metric computation functions ──────────────────────────────────────
// No side effects, no React, no API calls. Just math on data.

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW METRICS (used by OverviewGrid)
// ═══════════════════════════════════════════════════════════════════════════════

export function computeFocusTrend(focusArray: { date: string; focusTimeSecs: number }[]) {
  if (!focusArray?.length)
    return { thisWeek: 0, prevWeek: 0, pctChange: 0, direction: 'flat' as const, avgDaily: 0 };
  const last7 = focusArray.slice(-7);
  const prev7 = focusArray.slice(-14, -7);
  const thisWeek = last7.reduce((s, d) => s + d.focusTimeSecs, 0);
  const prevWeek = prev7.reduce((s, d) => s + d.focusTimeSecs, 0);
  const pctChange =
    prevWeek > 0 ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const direction =
    pctChange > 5 ? ('up' as const) : pctChange < -5 ? ('down' as const) : ('flat' as const);
  return { thisWeek, prevWeek, pctChange, direction, avgDaily: Math.round(thisWeek / 7) };
}

export function computeSubjectDistribution(subjects: any[]) {
  if (!subjects?.length) return [];
  return subjects
    .map((s: any) => {
      const totalSecs = (s.subjectLogs || [])
        .filter((l: any) => l.endedAt)
        .reduce((sum: number, l: any) => {
          const dur = (new Date(l.endedAt).getTime() - new Date(l.startedAt).getTime()) / 1000;
          return sum + Math.max(0, dur);
        }, 0);
      return {
        name: s.name,
        value: Math.round(totalSecs / 60),
        color: s.color || '#f97316',
        goalSecs: s.goalWorkSecs || 0,
      };
    })
    .filter((s: any) => s.value > 0)
    .sort((a: any, b: any) => b.value - a.value);
}

export function computeGoalProgress(subjects: any[]) {
  if (!subjects?.length) return [];
  const today = new Date().toISOString().split('T')[0];
  return subjects
    .filter((s: any) => s.goalWorkSecs > 0)
    .map((s: any) => {
      const todaySecs = (s.subjectLogs || [])
        .filter((l: any) => l.endedAt && l.startedAt.slice(0, 10) === today)
        .reduce((sum: number, l: any) => {
          return (
            sum +
            Math.max(0, (new Date(l.endedAt).getTime() - new Date(l.startedAt).getTime()) / 1000)
          );
        }, 0);
      return {
        name: s.name,
        color: s.color || '#f97316',
        actual: Math.round(todaySecs),
        goal: s.goalWorkSecs,
        pct: Math.min(100, Math.round((todaySecs / s.goalWorkSecs) * 100)),
      };
    });
}

export function computeHabitStreaks(habits: any[]) {
  if (!habits?.length) return [];
  return habits.map((h: any) => {
    const logs = (h.log || []).filter((l: any) => !l.deleted);
    const doneDays = new Set(
      logs.map((l: any) => new Date(l.startedAt).toISOString().split('T')[0]),
    );
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (doneDays.has(d.toISOString().split('T')[0])) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    const consistency = Math.round((doneDays.size / 21) * 100);
    return {
      name: h.name,
      streak,
      consistency,
      difficulty: h.difficulty,
      daysCompleted: doneDays.size,
    };
  });
}

export function computeTaskCompletion(todos: any[]) {
  if (!todos?.length)
    return { done: 0, total: 0, rate: 0, cancelled: 0, pending: 0, inProgress: 0 };
  const done = todos.filter((t: any) => t.status === 'DONE').length;
  const cancelled = todos.filter((t: any) => t.status === 'CANCELLED').length;
  const pending = todos.filter((t: any) => t.status === 'PENDING').length;
  const inProgress = todos.filter((t: any) => t.status === 'IN_PROGRESS').length;
  return {
    done,
    total: todos.length,
    rate: todos.length > 0 ? Math.round((done / todos.length) * 100) : 0,
    cancelled,
    pending,
    inProgress,
  };
}

export function computeBurnoutRisk(
  focusTrend: ReturnType<typeof computeFocusTrend>,
  moodAvg: number | null,
  habitConsistency: number,
) {
  let score = 0;
  const reasons: string[] = [];
  if (focusTrend.direction === 'down') {
    score += focusTrend.pctChange <= -30 ? 2 : 1;
    reasons.push(`Focus declining ${Math.abs(focusTrend.pctChange)}%`);
  }
  if (moodAvg !== null && moodAvg <= 2.5) {
    score += 2;
    reasons.push(`Low mood (${moodAvg}/5)`);
  }
  if (habitConsistency < 40) {
    score += 2;
    reasons.push(`Low habit consistency (${habitConsistency}%)`);
  } else if (habitConsistency < 60) {
    score += 1;
    reasons.push(`Habit consistency slipping`);
  }
  return { level: score >= 4 ? 'high' : score >= 2 ? 'moderate' : 'low', score, reasons };
}

export function computeProductivityScore(
  goalPct: number,
  habitPct: number,
  taskRate: number,
  moodNorm: number,
) {
  return Math.round(0.4 * goalPct + 0.3 * habitPct + 0.2 * taskRate + 0.1 * moodNorm);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAILED METRICS (used by DetailedView)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Focus Deep Dive ─────────────────────────────────────────────────────────

/** Average + longest + count of study sessions */
export function computeSessionStats(subjects: any[]) {
  const allLogs: { start: Date; end: Date; durationSecs: number }[] = [];
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        const start = new Date(l.startedAt);
        const end = new Date(l.endedAt);
        const dur = Math.max(0, (end.getTime() - start.getTime()) / 1000);
        if (dur > 0) allLogs.push({ start, end, durationSecs: dur });
      });
  });
  if (!allLogs.length)
    return {
      avgDurationMins: 0,
      longestMins: 0,
      totalSessions: 0,
      sessionsPerDay: [] as { date: string; count: number }[],
    };
  const avg = allLogs.reduce((s, l) => s + l.durationSecs, 0) / allLogs.length / 60;
  const longest = Math.max(...allLogs.map((l) => l.durationSecs)) / 60;
  const byDay: Record<string, number> = {};
  allLogs.forEach((l) => {
    const k = l.start.toISOString().split('T')[0];
    byDay[k] = (byDay[k] || 0) + 1;
  });
  const sessionsPerDay = Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    avgDurationMins: Math.round(avg * 10) / 10,
    longestMins: Math.round(longest * 10) / 10,
    totalSessions: allLogs.length,
    sessionsPerDay,
  };
}

/** Hour-of-day histogram (0-23) showing when the user studies most */
export function computePeakHours(subjects: any[]) {
  const hours = new Array(24).fill(0);
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        const h = new Date(l.startedAt).getHours();
        const dur = Math.max(
          0,
          (new Date(l.endedAt).getTime() - new Date(l.startedAt).getTime()) / 1000 / 60,
        );
        hours[h] += dur;
      });
  });
  const maxVal = Math.max(...hours, 1);
  return hours.map((mins, hour) => ({
    hour,
    mins: Math.round(mins),
    label: `${hour.toString().padStart(2, '0')}:00`,
    intensity: mins / maxVal, // 0-1 for heatmap coloring
  }));
}

/** Average focus per day of week (Mon-Sun) */
export function computeDayOfWeekPattern(subjects: any[]) {
  const days: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        const d = new Date(l.startedAt);
        const dur = Math.max(0, (new Date(l.endedAt).getTime() - d.getTime()) / 1000 / 3600);
        days[d.getDay()].push(dur);
      });
  });
  return Object.entries(days).map(([dayIdx, hrs]) => ({
    day: dayNames[Number(dayIdx)],
    avgHours: hrs.length ? Math.round((hrs.reduce((a, b) => a + b, 0) / hrs.length) * 10) / 10 : 0,
    totalSessions: hrs.length,
  }));
}

/** Consecutive calendar days with at least 1 completed focus session */
export function computeFocusStreak(subjects: any[]) {
  const allDays = new Set<string>();
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        allDays.add(new Date(l.startedAt).toISOString().split('T')[0]);
      });
  });
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (allDays.has(d.toISOString().split('T')[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Average gap between consecutive sessions on the same day */
export function computeImplicitBreaks(subjects: any[]) {
  const logsByDay: Record<string, { start: number; end: number }[]> = {};
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        const key = new Date(l.startedAt).toISOString().split('T')[0];
        if (!logsByDay[key]) logsByDay[key] = [];
        logsByDay[key].push({
          start: new Date(l.startedAt).getTime(),
          end: new Date(l.endedAt).getTime(),
        });
      });
  });
  const breaks: number[] = [];
  Object.values(logsByDay).forEach((dayLogs) => {
    const sorted = dayLogs.sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i++) {
      const gap = (sorted[i].start - sorted[i - 1].end) / 1000 / 60; // minutes
      if (gap > 0 && gap < 480) breaks.push(gap); // ignore gaps > 8h
    }
  });
  return {
    avgBreakMins: breaks.length ? Math.round(breaks.reduce((a, b) => a + b, 0) / breaks.length) : 0,
    shortestMins: breaks.length ? Math.round(Math.min(...breaks)) : 0,
    longestMins: breaks.length ? Math.round(Math.max(...breaks)) : 0,
    totalBreaks: breaks.length,
  };
}

/** Context-switching: count distinct log entries per day */
export function computeContextSwitching(subjects: any[]) {
  const countByDay: Record<string, number> = {};
  (subjects || []).forEach((s: any) => {
    (s.subjectLogs || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        const k = new Date(l.startedAt).toISOString().split('T')[0];
        countByDay[k] = (countByDay[k] || 0) + 1;
      });
  });
  const counts = Object.values(countByDay);
  const avg = counts.length
    ? Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) / 10
    : 0;
  const highSwitchDays = counts.filter((c) => c >= 8).length;
  return {
    avgSessionsPerDay: avg,
    highSwitchDays,
    data: Object.entries(countByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// ── Task Deep Dive ──────────────────────────────────────────────────────────

/** Status breakdown for visualization */
export function computeTaskStatusDistribution(todos: any[]) {
  if (!todos?.length) return [];
  const statuses: Record<string, { count: number; color: string }> = {
    DONE: { count: 0, color: '#22c55e' },
    IN_PROGRESS: { count: 0, color: '#3b82f6' },
    PENDING: { count: 0, color: '#f59e0b' },
    CANCELLED: { count: 0, color: '#ef4444' },
  };
  todos.forEach((t: any) => {
    if (statuses[t.status]) statuses[t.status].count++;
  });
  return Object.entries(statuses).map(([status, { count, color }]) => ({
    status,
    count,
    color,
    pct: Math.round((count / todos.length) * 100),
  }));
}

/** Tasks past their due date that aren't done */
export function computeOverdueTasks(todos: any[]) {
  const now = new Date();
  const overdue = (todos || []).filter(
    (t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE' && !t.deleted,
  );
  return {
    count: overdue.length,
    tasks: overdue
      .slice(0, 5)
      .map((t: any) => ({ title: t.title, dueDate: t.dueDate, priority: t.priority })),
  };
}

/** Time between creating a task and first starting work on it */
export function computeProcrastinationDelta(todos: any[]) {
  const deltas: { title: string; priority: number; deltaMins: number }[] = [];
  (todos || []).forEach((t: any) => {
    const firstLog = (t.toDoLog || []).sort(
      (a: any, b: any) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    )[0];
    if (firstLog) {
      const delta =
        (new Date(firstLog.startedAt).getTime() - new Date(t.createdAt).getTime()) / 1000 / 60;
      if (delta > 0)
        deltas.push({ title: t.title, priority: t.priority, deltaMins: Math.round(delta) });
    }
  });
  const avg = deltas.length
    ? Math.round(deltas.reduce((s, d) => s + d.deltaMins, 0) / deltas.length)
    : 0;
  // group by priority
  const byPriority: Record<number, number[]> = {};
  deltas.forEach((d) => {
    if (!byPriority[d.priority]) byPriority[d.priority] = [];
    byPriority[d.priority].push(d.deltaMins);
  });
  const priorityAvgs = Object.entries(byPriority).map(([p, mins]) => ({
    priority: Number(p),
    avgMins: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length),
  }));
  return { avgMins: avg, count: deltas.length, byPriority: priorityAvgs };
}

/** Cancellation rate */
export function computeCancellationRate(todos: any[]) {
  if (!todos?.length) return 0;
  return Math.round(
    (todos.filter((t: any) => t.status === 'CANCELLED').length / todos.length) * 100,
  );
}

/** Average time from creation to completion for DONE tasks */
export function computeAvgCompletionTime(todos: any[]) {
  const doneTasks = (todos || []).filter((t: any) => t.status === 'DONE' && t.completedAt);
  if (!doneTasks.length) return { avgHours: 0, count: 0 };
  const totalMins = doneTasks.reduce((s: number, t: any) => {
    return s + (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 1000 / 60;
  }, 0);
  return {
    avgHours: Math.round((totalMins / doneTasks.length / 60) * 10) / 10,
    count: doneTasks.length,
  };
}

/** Logged work time across all todo logs */
export function computeTaskWorkTime(todos: any[]) {
  let totalSecs = 0;
  (todos || []).forEach((t: any) => {
    (t.toDoLog || [])
      .filter((l: any) => l.endedAt)
      .forEach((l: any) => {
        totalSecs += Math.max(
          0,
          (new Date(l.endedAt).getTime() - new Date(l.startedAt).getTime()) / 1000,
        );
      });
  });
  return Math.round((totalSecs / 60) * 10) / 10; // minutes
}

// ── Habit Deep Dive ─────────────────────────────────────────────────────────

/** Group habits by difficulty and compute avg consistency */
export function computeHabitDifficultyBreakdown(habits: any[]) {
  const groups: Record<string, { count: number; totalConsistency: number; color: string }> = {
    HIGH: { count: 0, totalConsistency: 0, color: '#ef4444' },
    MID: { count: 0, totalConsistency: 0, color: '#f59e0b' },
    LOW: { count: 0, totalConsistency: 0, color: '#22c55e' },
  };
  const streaks = computeHabitStreaks(habits);
  streaks.forEach((h) => {
    const diff = h.difficulty || 'MID';
    if (groups[diff]) {
      groups[diff].count++;
      groups[diff].totalConsistency += h.consistency;
    }
  });
  return Object.entries(groups)
    .filter(([, g]) => g.count > 0)
    .map(([difficulty, g]) => ({
      difficulty,
      avgConsistency: Math.round(g.totalConsistency / g.count),
      count: g.count,
      color: g.color,
    }));
}

/** Hour-of-day when habits are completed */
export function computeHabitTimeOfDay(habits: any[]) {
  const hours = new Array(24).fill(0);
  (habits || []).forEach((h: any) => {
    (h.log || [])
      .filter((l: any) => !l.deleted)
      .forEach((l: any) => {
        hours[new Date(l.startedAt).getHours()]++;
      });
  });
  const max = Math.max(...hours, 1);
  return hours.map((count, hour) => ({
    hour,
    count,
    label: `${hour.toString().padStart(2, '0')}:00`,
    intensity: count / max,
  }));
}

// ── Mood/Performance Balance ─────────────────────────────────────────────────

/** Compute performance balance from core app pillars */
export function computePerformanceBalance(
  focusTrend: ReturnType<typeof computeFocusTrend>,
  ratingStats: any,
  habitConsistency: number,
  taskRate: number,
) {
  const metrics = [
    {
      label: 'Focus Trend',
      value: focusTrend.direction === 'up' ? 80 : focusTrend.direction === 'down' ? 30 : 55,
      icon: '📈',
    },
    {
      label: 'Mood',
      value: ratingStats?.weeklyAverage ? (ratingStats.weeklyAverage / 5) * 100 : 50,
      icon: '😊',
    },
    { label: 'Habits', value: habitConsistency, icon: '🔥' },
    { label: 'Task Rate', value: taskRate, icon: '✅' },
  ];
  const overall = Math.round(metrics.reduce((s, m) => s + m.value, 0) / metrics.length);
  return { metrics, overall };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT BUNDLE — for JSON export
// ═══════════════════════════════════════════════════════════════════════════════

export function computeAllMetricsBundle(
  statsData: any,
  subjects: any[],
  habitsData: any[],
  todos: any[],
  ratingStats: any,
) {
  const focusTrend = computeFocusTrend(statsData?.focusTimeArray || []);
  const habitStreaks = computeHabitStreaks(habitsData || []);
  const overallHabitConsistency = habitStreaks.length
    ? Math.round(
        habitStreaks.reduce((s: number, h: any) => s + h.consistency, 0) / habitStreaks.length,
      )
    : 0;
  const taskCompletion = computeTaskCompletion(todos);
  const burnout = computeBurnoutRisk(
    focusTrend,
    ratingStats?.weeklyAverage ?? null,
    overallHabitConsistency,
  );
  const goalProgress = computeGoalProgress(subjects);
  const avgGoalPct = goalProgress.length
    ? Math.round(goalProgress.reduce((s: number, g: any) => s + g.pct, 0) / goalProgress.length)
    : 0;
  const moodNorm = ratingStats?.weeklyAverage ? (ratingStats.weeklyAverage / 5) * 100 : 50;

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      focusTrend,
      subjectDistribution: computeSubjectDistribution(subjects),
      goalProgress,
      habitStreaks,
      taskCompletion,
      burnout,
      productivityScore: computeProductivityScore(
        avgGoalPct,
        overallHabitConsistency,
        taskCompletion.rate,
        moodNorm,
      ),
    },
    detailed: {
      sessionStats: computeSessionStats(subjects),
      peakHours: computePeakHours(subjects),
      dayOfWeekPattern: computeDayOfWeekPattern(subjects),
      focusStreak: computeFocusStreak(subjects),
      implicitBreaks: computeImplicitBreaks(subjects),
      contextSwitching: computeContextSwitching(subjects),
      taskStatusDistribution: computeTaskStatusDistribution(todos),
      overdueTasks: computeOverdueTasks(todos),
      procrastinationDelta: computeProcrastinationDelta(todos),
      cancellationRate: computeCancellationRate(todos),
      avgCompletionTime: computeAvgCompletionTime(todos),
      taskWorkTime: computeTaskWorkTime(todos),
      habitDifficultyBreakdown: computeHabitDifficultyBreakdown(habitsData),
      habitTimeOfDay: computeHabitTimeOfDay(habitsData),
    },
    mood: ratingStats,
  };
}
