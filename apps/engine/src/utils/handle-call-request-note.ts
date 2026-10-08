import { generateSlots } from "@repo/core";
import type { CallRequestMessage, StreamNote } from "@repo/types";
import type { CallManager } from "../calls/call-manager.ts";
import type { CallStore } from "../calls/call-store.ts";
import { buildCall } from "../calls/new-call.ts";

export async function handleCallRequestNote(
  note: StreamNote,
  calls: CallStore,
  manager: CallManager,
): Promise<void> {
  const message = note.body as unknown as CallRequestMessage;
  const { callId, merchantId, request } = message;

  const window = request.policy.rescheduleWindow;
  const offeredSlots =
    request.policy.mayReschedule && window
      ? generateSlots(window, Date.now())
      : [];

  const call = buildCall(callId, merchantId, request, offeredSlots, Date.now());
  const wasInserted = await calls.insertCallOnce(call);
  if (!wasInserted) {
    console.log(`[engine] duplicate request requestId=${request.requestId}`);
    return;
  }

  await manager.placeCall(callId);
  console.log(`[engine] call placed callId=${callId} merchantId=${merchantId}`);
}
