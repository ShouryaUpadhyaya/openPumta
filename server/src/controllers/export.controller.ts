import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const exportUserData = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id;
  const { format } = req.query; // 'json' or 'txt'

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userIdNum = Number(userId);

  // Fetch all user data
  const user = await prisma.user.findUnique({
    where: { id: userIdNum, deleted: false },
    include: {
      subjects: {
        where: { deleted: false },
        include: { subjectLogs: { where: { deleted: false } } },
      },
      habits: {
        where: { deleted: false },
        include: { log: { where: { deleted: false } } },
      },
      toDo: {
        include: { toDoLog: true },
      },
      dailyRatings: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Sanitize data (remove password hashes, internal IDS if necessary, but here we just export pure JSON)
  const exportData = {
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    subjects: user.subjects,
    habits: user.habits,
    todos: user.toDo,
    dailyRatings: user.dailyRatings,
    exportedAt: new Date().toISOString(),
  };

  if (format === 'txt') {
    // Generate simple text summary
    const txtContent = `
Openpumta Data Export
Generated: ${exportData.exportedAt}
User: ${exportData.user.name} (${exportData.user.email})

-- Subjects (${exportData.subjects.length}) --
${exportData.subjects.map((s) => `- ${s.name} (Goal: ${s.goalWorkSecs / 3600} hrs)`).join('\n')}

-- Habits (${exportData.habits.length}) --
${exportData.habits.map((h) => `- ${h.name} (Logs: ${h.log.length})`).join('\n')}

-- Daily Ratings (${exportData.dailyRatings.length}) --
${exportData.dailyRatings.map((d) => `- [${d.date.toISOString().split('T')[0]}] Rating: ${d.rating}/5`).join('\n')}
    `.trim();

    res.setHeader('Content-disposition', 'attachment; filename=openpumta-export.txt');
    res.setHeader('Content-type', 'text/plain');
    return res.status(200).send(txtContent);
  }

  // Default to JSON
  res.setHeader('Content-disposition', 'attachment; filename=openpumta-export.json');
  res.setHeader('Content-type', 'application/json');
  return res.status(200).send(JSON.stringify(exportData, null, 2));
});

export { exportUserData };
