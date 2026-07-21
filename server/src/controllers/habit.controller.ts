import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { startOfDay, endOfDay, setHours as setDateHours } from 'date-fns';

const getAllHabits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
    },
    include: {
      subject: true,
    },
  });

  return res.status(200).json(new ApiResponse(200, habits, 'Habits fetched successfully'));
});

const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, difficulty, subjectId, autoCompleteTime, badDayPlan } = req.body;
  const userId = req.user?.id;

  if (!userId || !name) {
    throw new ApiError(400, 'Name is required');
  }

  const activeHabitCount = await prisma.habit.count({
    where: { userId: Number(userId), deleted: false },
  });

  if (activeHabitCount >= 6) {
    throw new ApiError(
      400,
      'You can only track up to 6 habits at a time. Delete an existing habit to add a new one.',
    );
  }

  // Check if a soft-deleted habit with the same name exists — restore it instead
  const existing = await prisma.habit.findFirst({
    where: {
      userId: Number(userId),
      name: { equals: name.trim(), mode: 'insensitive' },
      deleted: true,
    },
  });

  if (existing) {
    // Restore the old habit with updated settings, keeping all historical logs
    const restored = await prisma.habit.update({
      where: { id: existing.id },
      data: {
        deleted: false,
        deletedAt: null,
        description: description || existing.description,
        difficulty: difficulty || existing.difficulty,
        badDayPlan: badDayPlan !== undefined ? badDayPlan || null : existing.badDayPlan,
        subjectId: subjectId ? parseInt(subjectId) : existing.subjectId,
        autoCompleteTime:
          autoCompleteTime !== undefined && autoCompleteTime !== null
            ? Number(autoCompleteTime)
            : existing.autoCompleteTime,
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...restored, restored: true },
          'Habit restored with existing history',
        ),
      );
  }

  const habit = await prisma.habit.create({
    data: {
      name: name.trim(),
      userId: Number(userId),
      description: description || '',
      difficulty: difficulty || 'MID',
      badDayPlan: badDayPlan || null,
      subjectId: subjectId ? parseInt(subjectId) : null,
      autoCompleteTime:
        autoCompleteTime !== undefined && autoCompleteTime !== null
          ? Number(autoCompleteTime)
          : null,
    },
  });

  res.status(200).json(new ApiResponse(200, habit, 'Habit created successfully'));
});

const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, difficulty, subjectId, deleted, autoCompleteTime, badDayPlan } =
    req.body;
  const idNum = Number(id);
  const userId = req.user?.id;

  // Verify ownership
  const existingHabit = await prisma.habit.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: false },
  });

  if (!existingHabit) {
    throw new ApiError(404, 'Habit not found');
  }

  // subjectId may arrive as a number, stringified number, or null
  const resolvedSubjectId =
    subjectId === null || subjectId === 'null' || subjectId === ''
      ? null
      : subjectId !== undefined
        ? Number(subjectId)
        : undefined;

  // autoCompleteTime: null clears it, number sets it, undefined leaves it unchanged
  const resolvedAutoCompleteTime =
    autoCompleteTime === null || autoCompleteTime === 'null' || autoCompleteTime === ''
      ? null
      : autoCompleteTime !== undefined
        ? Number(autoCompleteTime)
        : undefined;

  const updatedHabit = await prisma.habit.update({
    where: {
      id: idNum,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(difficulty !== undefined && { difficulty }),
      ...(badDayPlan !== undefined && { badDayPlan }),
      ...(resolvedSubjectId !== undefined && { subjectId: resolvedSubjectId }),
      ...(resolvedAutoCompleteTime !== undefined && { autoCompleteTime: resolvedAutoCompleteTime }),
      ...(deleted !== undefined && { deleted }),
    },
  });

  return res.status(200).json(new ApiResponse(200, updatedHabit, 'Habit updated successfully'));
});

const startHabitLog = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);
  const userId = req.user?.id;

  // Verify ownership
  const habit = await prisma.habit.findFirst({
    where: { id: habitIdNum, userId: Number(userId), deleted: false },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const log = await prisma.habitTimeLog.create({
    data: {
      habitId: habitIdNum,
      startedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, log, 'Started Habit Timer'));
});

const endHabitLog = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);
  const userId = req.user?.id;

  const activeLog = await prisma.habitTimeLog.findFirst({
    where: {
      habitId: habitIdNum,
      endedAt: null,
      deleted: false,
      habit: {
        userId: Number(userId),
        deleted: false,
      },
    },
  });

  if (!activeLog) {
    throw new ApiError(404, 'Active habit timer not found');
  }

  const updatedLog = await prisma.habitTimeLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, updatedLog, 'Ended Habit Timer'));
});

