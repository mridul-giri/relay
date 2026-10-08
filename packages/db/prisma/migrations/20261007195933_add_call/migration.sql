/*
  Warnings:

  - You are about to drop the column `callAttemptId` on the `ToolCall` table. All the data in the column will be lost.
  - You are about to drop the column `callAttemptId` on the `TranscriptTurn` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CallAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Escalation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TripEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `callId` to the `ToolCall` table without a default value. This is not possible if the table is not empty.
  - Added the required column `callId` to the `TranscriptTurn` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('QUEUED', 'CALLING', 'ENDED');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('RESCHEDULED', 'CANCELLATION_REQUESTED', 'HUMAN_REQUESTED', 'NO_DECISION', 'NO_ANSWER', 'FAILED');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_tripId_fkey";

-- DropForeignKey
ALTER TABLE "CallAttempt" DROP CONSTRAINT "CallAttempt_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Escalation" DROP CONSTRAINT "Escalation_tripId_fkey";

-- DropForeignKey
ALTER TABLE "ToolCall" DROP CONSTRAINT "ToolCall_callAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "TranscriptTurn" DROP CONSTRAINT "TranscriptTurn_callAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "TripEvent" DROP CONSTRAINT "TripEvent_tripId_fkey";

-- AlterTable
ALTER TABLE "ToolCall" DROP COLUMN "callAttemptId",
ADD COLUMN     "callId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TranscriptTurn" DROP COLUMN "callAttemptId",
ADD COLUMN     "callId" TEXT NOT NULL;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "CallAttempt";

-- DropTable
DROP TABLE "Escalation";

-- DropTable
DROP TABLE "Trip";

-- DropTable
DROP TABLE "TripEvent";

-- DropEnum
DROP TYPE "CallAttemptStatus";

-- DropEnum
DROP TYPE "CallPersona";

-- DropEnum
DROP TYPE "CallReason";

-- DropEnum
DROP TYPE "TripStatus";

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderRef" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'QUEUED',
    "outcome" "CallOutcome",
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerLanguage" TEXT NOT NULL DEFAULT 'en',
    "driverName" TEXT,
    "driverPhone" TEXT,
    "productName" TEXT,
    "productSku" TEXT,
    "etaMinutes" INTEGER NOT NULL,
    "message" TEXT,
    "policy" JSONB NOT NULL,
    "offeredSlots" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Call_requestId_key" ON "Call"("requestId");

-- CreateIndex
CREATE INDEX "Call_merchantId_createdAt_idx" ON "Call"("merchantId", "createdAt");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptTurn" ADD CONSTRAINT "TranscriptTurn_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
