-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "deletedAt" TIMESTAMP(3);
