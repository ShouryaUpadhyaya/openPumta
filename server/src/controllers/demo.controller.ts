import { Request, Response } from 'express';
import { prisma } from '../../prisma/prismaClient.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const seedDemoData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userIdNum = Number(userId);

  const generatedIds = {
    spaces: [] as number[],
    subjects: [] as number[],
    habits: [] as number[],
    ratings: [] as number[],
  };

  const now = new Date();

  // 1. Subjects
  const subjectDefs = [
    { name: 'Data Structures and Algorithms', color: '#f97316', goalWorkSecs: 7200 },
    { name: 'Operating Systems', color: '#3b82f6', goalWorkSecs: 5400 },
    { name: 'Database Management Systems', color: '#22c55e', goalWorkSecs: 3600 },
    { name: 'Computer Networks', color: '#8b5cf6', goalWorkSecs: 3600 },
    { name: 'Software Engineering', color: '#ec4899', goalWorkSecs: 3600 },
  ];

  for (const def of subjectDefs) {
    const s = await prisma.subject.create({
      data: { ...def, userId: userIdNum },
    });
    generatedIds.subjects.push(s.id);
  }

  // 2. Habits
  const habitDefs = [
    {
      name: 'Study for 2 hours',
      difficulty: 'HIGH' as const,
      badDayPlan: 'Study for 30 minutes',
      description: 'Deep work focus',
    },
    {
      name: 'Solve 1 DSA problem',
      difficulty: 'HIGH' as const,
      badDayPlan: 'Review 1 solution',
      description: 'LeetCode practice',
    },
    {
      name: 'Read technical documentation',
      difficulty: 'MID' as const,
      badDayPlan: 'Read 2 pages',
      description: 'Stay updated',
    },
    {
      name: 'Exercise for 30 minutes',
      difficulty: 'MID' as const,
      badDayPlan: '10 pushups',
      description: 'Physical health',
    },
    {
      name: '1hr coding project',
      difficulty: 'HIGH' as const,
      badDayPlan: 'Watch 1 tutorial',
      description: 'Portfolio building',
    },
    {
      name: 'Journal for 10 minutes',
      difficulty: 'LOW' as const,
      badDayPlan: 'Write 1 sentence',
      description: 'Daily reflection',
    },
  ];

  for (const def of habitDefs) {
    const h = await prisma.habit.create({
      data: { ...def, userId: userIdNum },
    });
    generatedIds.habits.push(h.id);
  }

  // Helper to generate BlockNote text content
  const createTextNode = (text: string, styles = {}) => ({ type: 'text', text, styles });
  const createBlock = (type: string, text: string, props = {}, styles = {}) => ({
    type,
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left', ...props },
    content: [createTextNode(text, styles)],
    children: [],
  });

  // 3. Workspaces (Spaces + TextBoxes)
  const space = await prisma.space.create({
    data: { name: 'Computer Science Semester', icon: '💻', userId: userIdNum },
  });
  generatedIds.spaces.push(space.id);

  // Daily Planner
  await prisma.textBox.create({
    data: {
      spaceId: space.id,
      layout: {
        desktop: { x: 0, y: 0, width: 400, height: 400 },
        tablet: { x: 0, y: 0, width: 350, height: 400 },
        mobile: { x: 0, y: 0, width: '100%', height: 400 },
      },
      content: [
        createBlock('heading', 'Daily Planner', { level: 2 }),
        createBlock('checkListItem', 'Attend Data Structures lecture (10:00 AM)', {
          checked: true,
        }),
        createBlock('checkListItem', 'Complete Operating Systems assignment', { checked: false }),
        createBlock(
          'checkListItem',
          'Review LeetCode problems (45 min)',
          { checked: false },
          { bold: true },
        ),
        createBlock('checkListItem', 'Work on personal project', { checked: false }),
        createBlock('checkListItem', 'Read distributed systems notes', { checked: false }),
        createBlock('checkListItem', 'Gym session', { checked: false }),
        createBlock('checkListItem', "Plan tomorrow's priorities", { checked: false }),
      ],
    },
  });

  // Weekly & Monthly Planner
  await prisma.textBox.create({
    data: {
      spaceId: space.id,
      layout: {
        desktop: { x: 420, y: 0, width: 400, height: 400 },
        tablet: { x: 370, y: 0, width: 350, height: 400 },
        mobile: { x: 0, y: 420, width: '100%', height: 400 },
      },
      content: [
        createBlock('heading', 'Weekly Planner', { level: 2 }),
        createBlock('checkListItem', 'Finish DBMS mini-project', { checked: false }),
        createBlock('checkListItem', 'Prepare for algorithms quiz', { checked: false }),
        createBlock('checkListItem', 'Submit lab reports', { checked: true }),
        createBlock('checkListItem', 'Attend coding club meeting', { checked: false }),
        createBlock('checkListItem', 'Schedule mock interview', { checked: false }),
        createBlock('checkListItem', 'Update resume', { checked: false }),
        createBlock('heading', 'Monthly Planner', { level: 2 }),
        createBlock('numberedListItem', 'Complete 20 LeetCode problems', {}, { bold: true }),
        createBlock('numberedListItem', 'Finish portfolio website redesign'),
        createBlock('numberedListItem', 'Achieve 85% attendance target'),
      ],
    },
  });

  // Notes and Text Areas
  await prisma.textBox.create({
    data: {
      spaceId: space.id,
      layout: {
        desktop: { x: 0, y: 420, width: 820, height: 300 },
        tablet: { x: 0, y: 420, width: 720, height: 300 },
        mobile: { x: 0, y: 840, width: '100%', height: 300 },
      },
      content: [
        createBlock('heading', 'Brain Dump & Notes', { level: 2 }),
        createBlock('heading', 'Weekly Reflection', { level: 3 }),
        createBlock(
          'paragraph',
          'What went well: Consistent with LeetCode. Challenges: OS assignment took longer than expected. Improvements: Start assignments earlier.',
        ),
        createBlock('heading', 'Study Notes: OS Scheduling', { level: 3 }),
        createBlock(
          'paragraph',
          'Round Robin: Time slices. SJF: Shortest Job First. Multi-level Queue: different queues for foreground/background.',
        ),
      ],
    },
  });

  // 4. Historical Data (30 days)
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(12, 0, 0, 0);

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Daily Rating
    const rating = await prisma.dailyRating.create({
      data: {
        userId: userIdNum,
        rating: isWeekend ? 3 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 2),
        description: 'Demo historical entry',
        date: d,
      },
    });
    generatedIds.ratings.push(rating.id);

    // Habits (varying completion)
    for (let h = 0; h < generatedIds.habits.length; h++) {
      const skip = Math.random() > (isWeekend ? 0.6 : 0.85);
      if (!skip) {
        await prisma.habitTimeLog.create({
          data: {
            habitId: generatedIds.habits[h],
            startedAt: d,
            endedAt: new Date(d.getTime() + 1000), // Instant
            isBadDayPlan: Math.random() > 0.8,
          },
        });
      }
    }

    // Subject logs
    const activeSubjects = Math.floor(Math.random() * 3) + 1;
    for (let s = 0; s < activeSubjects; s++) {
      const subId = generatedIds.subjects[s % generatedIds.subjects.length];
      const durationSecs = isWeekend
        ? Math.floor(Math.random() * 3600) + 1800
        : Math.floor(Math.random() * 7200) + 3600;
      await prisma.subjectLog.create({
        data: {
          subjectId: subId,
          startedAt: d,
          endedAt: new Date(d.getTime() + durationSecs * 1000),
        },
      });
    }
  }

  return res.status(200).json(new ApiResponse(200, generatedIds, 'Demo data seeded'));
});

