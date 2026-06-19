import { prisma } from '../../prisma/prismaClient.js';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { deleted: false },
  });
  return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  const { email, name, avatarUrl, startOfDay, activeAvatar } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id: idNum,
    },
    data: {
      email,
      name,
      avatarUrl,
      startOfDay,
      activeAvatar,
    },
  });

  return res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const numId = Number(id);

  const deletedUser = await prisma.user.update({
    where: {
      id: numId,
    },
    data: {
      deleted: true,
    },
  });

  return res.status(200).json(new ApiResponse(200, deletedUser, 'User deleted successfully'));
});

const addUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  return res.status(201).json(new ApiResponse(201, newUser, 'User added successfully'));
});

const getLifetimeFocusTime = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user ? (req.user as { id: number }).id : null;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const logs = await prisma.subjectLog.findMany({
    where: { subject: { userId }, deleted: false, endedAt: { not: null } },
  });

  let totalMs = 0;
  logs.forEach((log) => {
    if (log.startedAt && log.endedAt) {
      totalMs += new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { lifetimeFocusMs: totalMs }, 'Lifetime focus fetched'));
});

export { getAllUsers, addUser, updateUser, deleteUser, getLifetimeFocusTime };
