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
      where: { userId: userId },
    });
    res
      .sendStatus(200)
      .json(new ApiResponse(200, allHabits, "Got all habits for user"));
  },
);

const addHabit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, habitName, description, difficulty } = req.body;
    if (!(userId || habitName || description || difficulty)) {
      throw new ApiError(400, "Enter all the required feild");
    }
    const createdHabit = await prisma.habit.create({
      data: {
        name: habitName,
        userId: userId,
        description: description,
        difficulty: difficulty,
        deleted: false,
      },
    });
    res
      .sendStatus(200)
      .json(new ApiResponse(200, createdHabit, "Habit added successfully"));
  },
);

const updateHabit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      userId,
      HabitId,
      name,
      SubjectId,
      description,
      difficulty,
      deleted,
    } = req.body;
    if (
      !(
        userId ||
        HabitId ||
        name ||
        SubjectId ||
        description ||
        difficulty ||
        deleted
      )
    ) {
      throw new ApiError(400, "All the required fields not present");
    }
    const updatedHabit = await prisma.habit.update({
      where: {
        id: HabitId,
      },
      data: {
        id: HabitId,
        userId: userId,
        name: name,
        subjectId: SubjectId,
        description: description,
        difficulty: difficulty,
        deleted: deleted,
      },
    });
    res
      .sendStatus(200)
      .json(new ApiResponse(200, updatedHabit, "updated habit"));
  },
);

const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const { habitId, userId } = req.body;

  const deletedHabit = await prisma.habit.update({
    where: {
      id: habitId,
      userId: userId,
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
