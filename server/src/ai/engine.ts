import { durationSecs, dayKey, lastNDays, sum, avg, round1 } from './helpers.js';

interface Log {
  startedAt: Date;
  endedAt: Date | null;
  deleted: boolean;
}

interface SubjectLog extends Log {
  subjectId: number;
}

interface HabitLog extends Log {
  habitId: number;
}

interface Subject {
  id: number;
  name: string;
  goalWorkSecs: number;
  deleted: boolean;
}

interface Habit {
  id: number;
  name: string;
  difficulty: string;
  deleted: boolean;
}

interface DailyRating {
  date: Date;
  rating: number;
}

export interface Metrics {
  generatedAt: string;
  focus: ReturnType<typeof focusTrend>;
  habits: ReturnType<typeof habitConsistency>;
  subjects: ReturnType<typeof subjectBreakdown>;
  mood: ReturnType<typeof moodTrend>;
  burnoutRisk: ReturnType<typeof burnoutRisk>;
  weakestSubject: string | null;
  strongestSubject: string | null;
}

function active<T extends { deleted: boolean }>(rows: T[]): T[] {
  return rows.filter((r) => !r.deleted);
}

function focusByDay(subjectLogs: SubjectLog[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const log of active(subjectLogs)) {
    const secs = durationSecs(log);
    if (secs === 0) continue;
    const key = dayKey(log.startedAt);
    map[key] = (map[key] || 0) + secs;
  }
  return map;
}

export function focusTrend(subjectLogs: SubjectLog[], today: Date = new Date()) {
  const focusMap = focusByDay(subjectLogs);
  const thisWeek = lastNDays(7, today);
  const prevWeekEnd = new Date(today);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
  const prevWeek = lastNDays(7, prevWeekEnd);

  const toMinutes = (days: string[]) =>
    days.map((d) => round1((focusMap[d] || 0) / 60));

  const thisTotal = round1(sum(toMinutes(thisWeek)));
  const prevTotal = round1(sum(toMinutes(prevWeek)));

  let pctChange: number | null = null;
  if (prevTotal > 0) pctChange = round1(((thisTotal - prevTotal) / prevTotal) * 100);

  let direction = 'flat';
  if (pctChange !== null) {
    if (pctChange > 5) direction = 'improving';
    else if (pctChange < -5) direction = 'declining';
  } else if (thisTotal > 0) {
    direction = 'improving';
  }

  return { thisWeekMinutes: thisTotal, prevWeekMinutes: prevTotal, pctChange, direction, avgDailyThisWeek: round1(thisTotal / 7) };
}

export function habitConsistency(habits: Habit[], habitLogs: HabitLog[], today: Date = new Date()) {
  const days = lastNDays(7, today);
  const activeHabits = active(habits);
  const logs = active(habitLogs).filter((l) => l.endedAt);

  const doneByHabit: Record<number, Set<string>> = {};
  for (const log of logs) {
    const key = dayKey(log.startedAt);
    if (!days.includes(key)) continue;
    if (!doneByHabit[log.habitId]) doneByHabit[log.habitId] = new Set();
    doneByHabit[log.habitId].add(key);
  }

  const perHabit = activeHabits.map((h) => {
    const daysDone = doneByHabit[h.id] ? doneByHabit[h.id].size : 0;
    return { habitId: h.id, name: h.name, difficulty: h.difficulty, daysCompleted: daysDone, consistencyPct: round1((daysDone / 7) * 100) };
  });

  const possible = activeHabits.length * 7;
  const completed = sum(perHabit.map((p) => p.daysCompleted));
  const overallPct = possible > 0 ? round1((completed / possible) * 100) : 0;

  return { overallPct, perHabit, trackedHabits: activeHabits.length };
}

