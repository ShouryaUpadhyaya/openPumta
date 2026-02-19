import { NextFunction, Request, Response } from "express";
import { prisma } from "../../prisma/prismaClient";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const getAllHabits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    if (!userId) {
      throw new ApiError(400, "UserId is required ");
    }
    const allHabits = await prisma.habit.findMany({
      where: { userId: parseInt(userId) },
    });
    res
      .status(200)
      .json(new ApiResponse(200, allHabits, "Got all habits for user"));
  },
);

const addHabit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, habitName, description, difficulty } = req.body;
    if (!userId || !habitName || !description || !difficulty) {
      throw new ApiError(400, "Enter all the required feild");
    }
    const createdHabit = await prisma.habit.create({
      data: {
        name: habitName,
        userId: parseInt(userId),
        description: description,
        difficulty: difficulty,
        deleted: false,
      },
    });
    res
      .status(200)
      .json(new ApiResponse(200, createdHabit, "Habit added successfully"));
  },
);

const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const { HabitId, name, SubjectId, description, difficulty, deleted } =
    req.body;

  if (!HabitId) {
    throw new ApiError(400, "HabitId is required");
  }

  const updatedHabit = await prisma.habit.update({
    where: {
      id: parseInt(HabitId),
    },
    data: {
      ...(name !== undefined && { name }),
      ...(SubjectId !== undefined && { subjectId: SubjectId }),
      ...(description !== undefined && { description }),
      ...(difficulty !== undefined && { difficulty }),
      ...(deleted !== undefined && { deleted }),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedHabit, "Habit updated successfully"));
});

const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const { habitId, userId } = req.body;

  const deletedHabit = await prisma.habit.update({
    where: {
      id: parseInt(habitId),
      userId: parseInt(userId),
    },
    data: {
      deleted: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedHabit, "User deleted successfully"));
});

export { getAllHabits, deleteHabit, updateHabit, addHabit };
