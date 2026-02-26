import { prisma } from "../../prisma/prismaClient";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getAllSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subjects = await prisma.subject.findMany({
    where: { userId: parseInt(id) },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, subjects, "Subjects fetched successfully"));
});

const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { userId, name } = req.body;
  console.log(name, userId);

  const subject = await prisma.subject.create({
    data: {
      name: name,
      userId: parseInt(userId),
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, subject, "User Created successfully"));
});

const startSubjectLog = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const log = await prisma.subjectLog.create({
    data: {
      subjectId: parseInt(subjectId),
      startedAt: new Date(),
    },
  });
  res.status(200).json(new ApiResponse(200, log, "Started Subject Timer"));
});

const endSubjectLog = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const activeLog = await prisma.subjectLog.findFirst({
    where: {
      subjectId: parseInt(subjectId),
      endedAt: null,
    },
  });
  if (!activeLog) {
    throw new ApiError(404, "Subject timer not found");
  }
  const updatedLog = await prisma.subjectLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: new Date(),
    },
  });
  console.log(updatedLog);

  res.status(200).json(new ApiResponse(200, updatedLog, "Ended Subject Timer"));
});

// const getSubjectLogs

// const getAllSubjectsWithLogs
export { getAllSubject, createSubject, startSubjectLog, endSubjectLog };
