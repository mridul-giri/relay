import type { CallStatusMessage, StreamNote } from "@repo/types";
import type { CallStore } from "../calls/call-store.ts";

export async function handleCallFailedNote(
  note: StreamNote,
  calls: CallStore,
): Promise<void> {
  const message = note.body as unknown as CallStatusMessage;
  await calls.markCallFailed(message.callAttemptId);
  const reason = message.reason ?? "unknown";
  console.log(`[engine] call.failed call=${message.callAttemptId} reason=${reason}`);
}
