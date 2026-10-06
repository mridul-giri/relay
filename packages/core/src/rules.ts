import {
  CallPersona,
  CallReason,
  TripStatus,
  type CallIntent,
  type RuleContext,
  type Trip,
} from "@repo/types";

export function nextAction(trip: Trip, ctx: RuleContext): CallIntent | null {
  const delayMinutes = trip.etaMinutes - trip.plannedEtaMinutes;

  const isTooLate = delayMinutes > ctx.delayThresholdMinutes;

  if (trip.status === TripStatus.DELAYED && isTooLate) {
    return {
      tripId: trip.id,
      persona: CallPersona.CUSTOMER,
      reason: CallReason.DELAY,
      ruleId: "delay",
      triggerVersion: trip.version,
    };
  }

  return null;
}
