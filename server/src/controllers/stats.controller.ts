import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const getDailyTimeline = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { date } = req.query; // Expecting YYYY-MM-DD

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const targetDate = date ? new Date(date as string) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch Subject Logs
  const subjectLogs = await prisma.subjectLog.findMany({
    where: {
      subject: { userId: userIdNum },
      startedAt: { gte: startOfDay, lte: endOfDay },
      deleted: false,
    },
    include: { subject: true },
  });

  // Fetch Habit Logs
  const habitLogs = await prisma.habitTimeLog.findMany({
    where: {
      habit: { userId: userIdNum },
      startedAt: { gte: startOfDay, lte: endOfDay },
      deleted: false,
    },
    include: { habit: true },
  });

  // Fetch ToDo Logs
  const toDoLogs = await prisma.toDoLog.findMany({
    where: {
      toDo: { userId: userIdNum },
      startedAt: { gte: startOfDay, lte: endOfDay },
    },
    include: { toDo: true },
  });

  // Consolidate into a single timeline
  const timeline = [
    ...subjectLogs.map((log) => ({
      id: `subject-${log.id}`,
      type: 'subject',
      name: log.subject.name,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
    ...habitLogs.map((log) => ({
      id: `habit-${log.id}`,
      type: 'habit',
      name: log.habit.name,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
    ...toDoLogs.map((log) => ({
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    focusTimeByDate[d.toISOString().split('T')[0]] = 0;
  }

  recentSubjectLogs.forEach((log) => {
    if (!log.endedAt) return;
    const dateStr = log.startedAt.toISOString().split('T')[0];
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

  const todayFocus = focusTimeByDate[today.toISOString().split('T')[0]] || 0;
  const weeklyFocusAverage =
    focusTimeArray.slice(-7).reduce((acc, curr) => acc + curr.focusTimeSecs, 0) / 7;

  // 2. Habit Stats
  const userHabits = await prisma.habit.findMany({
    where: { userId: userIdNum, deleted: false },
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
    habitsCompletedByDate[d.toISOString().split('T')[0]] = new Set();
  }

  recentHabitLogs.forEach((log) => {
    const dateStr = log.startedAt.toISOString().split('T')[0];
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

  const todayHabitCompletion = habitsCompletedByDate[today.toISOString().split('T')[0]]?.size || 0;
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
