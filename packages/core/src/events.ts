import {
  IncomingEventType,
  TripEventType,
  type IncomingEvent,
  type TripEvent,
} from "@repo/types";
import { InvalidInputError } from "./errors.ts";

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
  const knownTypes = Object.values(IncomingEventType);
  const isKnownType = knownTypes.includes(type as IncomingEventType);
  if (!isKnownType) {
    const knownList = knownTypes.join(", ");
    throw new InvalidInputError(`event.type must be one of ${knownList}`);
  }

  const payload = raw.payload === undefined ? {} : raw.payload;
  const isPayloadAList = Array.isArray(payload);
  if (typeof payload !== "object" || payload === null || isPayloadAList) {
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