const getHabitLogs = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);
  const { from, to } = req.query;
  const userId = req.user?.id;

  if (!habitId) {
    throw new ApiError(400, 'Habit ID is required');
  }

  // Verify ownership
  const habit = await prisma.habit.findFirst({
    where: { id: habitIdNum, userId: Number(userId), deleted: false },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const logs = await prisma.habitTimeLog.findMany({
    where: {
      habitId: habitIdNum,
      deleted: false,
      ...(from || to
        ? {
            startedAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  return res.status(200).json(new ApiResponse(200, logs, 'Habit logs fetched successfully'));
});

const getAllHabitsWithLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  // Include deleted habits so their historical logs still appear in the heatmap/stats
  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
    },
    include: {
      subject: true,
      log: {
        where: {
          deleted: false,
          ...(from || to
            ? {
                startedAt: {
                  ...(from && { gte: new Date(from as string) }),
                  ...(to && { lte: new Date(to as string) }),
                },
              }
            : {}),
        },
        orderBy: {
          startedAt: 'desc',
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, habits, 'Habits with logs fetched successfully'));
});

const getHabitDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);
  const { date } = req.query;

  const targetDate = date ? new Date(date as string) : new Date();
  const isPastDate = date && targetDate < startOfDay(new Date());

  // Use passed boundaries if available, otherwise default to midnight
  let startBoundary = startOfDay(targetDate);
  let endBoundary = endOfDay(targetDate);

  if (req.query.from && req.query.to) {
    startBoundary = new Date(req.query.from as string);
    endBoundary = new Date(req.query.to as string);
  }

  // For past dates: include habits that existed at that time (not yet deleted)
  // For today: only active habits
  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
      ...(isPastDate
        ? {
            createdAt: { lte: endBoundary },
            OR: [{ deleted: false }, { deleted: true, deletedAt: { gt: endBoundary } }],
          }
        : { deleted: false }),
    },
    include: {
      subject: true,
    },
  });

  // For today logs: only query active habits' logs
  const todayLogs = await prisma.habitTimeLog.findMany({
    where: {
      habit: {
        userId: userIdNum,
      },
      startedAt: {
        gte: startBoundary,
        lte: endBoundary,
      },
      deleted: false,
    },
    include: {
      habit: true,
    },
  });

  const activeLog = await prisma.habitTimeLog.findFirst({
    where: {
      habit: {
        userId: userIdNum,
        deleted: false,
      },
      endedAt: null,
      deleted: false,
    },
    include: {
      habit: true,
    },
  });

  // Annotate habits with isDeleted flag for frontend to render differently
  const habitsWithStatus = habits.map((h) => ({
    ...h,
    isDeleted: h.deleted,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        habits: habitsWithStatus,
        todayStats: todayLogs,
        activeLog,
      },
      'Habit dashboard data fetched successfully',
    ),
  );
});

const toggleHabitCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const { isBadDayPlan, date, from, to } = req.body;
  const habitIdNum = Number(habitId);
  const userId = req.user?.id;

  // Verify ownership — allow deleted habits for past-date toggling
  const habit = await prisma.habit.findFirst({
    where: { id: habitIdNum, userId: Number(userId) },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const targetDateObj = date ? new Date(date as string) : new Date();

  let startBoundary = startOfDay(targetDateObj);
  let endBoundary = endOfDay(targetDateObj);

  if (from && to) {
    startBoundary = new Date(from as string);
    endBoundary = new Date(to as string);
  }

  const existingLog = await prisma.habitTimeLog.findFirst({
    where: {
      habitId: habitIdNum,
      startedAt: { gte: startBoundary, lte: endBoundary },
      deleted: false,
    },
  });

  if (existingLog) {
    await prisma.habitTimeLog.update({
      where: { id: existingLog.id },
      data: { deleted: true },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { completed: false }, 'Habit uncompleted for today'));
  } else {
    // If retroactively logging for a past day, use noon of that day. Otherwise use current time.
    const logTime = date ? setDateHours(startOfDay(new Date(date as string)), 12) : new Date();

    await prisma.habitTimeLog.create({
      data: {
        habitId: habitIdNum,
        startedAt: logTime,
        endedAt: logTime, // Instant completion
        isBadDayPlan: isBadDayPlan || false,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { completed: true }, 'Habit completed for today'));
  }
});

const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  const userId = req.user?.id;

  const existingHabit = await prisma.habit.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: false },
  });

  if (!existingHabit) {
    throw new ApiError(404, 'Habit not found');
  }

  await prisma.habit.update({
    where: { id: idNum },
    data: { deleted: true, deletedAt: new Date() },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Habit deleted successfully'));
});

const getDeletedHabits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const deleted = await prisma.habit.findMany({
    where: { userId: Number(userId), deleted: true },
    include: {
      subject: true,
      _count: { select: { log: { where: { deleted: false } } } },
    },
    orderBy: { deletedAt: 'desc' },
  });

  return res.status(200).json(new ApiResponse(200, deleted, 'Deleted habits fetched'));
});

const restoreHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  // Verify ownership and that it is actually deleted
  const habit = await prisma.habit.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: true },
  });
  if (!habit) throw new ApiError(404, 'Archived habit not found');

  // Enforce 6-habit limit
  const activeCount = await prisma.habit.count({
    where: { userId: Number(userId), deleted: false },
  });
  if (activeCount >= 6) {
    throw new ApiError(
      400,
      'You can only track up to 6 habits at a time. Remove an active habit first.',
    );
  }

  const restored = await prisma.habit.update({
    where: { id: idNum },
    data: { deleted: false, deletedAt: null },
  });

  return res.status(200).json(new ApiResponse(200, restored, 'Habit restored successfully'));
});

export {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  startHabitLog,
  endHabitLog,
  getHabitLogs,
  getAllHabitsWithLogs,
  getHabitDashboardData,
  toggleHabitCompletion,
  getDeletedHabits,
  restoreHabit,
};
