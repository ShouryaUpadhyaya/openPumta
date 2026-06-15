import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const getTextBoxes = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  const space = await prisma.space.findFirst({
    where: { id: Number(spaceId), userId: Number(userId), deleted: false },
  });

  if (!space) throw new ApiError(404, 'Space not found');

  const textBoxes = await prisma.textBox.findMany({
    where: { spaceId: Number(spaceId), deleted: false },
  });

  return res.status(200).json(new ApiResponse(200, textBoxes, 'TextBoxes fetched'));
});

const createTextBox = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId } = req.params;
  const { layout, content } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  const space = await prisma.space.findFirst({
    where: { id: Number(spaceId), userId: Number(userId), deleted: false },
  });

  if (!space) throw new ApiError(404, 'Space not found');

  const defaultLayout = {
    desktop: { x: 0, y: 0, width: 400, height: 300 },
    tablet: { x: 0, y: 0, width: 350, height: 300 },
    mobile: { x: 0, y: 0, width: '100%', height: 300 },
  };

  const newTextBox = await prisma.textBox.create({
    data: {
      spaceId: Number(spaceId),
      layout: layout || defaultLayout,
      content: content || [],
    },
  });

  return res.status(201).json(new ApiResponse(201, newTextBox, 'TextBox created'));
});

const updateTextBoxLayout = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { layout } = req.body;

  if (!layout) throw new ApiError(400, 'Layout is required');

  const updated = await prisma.textBox.update({
    where: { id: Number(id) },
    data: { layout },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'TextBox layout updated'));
});

const updateTextBoxContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) throw new ApiError(400, 'Content is required');

  const updated = await prisma.textBox.update({
    where: { id: Number(id) },
    data: { content },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'TextBox content updated'));
});

const deleteTextBox = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.textBox.update({
    where: { id: Number(id) },
    data: { deleted: true },
  });

  return res.status(200).json(new ApiResponse(200, null, 'TextBox deleted'));
});

export { getTextBoxes, createTextBox, updateTextBoxLayout, updateTextBoxContent, deleteTextBox };
