import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const getAllHabits = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
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
  const { name, description, difficulty, subjectId, autoCompleteTime } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!userId || !name) {
    throw new ApiError(400, 'Name is required');
  }

  const habitCount = await prisma.habit.count({
    where: { userId: Number(userId), deleted: false },
  });

  if (habitCount >= 6) {
    throw new ApiError(
      400,
      'You can only track up to 6 habits at a time. Delete an existing habit to add a new one.',
    );
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      userId: Number(userId),
      description: description || '',
      difficulty: difficulty || 'MID',
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
  const { name, description, difficulty, subjectId, deleted, autoCompleteTime } = req.body;
  const idNum = Number(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
    },
    include: {
      subject: true,
    },
  });

  const todayLogs = await prisma.habitTimeLog.findMany({
    where: {
      habit: {
        userId: userIdNum,
        deleted: false,
      },
      startedAt: {
        gte: today,
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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        habits,
        todayStats: todayLogs,
        activeLog,
      },
      'Habit dashboard data fetched successfully',
    ),
  );
});

const toggleHabitCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  // Verify ownership
  const habit = await prisma.habit.findFirst({
    where: { id: habitIdNum, userId: Number(userId), deleted: false },
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.habitTimeLog.findFirst({
    where: {
      habitId: habitIdNum,
      startedAt: { gte: today },
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
    await prisma.habitTimeLog.create({
      data: {
        habitId: habitIdNum,
        startedAt: new Date(),
        endedAt: new Date(), // Instant completion
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  const existingHabit = await prisma.habit.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: false },
  });

  if (!existingHabit) {
    throw new ApiError(404, 'Habit not found');
  }

  await prisma.habit.update({
    where: { id: idNum },
    data: { deleted: true },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Habit deleted successfully'));
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
};
