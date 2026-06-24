import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { computeMetrics } from '../ai/engine.js';
import { buildWeeklyReportPrompt, buildChatPrompt, callGroq } from '../ai/llm.js';

const getWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const userIdNum = Number(userId);

  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const [subjectLogs, subjects, habits, habitLogs, dailyRatings] = await Promise.all([
    prisma.subjectLog.findMany({
      where: {
        subject: { userId: userIdNum },
        startedAt: { gte: fourteenDaysAgo },
        deleted: false,
      },
    }),
    prisma.subject.findMany({ where: { userId: userIdNum, deleted: false } }),
    prisma.habit.findMany({ where: { userId: userIdNum, deleted: false } }),
    prisma.habitTimeLog.findMany({
      where: { habit: { userId: userIdNum }, startedAt: { gte: fourteenDaysAgo }, deleted: false },
    }),
    prisma.dailyRating.findMany({
      where: { userId: userIdNum, date: { gte: fourteenDaysAgo } },
    }),
  ]);

  const metrics = computeMetrics({ subjectLogs, subjects, habits, habitLogs, dailyRatings });
  const prompt = buildWeeklyReportPrompt(metrics);
  const report = await callGroq(prompt);

  return res.status(200).json(new ApiResponse(200, { report, metrics }, 'Weekly report generated'));
});

const chat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const userIdNum = Number(userId);

  const { message, history = [] } = req.body;
  if (!message) throw new ApiError(400, 'message is required');

  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const [subjectLogs, subjects, habits, habitLogs, dailyRatings] = await Promise.all([
    prisma.subjectLog.findMany({
      where: {
        subject: { userId: userIdNum },
        startedAt: { gte: fourteenDaysAgo },
        deleted: false,
      },
    }),
    prisma.subject.findMany({ where: { userId: userIdNum, deleted: false } }),
    prisma.habit.findMany({ where: { userId: userIdNum, deleted: false } }),
    prisma.habitTimeLog.findMany({
      where: { habit: { userId: userIdNum }, startedAt: { gte: fourteenDaysAgo }, deleted: false },
    }),
    prisma.dailyRating.findMany({
      where: { userId: userIdNum, date: { gte: fourteenDaysAgo } },
    }),
  ]);

  const metrics = computeMetrics({ subjectLogs, subjects, habits, habitLogs, dailyRatings });
  const prompt = buildChatPrompt(metrics, history, message);
  const reply = await callGroq(prompt);

  return res.status(200).json(new ApiResponse(200, { reply, metrics }, 'Chat response generated'));
});

export { getWeeklyReport, chat };
