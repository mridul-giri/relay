export interface IncomingEvent {
  eventId?: unknown;
  tripId?: unknown;
  type?: unknown;
  payload?: unknown;
  occurredAt?: unknown;
}

export const TripEventType = {
  TRIP_CREATED: "TRIP_CREATED",
  DRIVER_EN_ROUTE: "DRIVER_EN_ROUTE",
  ETA_CHANGED: "ETA_CHANGED",
  SLOT_SELECTED: "SLOT_SELECTED",
  TRIP_ESCALATED: "TRIP_ESCALATED",
} as const;

export type TripEventType = (typeof TripEventType)[keyof typeof TripEventType];

export const IncomingEventType = {
  TRIP_CREATED: TripEventType.TRIP_CREATED,
  DRIVER_EN_ROUTE: TripEventType.DRIVER_EN_ROUTE,
  ETA_CHANGED: TripEventType.ETA_CHANGED,
} as const;

export type IncomingEventType =
  (typeof IncomingEventType)[keyof typeof IncomingEventType];

export interface TripEvent {
  eventId: string;
  tripId: string;
  type: TripEventType;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface TripEventRecord {
  eventId: string;
  tripId: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  versionBefore: number;
  versionAfter: number;
}
