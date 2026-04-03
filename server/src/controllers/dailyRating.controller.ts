import { prisma } from '../../prisma/prismaClient';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const createOrUpdateDailyRating = asyncHandler(async (req: Request, res: Response) => {
  const { rating, description } = req.body || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id || req.body?.userId; // Depending on how auth is structured

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  // Find if rating already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingRating = await prisma.dailyRating.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
  });

  let dailyRating;
  if (existingRating) {
    dailyRating = await prisma.dailyRating.update({
      where: {
        id: existingRating.id,
      },
      data: {
        rating,
        description,
      },
    });
  } else {
    dailyRating = await prisma.dailyRating.create({
      data: {
        userId,
        rating,
        description,
        date: today,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, dailyRating, 'Daily rating saved successfully'));
});

const getDailyRatingStats = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id || req.params.userId || req.body?.userId;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const userIdNum = Number(userId);

  // Get today's rating
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRating = await prisma.dailyRating.findUnique({
    where: {
      userId_date: {
        userId: userIdNum,
        date: today,
      },
    },
  });

  // Get yesterday's rating
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayRating = await prisma.dailyRating.findUnique({
    where: {
      userId_date: {
        userId: userIdNum,
        date: yesterday,
      },
    },
  });

  // Get last 21 days for average
  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

  const last21DaysRatings = await prisma.dailyRating.findMany({
    where: {
      userId: userIdNum,
      date: {
        gte: twentyOneDaysAgo,
        lte: today,
      },
    },
  });

  // Get last 7 days for weekly average
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysRatings = last21DaysRatings.filter((r) => r.date >= sevenDaysAgo);

  const weeklyAverage =
    last7DaysRatings.length > 0
      ? last7DaysRatings.reduce((acc, curr) => acc + curr.rating, 0) / last7DaysRatings.length
      : 0;

  const twentyOneDayAverage =
    last21DaysRatings.length > 0
      ? last21DaysRatings.reduce((acc, curr) => acc + curr.rating, 0) / last21DaysRatings.length
      : 0;

  const differenceFromYesterday =
    todayRating && yesterdayRating ? todayRating.rating - yesterdayRating.rating : null;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        today: todayRating?.rating || null,
        description: todayRating?.description || '',
        yesterday: yesterdayRating?.rating || null,
        difference: differenceFromYesterday,
        weeklyAverage: Number(weeklyAverage.toFixed(1)),
        twentyOneDayAverage: Number(twentyOneDayAverage.toFixed(1)),
      },
      'Daily rating stats fetched successfully',
    ),
  );
});

export { createOrUpdateDailyRating, getDailyRatingStats };
