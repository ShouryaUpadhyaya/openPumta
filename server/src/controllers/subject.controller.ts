import { prisma } from '../../prisma/prismaClient';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const getAllSubject = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { to, from } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (typeof to !== 'string' || typeof from !== 'string') {
    throw new ApiError(400, 'Invalid type of To/From');
  }

  const subjects = await prisma.subject.findMany({
    where: {
      userId: Number(userId),
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
  });
  return res.status(200).json(new ApiResponse(200, subjects, 'Subjects fetched successfully'));
});

const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, goalWorkSecs } = req.body;
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
    },
  });
  res.status(200).json(new ApiResponse(200, subject, 'Subject Created successfully'));
});

const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, goalWorkSecs } = req.body;
  const { id } = req.params;
  const idNum = Number(id);

  if (!idNum) {
    throw new ApiError(400, 'Invalid Subject ID');
  }

  const subject = await prisma.subject.update({
    where: {
      id: idNum,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(goalWorkSecs !== undefined && { goalWorkSecs: Number(goalWorkSecs) }),
    },
  });

  res.status(200).json(new ApiResponse(200, subject, 'Subject Updated successfully'));
});

const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  const subject = await prisma.subject.update({
    where: {
      id: idNum,
    },
    data: {
      deleted: true,
    },
  });

  res.status(200).json(new ApiResponse(200, subject, 'Subject Deleted successfully'));
});

const startSubjectLog = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const subjectIdNum = Number(subjectId);
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
  const subjectIdNum = Number(subjectId);
  const activeLog = await prisma.subjectLog.findFirst({
    where: {
      subjectId: subjectIdNum,
      endedAt: null,
    },
  });
  if (!activeLog) {
    throw new ApiError(404, 'Subject timer not found');
  }
  const updatedLog = await prisma.subjectLog.update({
    where: { id: activeLog.id },
    data: {
      endedAt: new Date(),
    },
    include: {
      subject: {
        include: { habits: true },
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

  if (updatedLog.subject.goalWorkSecs > 0 && totalSecs >= updatedLog.subject.goalWorkSecs) {
    for (const habit of updatedLog.subject.habits) {
      if (habit.deleted) continue;
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
  }

  res.status(200).json(new ApiResponse(200, updatedLog, 'Ended Subject Timer'));
});

const getSubjectLogs = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const subjectIdNum = Number(subjectId);
  const { from, to } = req.query;

  if (!subjectId) {
    throw new ApiError(400, 'Subject ID is required');
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

  const subjectsWithDuration = subjects.map((subject) => ({
    ...subject,
    subjectLogs: subject.subjectLogs.map((log) => ({
      ...log,
      duration: log.endedAt
        ? Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
        : 0,
    })),
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
