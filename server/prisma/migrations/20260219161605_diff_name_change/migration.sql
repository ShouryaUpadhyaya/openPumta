/*
  Warnings:

  - The `difficulty` column on the `Habit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('HIGH', 'MID', 'LOW');

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "difficulty" NOT NULL DEFAULT 'MID';

-- DropEnum
DROP TYPE "Difficulty";
