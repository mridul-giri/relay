import { prisma } from "@repo/db";
import type { CallView, Slot, TranscriptTurnView } from "@repo/types";

export async function readCall(callId: string) {
  const row = await prisma.call.findUnique({ where: { id: callId } });
  return row ?? undefined;
}

export async function readCallsForMerchant(
  merchantId: string,
): Promise<CallView[]> {
  const rows = await prisma.call.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { transcripts: { orderBy: { spokenAt: "asc" } } },
  });

  const calls = rows.map((row) => {
    const offeredSlots = row.offeredSlots as unknown as Slot[];
    const transcripts: TranscriptTurnView[] = row.transcripts.map((turn) => {
      const view: TranscriptTurnView = {
        speaker: turn.speaker,
        text: turn.text,
        spokenAt: turn.spokenAt.toISOString(),
      };
      return view;
    });

    const call: CallView = {
      id: row.id,
      orderRef: row.orderRef,
      customerName: row.customerName,
      status: row.status,
      outcome: row.outcome,
      offeredSlots,
      transcripts,
      createdAt: row.createdAt.toISOString(),
      endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    };
    return call;
  });

  return calls;
}
