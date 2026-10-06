import { TripStatus } from "@repo/types";

export const TRANSITIONS: Record<TripStatus, readonly TripStatus[]> = {
  ASSIGNED: [TripStatus.EN_ROUTE, TripStatus.ESCALATED],
  EN_ROUTE: [TripStatus.DELAYED, TripStatus.DELIVERED, TripStatus.ESCALATED],
  DELAYED: [
    TripStatus.EN_ROUTE,
    TripStatus.RESCHEDULED,
    TripStatus.DELIVERED,
    TripStatus.ESCALATED,
  ],
  RESCHEDULED: [
    TripStatus.EN_ROUTE,
    TripStatus.DELIVERED,
    TripStatus.ESCALATED,
  ],
  DELIVERED: [],
  ESCALATED: [],
};

export function isTransitionAllowed(from: TripStatus, to: TripStatus): boolean {
  if (from === to) return true;

  const isAllowed = TRANSITIONS[from]?.includes(to) ?? false;
  return isAllowed;
}
