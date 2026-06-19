import { prisma } from '../../prisma/prismaClient.js';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createOrUpdateDailyRating = asyncHandler(async (req: Request, res: Response) => {
  const { rating, description, content, date } = req.body || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  // rating is optional so condion invalid on saving just rating if they just want to save journal content without rating yet
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const existingRating = await prisma.dailyRating.findUnique({
    where: {
      userId_date: {
        userId,
        date: targetDate,
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
        rating: rating !== undefined ? rating : existingRating.rating,
        description: description !== undefined ? description : existingRating.description,
        content: content !== undefined ? content : existingRating.content,
      },
    });
  } else {
    dailyRating = await prisma.dailyRating.create({
      data: {
        userId,
        rating: rating || 0,
        description,
        content,
        date: targetDate,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, dailyRating, 'Daily review saved successfully'));
});

const getDailyRatingByDate = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const dateStr = req.query.date as string;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const dailyRating = await prisma.dailyRating.findUnique({
    where: {
      userId_date: {
        userId,
        date: targetDate,
      },
    },
  });

  // Also return the user's review template so the frontend can initialize a blank day
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { reviewTemplate: true },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rating: dailyRating,
        template: user?.reviewTemplate || null,
      },
      'Daily rating fetched successfully',
    ),
  );
});

const updateReviewTemplate = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { template } = req.body;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { reviewTemplate: template },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { template: updatedUser.reviewTemplate },
        'Review template updated successfully',
      ),
    );
});

const getDailyRatingStats = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
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

  // Get last 90 days for extended history
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const allRatings = await prisma.dailyRating.findMany({
    where: {
      userId: userIdNum,
      date: {
        gte: ninetyDaysAgo,
        lte: today,
      },
    },
    orderBy: { date: 'desc' },
  });

  // Filter out 0 ratings (unrated journal-only days) for the averages
  const ratedRatings = allRatings.filter((r: any) => r.rating > 0);

  // Get last 7 days for weekly average
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysRatings = ratedRatings.filter((r: any) => r.date >= sevenDaysAgo);

  const weeklyAverage =
    last7DaysRatings.length > 0
      ? last7DaysRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
        last7DaysRatings.length
      : 0;

  // Get last 21 days for 21-day average
  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

  const last21DaysRatings = ratedRatings.filter((r: any) => r.date >= twentyOneDaysAgo);

  const twentyOneDayAverage =
    last21DaysRatings.length > 0
      ? last21DaysRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
        last21DaysRatings.length
      : 0;

  const differenceFromYesterday =
    todayRating && yesterdayRating && todayRating.rating > 0 && yesterdayRating.rating > 0
      ? todayRating.rating - yesterdayRating.rating
      : null;

  const history = allRatings.map((r: any) => ({
    date: r.date.toISOString(),
    rating: r.rating,
    description: r.description || '',
    content: r.content || [],
  }));

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
        history,
      },
      'Daily rating stats fetched successfully',
    ),
  );
});

export {
  createOrUpdateDailyRating,
  getDailyRatingStats,
  getDailyRatingByDate,
  updateReviewTemplate,
};
