import { prisma } from "@repo/db";

export interface AgentCall {
  id: string;
  customerName: string;
  customerLanguage: string;
  driverName: string | null;
  productName: string | null;
  etaMinutes: number;
  message: string | null;
  policy: { mayCancel: boolean; mayReschedule: boolean };
  offeredSlots: { id: string; label: string; startsAt: string }[];
}

export async function readCallForRoom(roomName: string) {
  const row = await prisma.call.findUnique({ where: { roomName } });
  if (!row) return null;

  const call: AgentCall = {
    id: row.id,
    customerName: row.customerName,
    customerLanguage: row.customerLanguage,
    driverName: row.driverName,
    productName: row.productName,
    etaMinutes: row.etaMinutes,
    message: row.message,
    policy: row.policy as AgentCall["policy"],
    offeredSlots: row.offeredSlots as AgentCall["offeredSlots"],
  };
  return call;
}
