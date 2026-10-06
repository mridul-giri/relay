import type { CallStore } from "../calls/call-store.ts";

const RING_TIMEOUT_MILLISECONDS = 2 * 60 * 1000;

export async function failUnansweredCalls(calls: CallStore): Promise<void> {
  const cutoff = new Date(Date.now() - RING_TIMEOUT_MILLISECONDS);
  const failedCount = await calls.failStaleRingingCalls(cutoff);
  if (failedCount > 0) {
    console.log(`[engine] failed ${failedCount} unanswered call(s)`);
  }
}
