/*
  Warnings:

  - You are about to drop the `ToolCall` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roomName]` on the table `Call` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomName` to the `Call` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ToolCall" DROP CONSTRAINT "ToolCall_callId_fkey";

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "chosenSlot" JSONB,
ADD COLUMN     "roomName" TEXT NOT NULL;

-- DropTable
DROP TABLE "ToolCall";

-- CreateIndex
CREATE UNIQUE INDEX "Call_roomName_key" ON "Call"("roomName");
