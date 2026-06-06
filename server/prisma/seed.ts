import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { ToDoStatus, difficulty, BlockType } from '../generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Demo User
  const user = await prisma.user.upsert({
    where: { email: 'bahinchopda@gmail.com' },
    update: {},
    create: {
      email: 'bahinchopda@gmail.com',
      name: 'bahin chopda',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    },
  });

  const userId = user.id;

  // 2. Subjects
  const subjectsData = [
    { name: 'coding', color: '#3b82f6', goalWorkSecs: 10800 }, // 3 hours
    { name: 'dsa', color: '#10b981', goalWorkSecs: 7200 }, // 2 hours
    { name: 'backend', color: '#ef4444', goalWorkSecs: 5400 }, // 1.5 hours
    { name: 'frontend', color: '#f59e0b', goalWorkSecs: 5400 }, // 1.5 hours
    { name: 'devops', color: '#8b5cf6', goalWorkSecs: 5400 }, // 1.5 hours
    { name: 'exam', color: '#ec4899', goalWorkSecs: 7200 },
  ];

  const subjects = [];
  for (const s of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { userId_name: { userId, name: s.name } },
      update: { color: s.color, goalWorkSecs: s.goalWorkSecs, deleted: false },
      create: { ...s, userId },
    });
    subjects.push(subject);
  }

  // 3. Habits
  const habitsData = [
    {
      name: 'dsa 2 question 0',
      description: 'Solve 2 DSA questions',
      difficulty: difficulty.MID,
      subjectId: subjects[1].id, // dsa
      badDayPlan: 'Read 1 DSA concept',
    },
    {
      name: 'coding 3hr project .5',
      description: 'Work on coding project',
      difficulty: difficulty.HIGH,
      subjectId: subjects[0].id, // coding
      badDayPlan: 'Write 1 line of code',
    },
    {
      name: 'devops 1.5hr 2',
      description: 'DevOps practice',
      difficulty: difficulty.MID,
      subjectId: subjects[4].id, // devops
      badDayPlan: 'Read 1 devops article',
    },
    {
      name: 'backend 1.5hr 0',
      description: 'Backend practice',
      difficulty: difficulty.MID,
      subjectId: subjects[2].id, // backend
      badDayPlan: 'Watch 1 backend video',
    },
    {
      name: 'gym',
      description: 'Daily workout',
      difficulty: difficulty.HIGH,
      subjectId: null,
      badDayPlan: 'Do 10 pushups',
    },
    {
      name: 'call',
      description: 'Daily check-in call',
      difficulty: difficulty.LOW,
      subjectId: null,
      badDayPlan: 'Send a message instead',
    },
  ];

  const habits = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.upsert({
      where: { userId_name: { userId, name: h.name } },
      update: {
        description: h.description,
        difficulty: h.difficulty,
        subjectId: h.subjectId,
        badDayPlan: h.badDayPlan,
        deleted: false,
      },
      create: { ...h, userId },
    });
    habits.push(habit);
  }

  // 4. ToDos
  const todosData = [
    {
      title: 'Setup Project',
      description: 'Initial repo and dependencies',
      status: ToDoStatus.DONE,
      priority: 3,
      completedAt: new Date(),
    },
    {
      title: 'Design Database',
      description: 'Schema for todos and logs',
      status: ToDoStatus.DONE,
      priority: 2,
      completedAt: new Date(),
    },
    {
      title: 'Implement Auth',
      description: 'Google OAuth and JWT',
      status: ToDoStatus.IN_PROGRESS,
      priority: 3,
    },
    {
      title: 'Build UI',
      description: 'React components for dashboard',
      status: ToDoStatus.IN_PROGRESS,
      priority: 2,
    },
    {
      title: 'Write Tests',
      description: 'Unit and integration tests',
      status: ToDoStatus.PENDING,
      priority: 1,
    },
    {
      title: 'Refactor Logic',
      description: 'Cleanup controllers',
      status: ToDoStatus.PENDING,
      priority: 1,
    },
    {
      title: 'Legacy Task',
      description: 'Old cancelled requirement',
      status: ToDoStatus.CANCELLED,
      priority: 0,
    },
    {
      title: 'Documentation',
      description: 'API docs and README',
      status: ToDoStatus.PENDING,
      priority: 1,
    },
  ];

  for (const t of todosData) {
    const existing = await prisma.toDo.findFirst({
      where: { userId, title: t.title, deleted: false },
    });
    if (!existing) {
      await prisma.toDo.create({
        data: { ...t, userId },
      });
    }
  }

  // 4.5 Spaces & Columns
  const space = await prisma.space.upsert({
    where: { id: 1 },
    update: { name: 'Daily Planner', icon: '📋', deleted: false },
    create: { name: 'Daily Planner', icon: '📋', userId },
  });

  // Delete existing columns to avoid duplicates on re-seed
  await prisma.column.deleteMany({ where: { spaceId: space.id } });

  const col1 = await prisma.column.create({
    data: {
      spaceId: space.id,
      title: 'to do a session',
      order: 0,
      blocks: {
        create: [
          { type: BlockType.TODO, content: 'Q1', order: 0 },
          { type: BlockType.TODO, content: 'Q2', order: 1 },
        ],
      },
    },
  });

  const col2 = await prisma.column.create({
    data: {
      spaceId: space.id,
      title: 'to do today',
      order: 1,
      blocks: {
        create: [
          { type: BlockType.TODO, content: 'dsa 2 questions 10-1 (30min minimum)', order: 0 },
          {
            type: BlockType.TODO,
            content: '1:30-3:30 devops(kubernetes 30min), sql(30min)',
            order: 1,
          },
          {
            type: BlockType.TODO,
            content:
              '4-7 project (see how catching is working fe and improve it, see how to improve backend to make it scalable, nginx implement, deploy somewhere)',
            order: 2,
          },
          { type: BlockType.TODO, content: 'gym', order: 3 },
          {
            type: BlockType.TODO,
            content: '9-11 apply for jobs(5 job apply), make a resume or freelance profile plan',
            order: 4,
          },
          { type: BlockType.TODO, content: '12 max gf', order: 5 },
          {
            type: BlockType.TODO,
            content: '12-1 2 post , 20 replies + post resume on reddit + to do tommorow',
            order: 6,
          },
          { type: BlockType.TODO, content: 'sleep at 1', order: 7 },
        ],
      },
    },
  });

  // 5. Logs (Subject & Habit)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(10, 0, 0, 0);

    // Daily Rating
    await prisma.dailyRating.upsert({
      where: { userId_date: { userId, date } },
      update: { rating: Math.floor(Math.random() * 3) + 3 },
      create: {
        userId,
        date,
        rating: Math.floor(Math.random() * 3) + 3,
        description: 'Seeded rating',
      },
    });

    // Subject Log
    const existingSubjectLog = await prisma.subjectLog.findFirst({
      where: { subjectId: subjects[0].id, startedAt: date },
    });
    if (!existingSubjectLog) {
      await prisma.subjectLog.create({
        data: {
          subjectId: subjects[0].id,
          startedAt: date,
          endedAt: new Date(date.getTime() + 3600000), // 1 hour
        },
      });
    }

    // Habit Log
    const existingHabitLog = await prisma.habitTimeLog.findFirst({
      where: { habitId: habits[0].id, startedAt: date },
    });
    if (!existingHabitLog) {
      await prisma.habitTimeLog.create({
        data: {
          habitId: habits[0].id,
          startedAt: date,
          endedAt: new Date(date.getTime() + 1800000), // 30 mins
          isBadDayPlan: i % 3 === 0, // Every 3rd log is a minimum completion
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
