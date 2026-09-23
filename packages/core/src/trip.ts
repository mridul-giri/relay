export const TripStatus = {
  ASSIGNED: "ASSIGNED",
  EN_ROUTE: "EN_ROUTE",
  DELAYED: "DELAYED",
  RESCHEDULED: "RESCHEDULED",
  DELIVERED: "DELIVERED",
  ESCALATED: "ESCALATED",
} as const;

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

export interface Person {
  name: string;
  phone: string;
}

export interface Trip {
  id: string;
  status: TripStatus;
  driver: Person;
  customer: Person;
  plannedEtaMinutes: number;
  etaMinutes: number;
  slot: string | null;
  note: string | null;
  version: number;
}

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

  return TRANSITIONS[from]?.includes(to) ?? false;
}
