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
  delayReason: string | null;
  version: number;
}

export interface AuditEntry {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ApplyResult {
  trip: Trip;
  audit: AuditEntry[];
}

export interface TripRow {
  id: string;
  status: Trip["status"];
  driverName: string;
  driverPhone: string;
  customerName: string;
  customerPhone: string;
  plannedEtaMinutes: number;
  etaMinutes: number;
  slot: string | null;
  note: string | null;
  delayReason: string | null;
  version: number;
}

export interface TripPage {
  trips: Trip[];
  nextCursor: string | null;
}
