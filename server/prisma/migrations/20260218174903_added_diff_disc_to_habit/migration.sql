/*
  Warnings:

  - You are about to drop the column `subjectid` on the `Habit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('HIGH', 'MID', 'LOW');

-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_subjectid_fkey";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "subjectid",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MID',
ADD COLUMN     "subjectId" INTEGER;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
