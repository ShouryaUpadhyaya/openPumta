import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { BlockType } from '../../generated/prisma/enums.js';

/** Verify the requesting user owns the column (via space) */
async function assertColumnOwner(columnId: number, userId: number) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      deleted: false,
      space: { userId, deleted: false },
    },
  });
  if (!column) throw new ApiError(404, 'Column not found');
  return column;
}

const getBlocks = asyncHandler(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const { filter } = req.query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertColumnOwner(Number(columnId), Number(userId));

  const now = new Date();

  // Build date filter for scheduledAt / dueAt based on query param
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dateFilter: any = {};
  if (filter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    dateFilter = { scheduledAt: { gte: start, lte: end } };
  } else if (filter === 'last1w') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { scheduledAt: { gte: weekAgo } };
  } else if (filter === 'overdue') {
    dateFilter = {
      dueAt: { lt: now },
      isCompleted: false,
    };
  } else if (filter === 'dateRange') {
    const { from, to } = req.query;
    if (from && to) {
      dateFilter = {
        scheduledAt: { gte: new Date(from as string), lte: new Date(to as string) },
      };
    }
  }

  const blocks = await prisma.block.findMany({
    where: {
      columnId: Number(columnId),
      deleted: false,
      ...dateFilter,
    },
    orderBy: { order: 'asc' },
  });

  return res.status(200).json(new ApiResponse(200, blocks, 'Blocks fetched'));
});

const createBlock = asyncHandler(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const { type, content, order, scheduledAt, dueAt, reminderAt } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertColumnOwner(Number(columnId), Number(userId));

  let nextOrder = order;
  if (nextOrder === undefined) {
    const last = await prisma.block.findFirst({
      where: { columnId: Number(columnId), deleted: false },
      orderBy: { order: 'desc' },
    });
    nextOrder = last ? last.order + 1 : 0;
  }

  const block = await prisma.block.create({
    data: {
      columnId: Number(columnId),
      type: (type as BlockType) || 'TODO',
      content: content || '',
      order: nextOrder,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      dueAt: dueAt ? new Date(dueAt) : null,
      reminderAt: reminderAt ? new Date(reminderAt) : null,
    },
  });

  return res.status(201).json(new ApiResponse(201, block, 'Block created'));
});

const updateBlock = asyncHandler(async (req: Request, res: Response) => {
  const { columnId, id } = req.params;
  const { content, order, isCompleted, scheduledAt, dueAt, reminderAt, type } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertColumnOwner(Number(columnId), Number(userId));

  const existing = await prisma.block.findFirst({
    where: { id: Number(id), columnId: Number(columnId), deleted: false },
  });
  if (!existing) throw new ApiError(404, 'Block not found');

  const updated = await prisma.block.update({
    where: { id: Number(id) },
    data: {
      ...(content !== undefined && { content }),
      ...(order !== undefined && { order }),
      ...(isCompleted !== undefined && { isCompleted }),
      ...(type !== undefined && { type: type as BlockType }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      ...(dueAt !== undefined && { dueAt: dueAt ? new Date(dueAt) : null }),
      ...(reminderAt !== undefined && { reminderAt: reminderAt ? new Date(reminderAt) : null }),
    },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Block updated'));
});

const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
  const { columnId, id } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  await assertColumnOwner(Number(columnId), Number(userId));

  await prisma.block.updateMany({
    where: { id: Number(id), columnId: Number(columnId) },
    data: { deleted: true },
  });

  return res.status(200).json(new ApiResponse(200, null, 'Block deleted'));
});

const reorderBlocks = asyncHandler(async (req: Request, res: Response) => {
  // Expects: { blocks: [{ id, order }] }
  const { columnId } = req.params;
  const { blocks } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!Array.isArray(blocks)) throw new ApiError(400, 'blocks array required');

  await assertColumnOwner(Number(columnId), Number(userId));

  await prisma.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks.map((b: any) =>
      prisma.block.updateMany({
        where: { id: Number(b.id), columnId: Number(columnId) },
        data: { order: Number(b.order) },
      }),
    ),
  );

  return res.status(200).json(new ApiResponse(200, null, 'Blocks reordered'));
});

/** Move block to a different column — used for cross-column DnD */
const moveBlock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetColumnId, order } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!targetColumnId) throw new ApiError(400, 'targetColumnId required');

  // Verify ownership of the target column
  await assertColumnOwner(Number(targetColumnId), Number(userId));

  const block = await prisma.block.findFirst({
    where: {
      id: Number(id),
      deleted: false,
      column: { space: { userId: Number(userId) } },
    },
  });
  if (!block) throw new ApiError(404, 'Block not found');

  const updated = await prisma.block.update({
    where: { id: Number(id) },
    data: {
      columnId: Number(targetColumnId),
      order: order !== undefined ? Number(order) : block.order,
    },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Block moved'));
});

export { getBlocks, createBlock, updateBlock, deleteBlock, reorderBlocks, moveBlock };
