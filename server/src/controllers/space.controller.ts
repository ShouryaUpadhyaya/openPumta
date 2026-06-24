import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const getSpaces = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const spaces = await prisma.space.findMany({
    where: { userId: Number(userId), deleted: false },
    orderBy: { order: 'asc' },
    include: {
      textBoxes: {
        where: { deleted: false },
      },
    },
  });

  return res.status(200).json(new ApiResponse(200, spaces, 'Spaces fetched'));
});

const createSpace = asyncHandler(async (req: Request, res: Response) => {
  const { name, icon, order } = req.body;
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!name) throw new ApiError(400, 'Name is required');

  // Determine next order if not provided
  let nextOrder = order;
  if (nextOrder === undefined) {
    const last = await prisma.space.findFirst({
      where: { userId: Number(userId), deleted: false },
      orderBy: { order: 'desc' },
    });
    nextOrder = last ? last.order + 1 : 0;
  }

  const space = await prisma.space.create({
    data: { userId: Number(userId), name, icon: icon || null, order: nextOrder },
  });

  return res.status(201).json(new ApiResponse(201, space, 'Space created'));
});

const updateSpace = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, icon, order, isArchived } = req.body;
  const userId = req.user?.id;

  const existing = await prisma.space.findFirst({
    where: { id: Number(id), userId: Number(userId), deleted: false },
  });
  if (!existing) throw new ApiError(404, 'Space not found');

  const updated = await prisma.space.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(order !== undefined && { order }),
      ...(isArchived !== undefined && { isArchived }),
    },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Space updated'));
});

const deleteSpace = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  await prisma.space.updateMany({
    where: { id: Number(id), userId: Number(userId) },
    data: { deleted: true },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Space deleted'));
});

const reorderSpaces = asyncHandler(async (req: Request, res: Response) => {
  // Expects: { spaces: [{ id, order }] }
  const { spaces } = req.body;
  const userId = req.user?.id;
  if (!Array.isArray(spaces)) throw new ApiError(400, 'spaces array required');

  await prisma.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spaces.map((s: any) =>
      prisma.space.updateMany({
        where: { id: Number(s.id), userId: Number(userId) },
        data: { order: Number(s.order) },
      }),
    ),
  );

  return res.status(200).json(new ApiResponse(200, null, 'Spaces reordered'));
});

export { getSpaces, createSpace, updateSpace, deleteSpace, reorderSpaces };
