import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const getAllToDos = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const toDos = await prisma.toDo.findMany({
    where: {
      userId: Number(userId),
      deleted: false,
    },
    include: {
      toDoLog: {
        where: { deleted: false },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json(new ApiResponse(200, toDos, 'ToDos fetched successfully'));
});

const createToDo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, priority, dueDate, status } = req.body;
  const userId = req.user?.id;

  if (!userId || !title) {
    throw new ApiError(400, 'Title is required');
  }

  const toDo = await prisma.toDo.create({
    data: {
      title,
      description: description || '',
      userId: Number(userId),
      priority: priority || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'PENDING',
      completedAt: status === 'DONE' ? new Date() : null,
    },
  });

  res.status(200).json(new ApiResponse(200, toDo, 'ToDo created successfully'));
});

const updateToDo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate } = req.body;
  const idNum = Number(id);
  const userId = req.user?.id;

  if (!id) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  // Ensure user owns the todo
  const existingToDo = await prisma.toDo.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: false },
  });

  if (!existingToDo) {
    throw new ApiError(404, 'ToDo not found');
  }

  let completedAt = existingToDo.completedAt;
  if (status !== undefined) {
    if (status === 'DONE' && existingToDo.status !== 'DONE') {
      completedAt = new Date();
    } else if (status !== 'DONE' && existingToDo.status === 'DONE') {
      completedAt = null;
    }
  }

  const updatedToDo = await prisma.toDo.update({
    where: {
      id: idNum,
    },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      completedAt,
    },
  });

  return res.status(200).json(new ApiResponse(200, updatedToDo, 'ToDo updated successfully'));
});

const deleteToDo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  const userId = req.user?.id;

  if (!id) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  // Soft delete
  await prisma.toDo.updateMany({
    where: {
      id: idNum,
      userId: Number(userId),
    },
    data: {
      deleted: true,
    },
  });

  return res.status(200).json(new ApiResponse(200, null, 'ToDo deleted successfully'));
});

const startToDoLog = asyncHandler(async (req: Request, res: Response) => {
  const { toDoId } = req.params;
  const toDoIdNum = Number(toDoId);
  const userId = req.user?.id;

  if (!toDoId) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  // Verify ownership
  const toDo = await prisma.toDo.findFirst({
    where: { id: toDoIdNum, userId: Number(userId), deleted: false },
  });

  if (!toDo) {
    throw new ApiError(404, 'ToDo not found');
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
  const userId = req.user?.id;

  if (!toDoId) {
    throw new ApiError(400, 'ToDo ID is required');
  }

  const activeLog = await prisma.toDoLog.findFirst({
    where: {
      toDoId: toDoIdNum,
      endedAt: null,
      deleted: false,
      toDo: {
        userId: Number(userId),
        deleted: false,
      },
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
