import { prisma, Prisma, type TransactionClient } from "@repo/db";
import { CallAttemptStatus } from "@repo/types";
import type {
  CallAttempt,
  CallAttemptRow,
  Escalation,
  Slot,
  ToolCallRecord,
} from "@repo/types";

function toAttempt(row: CallAttemptRow): CallAttempt {
  const createdAt = row.createdAt.toISOString();
  const endedAt = row.endedAt ? row.endedAt.toISOString() : null;
  return {
    id: row.id,
    tripId: row.tripId,
    persona: row.persona,
    reason: row.reason,
    ruleId: row.ruleId,
    sourceEventId: row.sourceEventId,
    status: row.status,
    slots: row.slots as Slot[],
    createdAt,
    endedAt,
  };
}

export class CallStore {
  async insertAttemptOnce(attempt: CallAttempt): Promise<boolean> {
    const createdAt = new Date(attempt.createdAt);
    const endedAt = attempt.endedAt ? new Date(attempt.endedAt) : null;
    try {
      await prisma.callAttempt.create({
        data: {
          id: attempt.id,
          tripId: attempt.tripId,
          persona: attempt.persona,
          reason: attempt.reason,
          ruleId: attempt.ruleId,
          sourceEventId: attempt.sourceEventId,
          status: attempt.status,
          slots: attempt.slots as unknown as Prisma.InputJsonValue,
          createdAt,
          endedAt,
        },
      });
      return true;
    } catch (err) {
      const isDuplicate =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002";
      if (isDuplicate) return false;
      throw err;
    }
  }

  async countAttempts(tripId: string, ruleId: string): Promise<number> {
    const count = await prisma.callAttempt.count({
      where: { tripId, ruleId },
    });
    return count;
  }

  async getAttempt(
    id: string,
    db: TransactionClient = prisma,
  ): Promise<CallAttempt | undefined> {
    const row = await db.callAttempt.findUnique({ where: { id } });
    const attempt = row ? toAttempt(row) : undefined;
    return attempt;
  }

  async setAttemptStatus(
    id: string,
    status: CallAttemptStatus,
    endedAt: string | null = null,
    db: TransactionClient = prisma,
  ): Promise<void> {
    const endedAtDate = endedAt ? new Date(endedAt) : null;
    await db.callAttempt.update({
      where: { id },
      data: {
        status,
        endedAt: endedAtDate,
      },
    });
  }

  async markCallInProgress(id: string): Promise<void> {
    await prisma.callAttempt.updateMany({
      where: { id, status: CallAttemptStatus.RINGING },
      data: { status: CallAttemptStatus.IN_PROGRESS },
    });
  }

  async markCallFailed(id: string): Promise<void> {
    const endedAt = new Date();
    await prisma.callAttempt.updateMany({
      where: {
        id,
        status: {
          in: [CallAttemptStatus.RINGING, CallAttemptStatus.IN_PROGRESS],
        },
      },
      data: { status: CallAttemptStatus.FAILED, endedAt },
    });
  }

  async failStaleRingingCalls(olderThan: Date): Promise<number> {
    const endedAt = new Date();
    const result = await prisma.callAttempt.updateMany({
      where: {
        status: CallAttemptStatus.RINGING,
        createdAt: { lt: olderThan },
      },
      data: { status: CallAttemptStatus.FAILED, endedAt },
    });
    return result.count;
  }

  async insertEscalation(escalation: Escalation): Promise<void> {
    const createdAt = new Date(escalation.createdAt);
    await prisma.escalation.create({
      data: {
        id: escalation.id,
        tripId: escalation.tripId,
        ruleId: escalation.ruleId,
        reason: escalation.reason,
        createdAt,
      },
    });
  }

  async findToolCall(id: string, db: TransactionClient = prisma) {
    const record = await db.toolCall.findUnique({ where: { id } });
    return record;
  }

  async insertToolCall(
    record: ToolCallRecord,
    db: TransactionClient = prisma,
  ): Promise<void> {
    const createdAt = new Date(record.createdAt);
    await db.toolCall.create({
      data: {
        id: record.id,
        callAttemptId: record.callAttemptId,
        tool: record.tool,
        args: record.args as Prisma.InputJsonValue,
        accepted: record.accepted,
        reason: record.reason,
        createdAt,
      },
    });
  }
}