export const cleanupDemoData = asyncHandler(async (req: Request, res: Response) => {
  const { ids, keepTemplate } = req.body;

  if (!ids) {
    return res.status(400).json(new ApiResponse(400, null, 'No IDs provided'));
  }

  // Always delete ratings as they are historical
  if (ids.ratings && ids.ratings.length > 0) {
    await prisma.dailyRating.deleteMany({ where: { id: { in: ids.ratings } } });
  }

  if (keepTemplate) {
    // Keep Spaces, Subjects, Habits. Only delete their logs.
    if (ids.habits && ids.habits.length > 0) {
      await prisma.habitTimeLog.deleteMany({ where: { habitId: { in: ids.habits } } });
    }
    if (ids.subjects && ids.subjects.length > 0) {
      await prisma.subjectLog.deleteMany({ where: { subjectId: { in: ids.subjects } } });
    }
  } else {
    // Fresh start: delete everything (Spaces, Habits, Subjects)
    // Prisma Cascade handles their logs automatically
    if (ids.spaces && ids.spaces.length > 0) {
      await prisma.space.deleteMany({ where: { id: { in: ids.spaces } } });
    }
    if (ids.habits && ids.habits.length > 0) {
      await prisma.habit.deleteMany({ where: { id: { in: ids.habits } } });
    }
    if (ids.subjects && ids.subjects.length > 0) {
      await prisma.subject.deleteMany({ where: { id: { in: ids.subjects } } });
    }
  }

  return res.status(200).json(new ApiResponse(200, null, 'Demo data cleaned up'));
});
