import { prisma, CallOutcome, CallStatus } from "@repo/db";

const RING_TIMEOUT_MILLISECONDS = 2 * 60 * 1000;

export async function endUnansweredCalls() {
  const cutoff = new Date(Date.now() - RING_TIMEOUT_MILLISECONDS);
  const ended = await prisma.call.updateMany({
    where: { status: CallStatus.QUEUED, createdAt: { lt: cutoff } },
    data: {
      status: CallStatus.ENDED,
      outcome: CallOutcome.NO_ANSWER,
      endedAt: new Date(),
    },
  });

  if (ended.count > 0) {
    console.log(`[api:calls] ended ${ended.count} unanswered call(s)`);
  }
}
