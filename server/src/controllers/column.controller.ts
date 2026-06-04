import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/** Verify the requesting user owns the space */
async function assertSpaceOwner(spaceId: number, userId: number) {
  const space = await prisma.space.findFirst({
    where: { id: spaceId, userId, deleted: false },
  });
  if (!space) throw new ApiError(404, 'Space not found');
  return space;
}

const getColumns = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertSpaceOwner(Number(spaceId), Number(userId));

  const columns = await prisma.column.findMany({
    where: { spaceId: Number(spaceId), deleted: false },
    orderBy: { order: 'asc' },
  });

  return res.status(200).json(new ApiResponse(200, columns, 'Columns fetched'));
});

const createColumn = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId } = req.params;
  const { title, order } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!title) throw new ApiError(400, 'Title is required');

  await assertSpaceOwner(Number(spaceId), Number(userId));

  let nextOrder = order;
  if (nextOrder === undefined) {
    const last = await prisma.column.findFirst({
      where: { spaceId: Number(spaceId), deleted: false },
      orderBy: { order: 'desc' },
    });
    nextOrder = last ? last.order + 1 : 0;
  }

  const column = await prisma.column.create({
    data: { spaceId: Number(spaceId), title, order: nextOrder },
  });

  return res.status(201).json(new ApiResponse(201, column, 'Column created'));
});

const updateColumn = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId, id } = req.params;
  const { title, order, width, height, isCollapsed } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertSpaceOwner(Number(spaceId), Number(userId));

  const existing = await prisma.column.findFirst({
    where: { id: Number(id), spaceId: Number(spaceId), deleted: false },
  });
  if (!existing) throw new ApiError(404, 'Column not found');

  const updated = await prisma.column.update({
    where: { id: Number(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(order !== undefined && { order }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      ...(isCollapsed !== undefined && { isCollapsed }),
    },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Column updated'));
});

const deleteColumn = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId, id } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertSpaceOwner(Number(spaceId), Number(userId));

  await prisma.column.updateMany({
    where: { id: Number(id), spaceId: Number(spaceId) },
    data: { deleted: true },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Column deleted'));
});

const reorderColumns = asyncHandler(async (req: Request, res: Response) => {
  // Expects: { columns: [{ id, order }] }
  const { spaceId } = req.params;
  const { columns } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!Array.isArray(columns)) throw new ApiError(400, 'columns array required');

  await assertSpaceOwner(Number(spaceId), Number(userId));

  await prisma.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns.map((c: any) =>
      prisma.column.updateMany({
        where: { id: Number(c.id), spaceId: Number(spaceId) },
        data: { order: Number(c.order) },
      }),
    ),
  );

  return res.status(200).json(new ApiResponse(200, null, 'Columns reordered'));
});

export { getColumns, createColumn, updateColumn, deleteColumn, reorderColumns };
