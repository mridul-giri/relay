import { prisma, CallOutcome, CallStatus } from "@repo/db";
import type { AgentCall } from "./call-context.ts";

async function endCallOnce(
  callId: string,
  outcome: CallOutcome,
  chosenSlot?: { id: string; label: string; startsAt: string },
) {
  await prisma.call.updateMany({
    where: { id: callId, outcome: null },
    data: {
      status: CallStatus.ENDED,
      outcome,
      chosenSlot,
      endedAt: new Date(),
    },
  });
}

export async function saveCallStarted(callId: string) {
  await prisma.call.updateMany({
    where: { id: callId, status: CallStatus.QUEUED },
    data: { status: CallStatus.CALLING, startedAt: new Date() },
  });
}

export async function saveSlotChoice(call: AgentCall, slotId: string) {
  if (!call.policy.mayReschedule) {
    return "Rescheduling is not allowed on this call. Offer to have a person call them back.";
  }

  const slot = call.offeredSlots.find((offered) => offered.id === slotId);
  if (!slot) {
    const offeredLabels = call.offeredSlots.map((offered) => offered.label);
    const offeredText = offeredLabels.join(", ");
    return `That time is not one of the offered times. Offer only these: ${offeredText}.`;
  }

  await endCallOnce(call.id, CallOutcome.RESCHEDULED, slot);
  return `The new time ${slot.label} is recorded. Tell the person they will get a confirmation, then say goodbye.`;
}

export async function saveCancelRequest(call: AgentCall) {
  if (!call.policy.mayCancel) {
    return "Cancelling is not allowed on this call. Offer to have a person call them back instead.";
  }

  await endCallOnce(call.id, CallOutcome.CANCELLATION_REQUESTED);
  return "The cancellation request is recorded. Tell the person the merchant will handle it.";
}

export async function saveHumanRequest(call: AgentCall) {
  await endCallOnce(call.id, CallOutcome.HUMAN_REQUESTED);
  return "A person will follow up. Tell the person that and say goodbye.";
}

export async function saveCallEnded(callId: string) {
  await endCallOnce(callId, CallOutcome.NO_DECISION);
}

export async function saveCallFailed(callId: string) {
  await endCallOnce(callId, CallOutcome.FAILED);
}
