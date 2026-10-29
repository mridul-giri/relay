import { prisma } from "@repo/db";

export async function readCallsForMerchant(merchantId: string) {
  const rows = await prisma.call.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { transcripts: { orderBy: { spokenAt: "asc" } } },
  });

  const calls = rows.map((row) => {
    const transcripts = row.transcripts.map((turn) => ({
      speaker: turn.speaker,
      text: turn.text,
      spokenAt: turn.spokenAt.toISOString(),
    }));

    const call = {
      id: row.id,
      orderRef: row.orderRef,
      customerName: row.customerName,
      status: row.status,
      outcome: row.outcome,
      offeredSlots: row.offeredSlots,
      chosenSlot: row.chosenSlot,
      transcripts,
      createdAt: row.createdAt.toISOString(),
      endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    };
    return call;
  });

  return calls;
}
