import type { Person, Trip } from "./trip.ts";
import { isTransitionAllowed, TripStatus } from "./trip.ts";
import type { TripEvent } from "./events.ts";
import { TripEventType } from "./events.ts";
import { InvalidInputError } from "./errors.ts";

export interface AuditEntry {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ApplyResult {
  trip: Trip;
  audit: AuditEntry[];
}

function readPerson(value: unknown, field: string): Person {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError(
      `event.${field} must be an object with name and phone`,
    );
  }
  const record = value as Record<string, unknown>;
  const name = record.name;
  const phone = record.phone;
  if (typeof name !== "string" || name.trim() === "") {
    throw new InvalidInputError(
      `event.${field}.name must be a non-empty string`,
    );
  }
  if (typeof phone !== "string" || phone.trim() === "") {
    throw new InvalidInputError(
      `event.${field}.phone must be a non-empty string`,
    );
  }
  return { name, phone };
}

function readMinutes(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new InvalidInputError(
      `event.${field} must be a number of minutes (0 or more)`,
    );
  }
  return value;
}

function moveTo(trip: Trip, to: TripStatus, audit: AuditEntry[]): Trip {
  if (!isTransitionAllowed(trip.status, to)) {
    throw new InvalidInputError(
      `illegal status change ${trip.status} -> ${to}`,
    );
  }
  if (trip.status !== to) {
    audit.push({ type: "status", message: `status ${trip.status} -> ${to}` });
  }
  return { ...trip, status: to };
}

export function createTrip(event: TripEvent): Trip {
  if (event.type !== TripEventType.TRIP_CREATED) {
    throw new Error("only TRIP_CREATED can create a trip");
  }
  const driver = readPerson(event.payload.driver, "driver");
  const customer = readPerson(event.payload.customer, "customer");
  const etaMinutes = readMinutes(event.payload.etaMinutes, "etaMinutes");

  return {
    id: event.tripId,
    status: TripStatus.ASSIGNED,
    driver,
    customer,
    plannedEtaMinutes: etaMinutes,
    etaMinutes,
    slot: null,
    note: null,
    version: 1,
  };
}

export function applyEvent(trip: Trip, event: TripEvent): ApplyResult {
  const audit: AuditEntry[] = [];

  switch (event.type) {
    case TripEventType.TRIP_CREATED:
      throw new Error(
        "TRIP_CREATED creates a trip; it cannot be applied to one",
      );

    case TripEventType.DRIVER_EN_ROUTE: {
      const next = moveTo(trip, TripStatus.EN_ROUTE, audit);
      return { trip: next, audit };
    }

    case TripEventType.ETA_CHANGED: {
      const etaMinutes = readMinutes(event.payload.etaMinutes, "etaMinutes");
      let next: Trip = { ...trip, etaMinutes };
      audit.push({
        type: "eta",
        message: `eta ${trip.etaMinutes} -> ${etaMinutes} minutes`,
        data: { etaMinutes },
      });

      if (
        etaMinutes > trip.plannedEtaMinutes &&
        isTransitionAllowed(next.status, TripStatus.DELAYED)
      ) {
        next = moveTo(next, TripStatus.DELAYED, audit);
      }
      return { trip: next, audit };
    }

    default:
      throw new Error(`unhandled event type ${String(event.type)}`);
  }
}
