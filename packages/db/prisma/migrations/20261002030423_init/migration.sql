-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('ASSIGNED', 'EN_ROUTE', 'DELAYED', 'RESCHEDULED', 'DELIVERED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "CallPersona" AS ENUM ('DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "CallReason" AS ENUM ('DELAY', 'SILENCE');

-- CreateEnum
CREATE TYPE "CallAttemptStatus" AS ENUM ('RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TranscriptSpeaker" AS ENUM ('AGENT', 'CALLER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "plannedEtaMinutes" INTEGER NOT NULL,
    "etaMinutes" INTEGER NOT NULL,
    "slot" TEXT,
    "note" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "versionBefore" INTEGER NOT NULL,
    "versionAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallAttempt" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "persona" "CallPersona" NOT NULL,
    "reason" "CallReason" NOT NULL,
    "ruleId" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "status" "CallAttemptStatus" NOT NULL,
    "slots" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "CallAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptTurn" (
    "id" TEXT NOT NULL,
    "callAttemptId" TEXT NOT NULL,
    "speaker" "TranscriptSpeaker" NOT NULL,
    "text" TEXT NOT NULL,
    "spokenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL,
    "callAttemptId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escalation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escalation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Trip_createdAt_id_idx" ON "Trip"("createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "TripEvent_eventId_key" ON "TripEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CallAttempt_tripId_ruleId_sourceEventId_key" ON "CallAttempt"("tripId", "ruleId", "sourceEventId");

-- AddForeignKey
ALTER TABLE "TripEvent" ADD CONSTRAINT "TripEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAttempt" ADD CONSTRAINT "CallAttempt_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptTurn" ADD CONSTRAINT "TranscriptTurn_callAttemptId_fkey" FOREIGN KEY ("callAttemptId") REFERENCES "CallAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_callAttemptId_fkey" FOREIGN KEY ("callAttemptId") REFERENCES "CallAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escalation" ADD CONSTRAINT "Escalation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
