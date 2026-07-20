/**
 * Integration tests for soft-delete stat continuity.
 *
 * These tests verify the core business rules:
 * 1. Deleting a habit keeps its historical logs visible in stats/analytics
 * 2. Deleting a subject keeps its focus time logs visible in analytics
 * 3. Past-date dashboard includes habits that existed at that date (even if now deleted)
 * 4. Toggling habit completion works for deleted habits on past dates
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../../prisma/prismaClient.js';

// ── Test data helpers ────────────────────────────────────────────────────────

async function createTestUser() {
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
    },
  });
}

async function createTestHabit(userId: number, overrides?: object) {
  return prisma.habit.create({
    data: {
      name: `Test Habit ${Date.now()}`,
      userId,
      ...overrides,
    },
  });
}

async function createTestSubject(userId: number, overrides?: object) {
  return prisma.subject.create({
    data: {
      name: `Test Subject ${Date.now()}`,
      userId,
      ...overrides,
    },
  });
}

async function logHabitCompletion(habitId: number, date: Date) {
  return prisma.habitTimeLog.create({
    data: {
      habitId,
      startedAt: date,
      endedAt: date,
      isBadDayPlan: false,
    },
  });
}

async function logSubjectFocusTime(subjectId: number, startedAt: Date, endedAt: Date) {
  return prisma.subjectLog.create({
    data: {
      subjectId,
      startedAt,
      endedAt,
    },
  });
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('Soft-delete: Habit stat continuity', () => {
  let userId: number;

  beforeAll(async () => {
    const user = await createTestUser();
    userId = user.id;
  });

  afterAll(async () => {
    // Clean up: delete all test data for this user
    await prisma.habitTimeLog.deleteMany({ where: { habit: { userId } } });
    await prisma.habit.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should set deletedAt when a habit is soft-deleted', async () => {
    const habit = await createTestHabit(userId);

    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    const updated = await prisma.habit.findUnique({ where: { id: habit.id } });
    expect(updated?.deleted).toBe(true);
    expect(updated?.deletedAt).not.toBeNull();
  });

  it('should still return habit logs after habit is soft-deleted (getAllHabitsWithLogs behavior)', async () => {
    const habit = await createTestHabit(userId);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    await logHabitCompletion(habit.id, pastDate);

    // Soft-delete the habit
    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    // Query without deleted:false filter — simulates the fixed getAllHabitsWithLogs
    const habitsWithLogs = await prisma.habit.findMany({
      where: { userId },
      include: {
        log: { where: { deleted: false } },
      },
    });

    const deletedHabit = habitsWithLogs.find((h) => h.id === habit.id);
    expect(deletedHabit).toBeDefined();
    expect(deletedHabit?.log.length).toBeGreaterThan(0);
    expect(deletedHabit?.deleted).toBe(true);
  });

  it('should count deleted habits logs in dashboard stats (completion rate)', async () => {
    const habit = await createTestHabit(userId);
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await logHabitCompletion(habit.id, today);

    // Soft-delete the habit
    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    // Query all habits (including deleted) — simulates fixed getDashboardStats
    const allHabits = await prisma.habit.findMany({ where: { userId } });
    const habitIds = allHabits.map((h) => h.id);

    const twentyOneDaysAgo = new Date();
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

    const recentLogs = await prisma.habitTimeLog.findMany({
      where: {
        habitId: { in: habitIds },
        startedAt: { gte: twentyOneDaysAgo },
        deleted: false,
      },
    });

    // The deleted habit's log should still be counted
    const logForDeletedHabit = recentLogs.find((l) => l.habitId === habit.id);
    expect(logForDeletedHabit).toBeDefined();
  });

  it('should include habits deleted after target date in past-date dashboard', async () => {
    // Create habit with a past createdAt (before the targetDate)
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - 7); // Created 7 days ago

    const habit = await createTestHabit(userId);
    // Backdate createdAt to simulate the habit existing at targetDate
    await prisma.habit.update({ where: { id: habit.id }, data: { createdAt } });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 3); // 3 days ago
    const targetEnd = new Date(targetDate);
    targetEnd.setHours(23, 59, 59, 999);

    // Delete the habit TODAY (after targetDate)
    const deletedAt = new Date();
    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt },
    });

    // Query simulating "getHabitDashboardData for past date" with fixed logic
    const habitsForPastDate = await prisma.habit.findMany({
      where: {
        userId,
        createdAt: { lte: targetEnd },
        OR: [{ deleted: false }, { deleted: true, deletedAt: { gt: targetEnd } }],
      },
    });

    const habitExistedThen = habitsForPastDate.find((h) => h.id === habit.id);
    expect(habitExistedThen).toBeDefined();
  });

  it('should NOT include habits deleted before target date in past-date dashboard', async () => {
    const habit = await createTestHabit(userId);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1); // yesterday
    const targetEnd = new Date(targetDate);
    targetEnd.setHours(23, 59, 59, 999);

    // Delete the habit 5 days ago (before targetDate)
    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() - 5);
    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt },
    });

    // The habit was deleted before targetDate so it should NOT appear
    const habitsForPastDate = await prisma.habit.findMany({
      where: {
        userId,
        createdAt: { lte: targetEnd },
        OR: [{ deleted: false }, { deleted: true, deletedAt: { gt: targetEnd } }],
      },
    });

    const habitExistedThen = habitsForPastDate.find((h) => h.id === habit.id);
    expect(habitExistedThen).toBeUndefined();
  });

  it('should allow toggling completion for a soft-deleted habit (past date)', async () => {
    const habit = await createTestHabit(userId);

    // Soft-delete it
    await prisma.habit.update({
      where: { id: habit.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    // Should still find the habit without the deleted:false filter
    const found = await prisma.habit.findFirst({
      where: { id: habit.id, userId },
    });

    expect(found).not.toBeNull();
    expect(found?.id).toBe(habit.id);
  });
});

describe('Soft-delete: Subject stat continuity', () => {
  let userId: number;

  beforeAll(async () => {
    const user = await createTestUser();
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.subjectLog.deleteMany({ where: { subject: { userId } } });
    await prisma.subject.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should set deletedAt when a subject is soft-deleted', async () => {
    const subject = await createTestSubject(userId);

    await prisma.subject.update({
      where: { id: subject.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    const updated = await prisma.subject.findUnique({ where: { id: subject.id } });
    expect(updated?.deleted).toBe(true);
    expect(updated?.deletedAt).not.toBeNull();
  });

  it('should still return subject logs after subject is soft-deleted (getAllSubjectsWithLogs behavior)', async () => {
    const subject = await createTestSubject(userId);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const endDate = new Date(pastDate);
    endDate.setHours(pastDate.getHours() + 1);

    await logSubjectFocusTime(subject.id, pastDate, endDate);

    // Soft-delete
    await prisma.subject.update({
      where: { id: subject.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    // Query without deleted:false filter — simulates fixed getAllSubjectsWithLogs
    const subjectsWithLogs = await prisma.subject.findMany({
      where: { userId },
      include: {
        subjectLogs: { where: { deleted: false } },
      },
    });

    const deletedSubject = subjectsWithLogs.find((s) => s.id === subject.id);
    expect(deletedSubject).toBeDefined();
    expect(deletedSubject?.subjectLogs.length).toBeGreaterThan(0);
  });

  it('should include deleted subject logs in timeline stats', async () => {
    const subject = await createTestSubject(userId);

    const startedAt = new Date();
    startedAt.setHours(9, 0, 0, 0);
    const endedAt = new Date(startedAt);
    endedAt.setHours(10, 0, 0, 0);

    await logSubjectFocusTime(subject.id, startedAt, endedAt);

    // Soft-delete
    await prisma.subject.update({
      where: { id: subject.id },
      data: { deleted: true, deletedAt: new Date() },
    });

    // Simulate getDailyTimeline fixed query — no deleted:false on subject relation
    const logs = await prisma.subjectLog.findMany({
      where: {
        subject: { userId },
        startedAt: { gte: startedAt, lte: endedAt },
        deleted: false,
      },
      include: { subject: true },
    });

    const logForDeletedSubject = logs.find((l) => l.subjectId === subject.id);
    expect(logForDeletedSubject).toBeDefined();
    expect(logForDeletedSubject?.subject.deleted).toBe(true);
  });
});
