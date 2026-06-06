import { prisma } from '../../prisma/prismaClient.js';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getAllSubject = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { to, from } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const subjects = await prisma.subject.findMany({
    where: {
      userId: Number(userId),
      deleted: false,
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
    },
  });
  return res.status(200).json(new ApiResponse(200, subjects, 'Subjects fetched successfully'));
});

const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, goalWorkSecs, color, habits } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!name || !userId) {
    throw new ApiError(400, 'Name is required');
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      userId: Number(userId),
      goalWorkSecs: goalWorkSecs !== undefined ? Number(goalWorkSecs) : 0,
      ...(color !== undefined && { color }),
      ...(habits && Array.isArray(habits) && habits.length > 0
        ? {
            habits: {
              connect: habits.map((id: number) => ({ id })),
            },
          }
        : {}),
    },
    include: {
      habits: true,
    },
  });
  res.status(200).json(new ApiResponse(200, subject, 'Subject Created successfully'));
});

const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, goalWorkSecs, color, habits } = req.body;
  const { id } = req.params;
  const idNum = Number(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!idNum) {
    throw new ApiError(400, 'Invalid Subject ID');
  }

  // Verify ownership
  const existingSubject = await prisma.subject.findFirst({
    where: { id: idNum, userId: Number(userId), deleted: false },
  });

  if (!existingSubject) {
    throw new ApiError(404, 'Subject not found');
  }

  const subject = await prisma.subject.update({
    where: {
      id: idNum,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(goalWorkSecs !== undefined && { goalWorkSecs: Number(goalWorkSecs) }),
      ...(color !== undefined && { color }),
      ...(habits !== undefined && Array.isArray(habits)
        ? {
            habits: {
              set: habits.map((hId: number) => ({ id: hId })),
            },
          }
        : {}),
    },
    include: {
      habits: true,
    },
  });

  res.status(200).json(new ApiResponse(200, subject, 'Subject Updated successfully'));
});

const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  // Soft delete and verify ownership
  const subject = await prisma.subject.updateMany({
    where: {
      id: idNum,
      userId: Number(userId),
    },
    data: {
      deleted: true,
    },
  });

  if (subject.count === 0) {
    throw new ApiError(404, 'Subject not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Subject Deleted successfully'));
});

const startSubjectLog = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const subjectIdNum = Number(subjectId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  // Verify ownership
  const subject = await prisma.subject.findFirst({
    where: { id: subjectIdNum, userId: Number(userId), deleted: false },
  });

  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }

  // End any currently active logs for this user before starting a new one
  await prisma.subjectLog.updateMany({
    where: {
      subject: { userId: Number(userId) },
      endedAt: null,
      deleted: false,
    },
    data: {
      endedAt: new Date(),
    },
  });

  const log = await prisma.subjectLog.create({
    data: {
      subjectId: subjectIdNum,
      startedAt: new Date(),
    },
  });
  res.status(200).json(new ApiResponse(200, log, 'Started Subject Timer'));
});

const endSubjectLog = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const { endedAt } = req.body;
  const subjectIdNum = Number(subjectId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  const activeLog = await prisma.subjectLog.findFirst({
    where: {
      subjectId: subjectIdNum,
      endedAt: null,
      deleted: false,
      subject: {
        userId: Number(userId),
        deleted: false,
      },
    },
  });

  if (!activeLog) {
    throw new ApiError(404, 'Subject timer not found');
  }

  const updatedLog = await prisma.subjectLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    },
    include: {
      subject: {
        include: {
          habits: {
            where: { deleted: false },
          },
        },
      },
    },
  });

  // Auto-Complete linked habits logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysLogs = await prisma.subjectLog.findMany({
    where: {
      subjectId: subjectIdNum,
      startedAt: { gte: today },
      endedAt: { not: null },
      deleted: false,
    },
  });

  let totalSecs = 0;
  for (const log of todaysLogs) {
    if (log.endedAt) {
      totalSecs += Math.floor(
        (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000,
      );
    }
  }

  for (const habit of updatedLog.subject.habits) {
    const threshold =
      habit.autoCompleteTime !== null && habit.autoCompleteTime !== undefined
        ? habit.autoCompleteTime
        : updatedLog.subject.goalWorkSecs > 0
          ? updatedLog.subject.goalWorkSecs
          : null;

    if (threshold === null || totalSecs < threshold) continue;

    const existingHabitLog = await prisma.habitTimeLog.findFirst({
      where: {
        habitId: habit.id,
        startedAt: { gte: today },
        deleted: false,
      },
    });

    if (!existingHabitLog) {
      await prisma.habitTimeLog.create({
        data: {
          habitId: habit.id,
          startedAt: new Date(),
          endedAt: new Date(),
        },
      });
    }
  }

  res.status(200).json(new ApiResponse(200, updatedLog, 'Ended Subject Timer'));
});

const getSubjectLogs = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const subjectIdNum = Number(subjectId);
  const { from, to } = req.query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;

  if (!subjectId) {
    throw new ApiError(400, 'Subject ID is required');
  }

  // Verify ownership
  const subject = await prisma.subject.findFirst({
    where: { id: subjectIdNum, userId: Number(userId), deleted: false },
  });

  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }

  const logs = await prisma.subjectLog.findMany({
    where: {
      subjectId: subjectIdNum,
      deleted: false,
      ...(from || to
        ? {
            startedAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  return res.status(200).json(new ApiResponse(200, logs, 'Subject logs fetched successfully'));
});

const getAllSubjectsWithLogs = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  const subjects = await prisma.subject.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
    },
    include: {
      habits: {
        where: { deleted: false },
      },
      subjectLogs: {
        where: {
          deleted: false,
          ...(from || to
            ? {
                startedAt: {
                  ...(from && { gte: new Date(from as string) }),
                  ...(to && { lte: new Date(to as string) }),
                },
              }
            : {}),
        },
        orderBy: {
          startedAt: 'desc',
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectsWithDuration = subjects.map((subject: any) => ({
    ...subject,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subjectLogs: subject.subjectLogs.map((log: any) => {
      const durationSecs = log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0;

      return {
        ...log,
        duration: durationSecs,
        durationSecs,
      };
    }),
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, subjectsWithDuration, 'Subjects with logs fetched successfully'));
});

const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subjects = await prisma.subject.findMany({
    where: {
      userId: userIdNum,
      deleted: false,
    },
  });

  const todayLogs = await prisma.subjectLog.findMany({
    where: {
      subject: {
        userId: userIdNum,
        deleted: false,
      },
      startedAt: {
        gte: today,
      },
      ...(from || to
        ? {
            startedAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
      deleted: false,
    },
    include: {
      subject: true,
    },
  });

  const activeLog = await prisma.subjectLog.findFirst({
    where: {
      subject: {
        userId: userIdNum,
        deleted: false,
      },
      ...(from || to
        ? {
            startedAt: {
              ...(from && { gte: new Date(from as string) }),
              ...(to && { lte: new Date(to as string) }),
            },
          }
        : {}),
      endedAt: null,
      deleted: false,
    },
    include: {
      subject: true,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subjects,
        todayStats: todayLogs,
        activeLog,
      },
      'Dashboard data fetched successfully',
    ),
  );
});

export {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
  deleteSubject,
  getSubjectLogs,
  getAllSubjectsWithLogs,
  getDashboardData,
};
