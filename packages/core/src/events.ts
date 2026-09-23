import { InvalidInputError } from "./errors.ts";

export const TripEventType = {
  TRIP_CREATED: "TRIP_CREATED",
  DRIVER_EN_ROUTE: "DRIVER_EN_ROUTE",
  ETA_CHANGED: "ETA_CHANGED",
} as const;

export type TripEventType = (typeof TripEventType)[keyof typeof TripEventType];

export interface TripEvent {
  eventId: string;
  tripId: string;
  type: TripEventType;
  payload: Record<string, unknown>;
  occurredAt: string;
}

// Can not trust whatever the transport system sends
export interface IncomingEvent {
  eventId?: unknown;
  tripId?: unknown;
  type?: unknown;
  payload?: unknown;
  occurredAt?: unknown;
}

function readText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new InvalidInputError(`event.${field} must be a non-empty string`);
  }
  return value;
}

export function cleanEvent(raw: IncomingEvent): TripEvent {
  const eventId = readText(raw.eventId, "eventId");
  const tripId = readText(raw.tripId, "tripId");
  const occurredAt = readText(raw.occurredAt, "occurredAt");

  const type = readText(raw.type, "type");
  const knownTypes = Object.values(TripEventType);
  if (!knownTypes.includes(type as TripEventType)) {
    throw new InvalidInputError(
      `event.type must be one of ${knownTypes.join(", ")}`,
    );
  }

  const payload = raw.payload === undefined ? {} : raw.payload;
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    throw new InvalidInputError("event.payload must be an object");
  }

  return {
    eventId,
    tripId,
    type: type as TripEventType,
    payload: payload as Record<string, unknown>,
    occurredAt,
  };
}