export function subjectBreakdown(subjects: Subject[], subjectLogs: SubjectLog[], today: Date = new Date()) {
  const days = lastNDays(7, today);
  const bySubject: Record<number, number> = {};
  for (const log of active(subjectLogs)) {
    const secs = durationSecs(log);
    if (secs === 0) continue;
    if (!days.includes(dayKey(log.startedAt))) continue;
    bySubject[log.subjectId] = (bySubject[log.subjectId] || 0) + secs;
  }

  return subjects
    .map((s) => {
      const actualSecs = bySubject[s.id] || 0;
      const goalWeekSecs = s.goalWorkSecs * 7;
      return { subjectId: s.id, name: s.name, actualMinutes: round1(actualSecs / 60), weeklyGoalMinutes: round1(goalWeekSecs / 60), goalMetPct: goalWeekSecs > 0 ? round1((actualSecs / goalWeekSecs) * 100) : null };
    })
    .sort((a, b) => b.actualMinutes - a.actualMinutes);
}

export function moodTrend(ratings: DailyRating[], today: Date = new Date()) {
  const thisWeek = lastNDays(7, today);
  const prevWeekEnd = new Date(today);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
  const prevWeek = lastNDays(7, prevWeekEnd);

  const ratingByDay: Record<string, number> = {};
  for (const r of ratings) ratingByDay[dayKey(r.date)] = r.rating;

  const thisVals = thisWeek.map((d) => ratingByDay[d]).filter((v) => v != null) as number[];
  const prevVals = prevWeek.map((d) => ratingByDay[d]).filter((v) => v != null) as number[];

  return { avgThisWeek: thisVals.length ? round1(avg(thisVals)) : null, avgPrevWeek: prevVals.length ? round1(avg(prevVals)) : null, daysRated: thisVals.length };
}

export function burnoutRisk({ trend, mood, consistency }: { trend: ReturnType<typeof focusTrend>; mood: ReturnType<typeof moodTrend>; consistency: ReturnType<typeof habitConsistency> }) {
  let score = 0;
  const reasons: string[] = [];

  if (trend.direction === 'declining') {
    if (trend.pctChange !== null && trend.pctChange <= -30) {
      score += 2;
      reasons.push(`focus down ${Math.abs(trend.pctChange)}% vs last week`);
    } else {
      score += 1;
      reasons.push('focus trending down');
    }
  }

  if (mood.avgThisWeek !== null) {
    if (mood.avgThisWeek <= 2.5) {
      score += 2;
      reasons.push(`low average mood (${mood.avgThisWeek}/5)`);
    } else if (mood.avgPrevWeek !== null && mood.avgThisWeek < mood.avgPrevWeek - 0.7) {
      score += 1;
      reasons.push('mood declining week-over-week');
    }
  }

  if (consistency.trackedHabits > 0) {
    if (consistency.overallPct < 40) {
      score += 2;
      reasons.push(`low habit consistency (${consistency.overallPct}%)`);
    } else if (consistency.overallPct < 60) {
      score += 1;
      reasons.push(`habit consistency slipping (${consistency.overallPct}%)`);
    }
  }

  let level = 'low';
  if (score >= 4) level = 'high';
  else if (score >= 2) level = 'moderate';

  return { level, score, reasons };
}

export function computeMetrics(
  data: { subjectLogs: SubjectLog[]; habitLogs: HabitLog[]; habits: Habit[]; subjects: Subject[]; dailyRatings: DailyRating[] },
  today: Date = new Date()
): Metrics {
  const trend = focusTrend(data.subjectLogs, today);
  const consistency = habitConsistency(data.habits, data.habitLogs, today);
  const subjects = subjectBreakdown(data.subjects, data.subjectLogs, today);
  const mood = moodTrend(data.dailyRatings, today);
  const risk = burnoutRisk({ trend, mood, consistency });

  return {
    generatedAt: today.toISOString(),
    focus: trend,
    habits: consistency,
    subjects,
    mood,
    burnoutRisk: risk,
    weakestSubject: subjects.length ? subjects[subjects.length - 1].name : null,
    strongestSubject: subjects.length ? subjects[0].name : null,
  };
}