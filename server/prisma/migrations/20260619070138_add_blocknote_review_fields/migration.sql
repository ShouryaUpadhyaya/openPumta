/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_columnId_fkey";

-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_spaceId_fkey";

-- AlterTable
ALTER TABLE "DailyRating" ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reviewTemplate" JSONB;

-- DropTable
DROP TABLE "Block";

-- DropTable
DROP TABLE "Column";

-- DropEnum
DROP TYPE "BlockType";

-- CreateTable
CREATE TABLE "TextBox" (
    "id" SERIAL NOT NULL,
    "spaceId" INTEGER NOT NULL,
    "content" JSONB NOT NULL DEFAULT '[]',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TextBox_spaceId_idx" ON "TextBox"("spaceId");

-- CreateIndex
CREATE INDEX "TextBox_spaceId_deleted_idx" ON "TextBox"("spaceId", "deleted");

-- AddForeignKey
ALTER TABLE "TextBox" ADD CONSTRAINT "TextBox_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
