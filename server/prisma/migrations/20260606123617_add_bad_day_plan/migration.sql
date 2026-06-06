-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "height" INTEGER;

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "badDayPlan" TEXT;

-- AlterTable
ALTER TABLE "HabitTimeLog" ADD COLUMN     "isBadDayPlan" BOOLEAN NOT NULL DEFAULT false;
