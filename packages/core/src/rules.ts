import type { Trip } from "./trip.ts";
import { TripStatus } from "./trip.ts";

export const CallPersona = {
  DRIVER: "DRIVER",
  CUSTOMER: "CUSTOMER",
} as const;
export type CallPersona = (typeof CallPersona)[keyof typeof CallPersona];

export const CallReason = {
  DELAY: "DELAY",
  SILENCE: "SILENCE",
} as const;
export type CallReason = (typeof CallReason)[keyof typeof CallReason];

export interface CallIntent {
  tripId: string;
  persona: CallPersona;
  reason: CallReason;
  ruleId: string;
  triggerVersion: number;
}

export interface RuleContext {
  now: number;
  delayThresholdMinutes: number;
}

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
