import type { CallStatusMessage, StreamNote } from "@repo/types";
import type { CallStore } from "../calls/call-store.ts";

export async function handleCallStartedNote(
  note: StreamNote,
  calls: CallStore,
): Promise<void> {
  const message = note.body as unknown as CallStatusMessage;
  await calls.markCallStarted(message.callId);
  console.log(`[engine] call.started call=${message.callId}`);
}
