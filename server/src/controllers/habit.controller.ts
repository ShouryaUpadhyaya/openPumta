import { Request, Response } from "express";
import { prisma } from "../../prisma/prismaClient";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const getAllHabits = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userIdNum = Number(userId);
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

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

  return res
    .status(200)
    .json(new ApiResponse(200, habits, "Habits fetched successfully"));
});

const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const { userId, name, description, difficulty, subjectId } = req.body;

  if (!userId || !name) {
    throw new ApiError(400, "User ID and Name are required");
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      userId: parseInt(userId),
      description: description || "",
      difficulty: difficulty || "MID",
      subjectId: subjectId ? parseInt(subjectId) : null,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, habit, "Habit created successfully"));
});

const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, difficulty, subjectId, deleted } = req.body;
  const idNum = Number(id);

  const updatedHabit = await prisma.habit.update({
    where: {
      id: idNum,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(difficulty !== undefined && { difficulty }),
      ...(subjectId !== undefined && { subjectId: subjectId ? parseInt(subjectId) : null }),
      ...(deleted !== undefined && { deleted }),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedHabit, "Habit updated successfully"));
});

const startHabitLog = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);

  const log = await prisma.habitTimeLog.create({
    data: {
      habitId: habitIdNum,
      startedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, log, "Started Habit Timer"));
});

const endHabitLog = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);

  const activeLog = await prisma.habitTimeLog.findFirst({
    where: {
      habitId: habitIdNum,
      endedAt: null,
      deleted: false,
    },
  });

  if (!activeLog) {
    throw new ApiError(404, "Active habit timer not found");
  }

  const updatedLog = await prisma.habitTimeLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, updatedLog, "Ended Habit Timer"));
});

const getHabitLogs = asyncHandler(async (req: Request, res: Response) => {
  const { habitId } = req.params;
  const habitIdNum = Number(habitId);
  const { from, to } = req.query;

  if (!habitId) {
    throw new ApiError(400, "Habit ID is required");
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
      startedAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Habit logs fetched successfully"));
});

const getAllHabitsWithLogs = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { from, to } = req.query;
  const userIdNum = Number(userId);

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

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
          startedAt: "desc",
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, habits, "Habits with logs fetched successfully"));
});

const getHabitDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userIdNum = Number(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
    },
    include: {
      subject: true,
    }
  });

  const todayLogs = await prisma.habitTimeLog.findMany({
    where: {
      habit: {
        userId: userIdNum,
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
      "Habit dashboard data fetched successfully",
    ),
  );
});

export {
  getAllHabits,
  createHabit,
  updateHabit,
  startHabitLog,
  endHabitLog,
  getHabitLogs,
  getAllHabitsWithLogs,
  getHabitDashboardData,
};
