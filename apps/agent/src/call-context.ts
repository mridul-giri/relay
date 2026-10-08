import { prisma } from "@repo/db";
import type { CallPolicy, Slot } from "@repo/types";

export interface AgentCall {
  id: string;
  customerName: string;
  customerLanguage: string;
  driverName: string | null;
  productName: string | null;
  etaMinutes: number;
  message: string | null;
  policy: CallPolicy;
  offeredSlots: Slot[];
}

export async function readCallContext(callId: string): Promise<AgentCall> {
  const row = await prisma.call.findUnique({ where: { id: callId } });
  if (!row) {
    throw new Error(`no call ${callId}`);
  }

  const policy = row.policy as unknown as CallPolicy;
  const offeredSlots = row.offeredSlots as unknown as Slot[];

  const call: AgentCall = {
    id: row.id,
    customerName: row.customerName,
    customerLanguage: row.customerLanguage,
    driverName: row.driverName,
    productName: row.productName,
    etaMinutes: row.etaMinutes,
    message: row.message,
    policy,
    offeredSlots,
  };
  return call;
}
