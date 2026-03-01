import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const getAllToDos = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userIdNum = Number(userId);

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const toDos = await prisma.toDo.findMany({
    where: {
      userId: userIdNum,
    },
    include: {
      toDoLog: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json(new ApiResponse(200, toDos, 'ToDos fetched successfully'));
});

const createToDo = asyncHandler(async (req: Request, res: Response) => {
  const { userId, title, description } = req.body;

  if (!userId || !title) {
    throw new ApiError(400, 'User ID and Title are required');
  }

  const toDo = await prisma.toDo.create({
    data: {
      title,
      discription: description || '', // Matching schema's 'discription' spelling
      userId: parseInt(userId),
    },
  });

  res.status(200).json(new ApiResponse(200, toDo, 'ToDo created successfully'));
});

const updateToDo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const idNum = Number(id);

  if (!id) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  const updatedToDo = await prisma.toDo.update({
    where: {
      id: idNum,
    },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { discription: description }),
    },
  });

  return res.status(200).json(new ApiResponse(200, updatedToDo, 'ToDo updated successfully'));
});

const deleteToDo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (!id) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  await prisma.toDo.delete({
    where: {
      id: idNum,
    },
  });

  return res.status(200).json(new ApiResponse(200, null, 'ToDo deleted successfully'));
});

const startToDoLog = asyncHandler(async (req: Request, res: Response) => {
  const { toDoId } = req.params;
  const toDoIdNum = Number(toDoId);

  if (!toDoId) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  const log = await prisma.toDoLog.create({
    data: {
      toDoId: toDoIdNum,
      startedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, log, 'Started ToDo Timer'));
});

const endToDoLog = asyncHandler(async (req: Request, res: Response) => {
  const { toDoId } = req.params;
  const toDoIdNum = Number(toDoId);

  if (!toDoId) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  const activeLog = await prisma.toDoLog.findFirst({
    where: {
      toDoId: toDoIdNum,
      endedAt: null,
    },
  });

  if (!activeLog) {
    throw new ApiError(404, 'Active ToDo timer not found');
  }

  const updatedLog = await prisma.toDoLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: new Date(),
    },
  });

  res.status(200).json(new ApiResponse(200, updatedLog, 'Ended ToDo Timer'));
});

export { getAllToDos, createToDo, updateToDo, deleteToDo, startToDoLog, endToDoLog };
