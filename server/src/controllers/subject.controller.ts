import { prisma } from "../../prisma/prismaClient";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getAllSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);
  const { to, from } = req.query; // ?from=...&to=...

  if (typeof to !== "string" || typeof from !== "string") {
    throw new ApiError(400, "Invalid type of To/From");
  }
  const subjects = await prisma.subject.findMany({
    where: {
      userId: idNum,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
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
    .json(new ApiResponse(200, subject, "Subject Created successfully"));
});

const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id } = req.params;
  const idNum = Number(id);
  const subject = await prisma.subject.update({
    where: {
      id: idNum,
    },
    data: {
      name: name,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, subject, "Subject Updated successfully"));
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
  res.status(200).json(new ApiResponse(200, log, "Started Subject Timer"));
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

const getSubjectLogs = asyncHandler(async (req: Request, res: Response) => {
  // GET /subjects/:subjectId/logs?from=2026-02-01&to=2026-02-28
  const { subjectId } = req.params;
  const subjectIdNum = Number(subjectId);
  const { from, to } = req.query;

  if (!subjectId) {
    throw new ApiError(400, "Subject ID is required");
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
      startedAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Subject logs fetched successfully"));
});

const getAllSubjectsWithLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { from, to } = req.query;
    const userIdNum = Number(userId);

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

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
            startedAt: "desc",
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subjects,
          "Subjects with logs fetched successfully",
        ),
      );
  },
);

const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { from, to } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
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
            startSubjectLog: {
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
      "Dashboard data fetched successfully",
    ),
  );
});

export {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
  getSubjectLogs,
  getAllSubjectsWithLogs,
  getDashboardData,
};
