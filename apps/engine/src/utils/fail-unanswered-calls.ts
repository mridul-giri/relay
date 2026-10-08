import { prisma } from "@repo/db";
import { CallOutcome } from "@repo/types";
import type { CallStore } from "../calls/call-store.ts";

const RING_TIMEOUT_MILLISECONDS = 2 * 60 * 1000;

export async function failUnansweredCalls(calls: CallStore): Promise<void> {
  const cutoff = new Date(Date.now() - RING_TIMEOUT_MILLISECONDS);
  const staleCalls = await calls.findStaleCalls(cutoff);

  for (const staleCall of staleCalls) {
    await prisma.$transaction(async (tx) => {
      const call = await calls.getCall(staleCall.id, tx);
      if (!call || call.outcome !== null) return;

      const occurredAt = new Date().toISOString();
      await calls.endCall(call.id, CallOutcome.NO_ANSWER, occurredAt, tx);
    });
  }

  if (staleCalls.length > 0) {
    console.log(`[engine] ended ${staleCalls.length} unanswered call(s)`);
  }
}
