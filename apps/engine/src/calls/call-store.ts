import { prisma, Prisma, type TransactionClient } from "@repo/db";
import { CallOutcome, CallStatus } from "@repo/types";
import type { Call, CallContext, CallPolicy, CallRow, Slot } from "@repo/types";

export interface ToolCallRecord {
  id: string;
  callId: string;
  tool: string;
  args: Record<string, unknown>;
  accepted: boolean;
  reason: string;
  createdAt: string;
}

function toCall(row: CallRow): Call {
  const createdAt = row.createdAt.toISOString();
  const startedAt = row.startedAt ? row.startedAt.toISOString() : null;
  const endedAt = row.endedAt ? row.endedAt.toISOString() : null;

  const policy = row.policy as unknown as CallPolicy;
  const offeredSlots = row.offeredSlots as unknown as Slot[];

  const context: CallContext = {
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerLanguage: row.customerLanguage,
    driverName: row.driverName,
    driverPhone: row.driverPhone,
    productName: row.productName,
    productSku: row.productSku,
    etaMinutes: row.etaMinutes,
    message: row.message,
    policy,
  };

  const call: Call = {
    id: row.id,
    requestId: row.requestId,
    merchantId: row.merchantId,
    orderRef: row.orderRef,
    status: row.status,
    outcome: row.outcome,
    context,
    offeredSlots,
    createdAt,
    startedAt,
    endedAt,
  };
  return call;
}

function toCallColumns(call: Call) {
  const columns = {
    id: call.id,
    requestId: call.requestId,
    merchantId: call.merchantId,
    orderRef: call.orderRef,
    status: call.status,
    outcome: call.outcome,
    customerName: call.context.customerName,
    customerPhone: call.context.customerPhone,
    customerLanguage: call.context.customerLanguage,
    driverName: call.context.driverName,
    driverPhone: call.context.driverPhone,
    productName: call.context.productName,
    productSku: call.context.productSku,
    etaMinutes: call.context.etaMinutes,
    message: call.context.message,
    policy: call.context.policy as unknown as Prisma.InputJsonValue,
    offeredSlots: call.offeredSlots as unknown as Prisma.InputJsonValue,
  };
  return columns;
}

export class CallStore {
  async insertCallOnce(call: Call): Promise<boolean> {
    const columns = toCallColumns(call);
    try {
      await prisma.call.create({ data: columns });
      return true;
    } catch (err) {
      const isDuplicate =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002";
      if (isDuplicate) return false;
      throw err;
    }
  }

  async getCall(
    id: string,
    db: TransactionClient = prisma,
  ): Promise<Call | undefined> {
    const row = await db.call.findUnique({ where: { id } });
    const call = row ? toCall(row) : undefined;
    return call;
  }

  async setCallCalling(
    id: string,
    db: TransactionClient = prisma,
  ): Promise<void> {
    await db.call.updateMany({
      where: { id, status: CallStatus.QUEUED },
      data: { status: CallStatus.CALLING },
    });
  }

  async markCallStarted(
    id: string,
    db: TransactionClient = prisma,
  ): Promise<void> {
    await db.call.updateMany({
      where: { id, startedAt: null },
      data: { startedAt: new Date() },
    });
  }

  async endCall(
    id: string,
    outcome: CallOutcome,
    endedAt: string,
    db: TransactionClient = prisma,
  ): Promise<void> {
    await db.call.update({
      where: { id },
      data: {
        status: CallStatus.ENDED,
        outcome,
        endedAt: new Date(endedAt),
      },
    });
  }

  async findStaleCalls(cutoff: Date): Promise<Call[]> {
    const rows = await prisma.call.findMany({
      where: {
        status: CallStatus.CALLING,
        startedAt: null,
        createdAt: { lt: cutoff },
      },
    });
    const calls = rows.map(toCall);
    return calls;
  }

  async findToolCall(id: string, db: TransactionClient = prisma) {
    const record = await db.toolCall.findUnique({ where: { id } });
    return record;
  }

  async insertToolCall(
    record: ToolCallRecord,
    db: TransactionClient = prisma,
  ): Promise<void> {
    await db.toolCall.create({
      data: {
        id: record.id,
        callId: record.callId,
        tool: record.tool,
        args: record.args as Prisma.InputJsonValue,
        accepted: record.accepted,
        reason: record.reason,
        createdAt: new Date(record.createdAt),
      },
    });
  }
}
