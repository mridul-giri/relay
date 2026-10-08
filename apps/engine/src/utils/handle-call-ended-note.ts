import { prisma } from "@repo/db";
import { InvalidInputError } from "@repo/core";
import { CallOutcome, CommandKind } from "@repo/types";
import type { CallStatusMessage, StreamNote } from "@repo/types";
import type { CallStore } from "../calls/call-store.ts";

export async function handleCallEndedNote(
  note: StreamNote,
  calls: CallStore,
): Promise<void> {
  const message = note.body as unknown as CallStatusMessage;

  await prisma.$transaction(async (tx) => {
    const call = await calls.getCall(message.callId, tx);
    if (!call) {
      throw new InvalidInputError(`no call ${message.callId}`);
    }

    if (call.outcome !== null) return;

    const outcome =
      message.kind === CommandKind.CALL_FAILED
        ? CallOutcome.FAILED
        : CallOutcome.NO_DECISION;
    const occurredAt = new Date().toISOString();
    await calls.endCall(call.id, outcome, occurredAt, tx);
  });

  console.log(
    `[engine] call ended call=${message.callId} kind=${message.kind}`,
  );
}
