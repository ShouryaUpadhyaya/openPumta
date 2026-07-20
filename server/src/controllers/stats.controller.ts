import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const pad = (n: number) => String(n).padStart(2, '0');
function getLocalIsoDate(date: Date | string | number = new Date()): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const getDailyTimeline = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { date, from, to } = req.query; // Expecting YYYY-MM-DD

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const targetDate = date ? new Date(date as string) : new Date();
  let startBoundary = new Date(targetDate);
  startBoundary.setHours(0, 0, 0, 0);
  let endBoundary = new Date(targetDate);
  endBoundary.setHours(23, 59, 59, 999);

  if (from && to) {
    startBoundary = new Date(from as string);
    endBoundary = new Date(to as string);
  }

  // Fetch Subject Logs — include deleted subjects so their history shows in timeline
  const subjectLogs = await prisma.subjectLog.findMany({
    where: {
      subject: { userId: userIdNum },
      startedAt: { gte: startBoundary, lte: endBoundary },
      deleted: false,
    },
    include: { subject: true },
  });

  // Fetch Habit Logs — include deleted habits so their history shows in timeline
  const habitLogs = await prisma.habitTimeLog.findMany({
    where: {
      habit: { userId: userIdNum },
      startedAt: { gte: startBoundary, lte: endBoundary },
      deleted: false,
    },
    include: { habit: true },
  });

  // Fetch ToDo Logs
  const toDoLogs = await prisma.toDoLog.findMany({
    where: {
      toDo: { userId: userIdNum, deleted: false },
      startedAt: { gte: startBoundary, lte: endBoundary },
      deleted: false,
    },
    include: { toDo: true },
  });

  // Consolidate into a single timeline
  const timeline = [
    ...subjectLogs.map((log: any) => ({
      id: `subject-${log.id}`,
      type: 'subject',
      name: log.subject.name,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
    ...habitLogs.map((log: any) => ({
      id: `habit-${log.id}`,
      type: 'habit',
      name: log.habit.name,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
    ...toDoLogs.map((log: any) => ({
      id: `todo-${log.id}`,
      type: 'todo',
      name: log.toDo?.title || 'Unknown Task',
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
  ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return res
    .status(200)
    .json(new ApiResponse(200, timeline, 'Daily timeline fetched successfully'));
});

const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { from } = req.query;
  const userIdNum = Number(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (from) {
    const fromDate = new Date(from as string);
    today.setTime(fromDate.getTime());
  }

  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(today.getDate() - 21);

  // 1. Focus Time (Subject Logs)
  const recentSubjectLogs = await prisma.subjectLog.findMany({
    where: {
      subject: { userId: userIdNum },
      startedAt: { gte: twentyOneDaysAgo },
      deleted: false,
      endedAt: { not: null },
    },
  });

  const focusTimeByDate: Record<string, number> = {};
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    focusTimeByDate[getLocalIsoDate(d)] = 0;
  }

  recentSubjectLogs.forEach((log: any) => {
    if (!log.endedAt) return;
    const dateStr = getLocalIsoDate(log.startedAt);
    if (focusTimeByDate[dateStr] !== undefined) {
      focusTimeByDate[dateStr] += Math.floor(
        (log.endedAt.getTime() - log.startedAt.getTime()) / 1000,
      );
    }
  });

  const focusTimeArray = Object.entries(focusTimeByDate)
    .map(([date, focusTimeSecs]) => ({
      date,
      focusTimeSecs,
      focusTimeHrs: Number((focusTimeSecs / 3600).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const todayFocus = focusTimeByDate[getLocalIsoDate(today)] || 0;
  const weeklyFocusAverage =
    focusTimeArray.slice(-7).reduce((acc, curr) => acc + curr.focusTimeSecs, 0) / 7;

  // 2. Habit Stats
  // Include deleted habits so their historical completion logs still count
  const userHabits = await prisma.habit.findMany({
    where: { userId: userIdNum },
  });

  const habitIds = userHabits.map((h) => h.id);

  const recentHabitLogs = await prisma.habitTimeLog.findMany({
    where: {
      habitId: { in: habitIds },
      startedAt: { gte: twentyOneDaysAgo },
      deleted: false,
    },
  });

  const habitsCompletedByDate: Record<string, Set<number>> = {};

  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    habitsCompletedByDate[getLocalIsoDate(d)] = new Set();
  }

  recentHabitLogs.forEach((log) => {
    const dateStr = getLocalIsoDate(log.startedAt);
    if (habitsCompletedByDate[dateStr] !== undefined) {
      habitsCompletedByDate[dateStr].add(log.habitId);
    }
  });

  let perfectDaysLast21 = 0;
  const habitCompletionRateByDate = Object.entries(habitsCompletedByDate)
    .map(([date, habitSet]) => {
      const completedCount = habitSet.size;
      const isPerfect = completedCount >= 4;
      if (isPerfect) perfectDaysLast21++;

      return {
        date,
        completedCount,
        isPerfect,
        rate:
          userHabits.length > 0
            ? Number(((completedCount / userHabits.length) * 100).toFixed(0))
            : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const todayHabitCompletion = habitsCompletedByDate[getLocalIsoDate(today)]?.size || 0;
  const todayHabitRate =
    userHabits.length > 0
      ? Number(((todayHabitCompletion / userHabits.length) * 100).toFixed(0))
      : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        focusTimeArray,
        habitCompletionRateByDate,
        summary: {
          todayFocusHrs: Number((todayFocus / 3600).toFixed(1)),
          weeklyFocusHrsAvg: Number((weeklyFocusAverage / 3600).toFixed(1)),
          perfectDaysLast21,
          todayHabitRate,
        },
      },
      'Dashboard stats fetched successfully',
    ),
  );
});

export { getDailyTimeline, getDashboardStats };
