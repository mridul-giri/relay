import {
  applyEvent,
  cleanEvent,
  createTrip,
  InvalidInputError,
  nextAction,
} from "@repo/core";
import {
  TripEventType,
  type AuditEntry,
  type CallIntent,
  type IncomingEvent,
  type RuleContext,
  type Trip,
  type TripEvent,
} from "@repo/types";
import { prisma, type TransactionClient } from "@repo/db";
import type { TripStore } from "./trip-store.ts";

export interface HandleResult {
  trip: Trip;
  audit: AuditEntry[];
  intent: CallIntent | null;
  sourceEventId: string | null;
}

function ruleContext(): RuleContext {
  const now = Date.now();
  return {
    now,
    delayThresholdMinutes: 15,
  };
}

export class TripEngine {
  constructor(private readonly trips: TripStore) {}

  async handleEvent(raw: IncomingEvent): Promise<HandleResult> {
    const event = cleanEvent(raw);

    if (event.type === TripEventType.TRIP_CREATED) {
      const created = await this.handleCreation(event);
      return created;
    }
    const changed = await this.handleChange(event);
    return changed;
  }

  private async handleCreation(event: TripEvent): Promise<HandleResult> {
    const handleResult = await prisma.$transaction(async (tx) => {
      const already = await this.trips.get(event.tripId, tx);
      if (already) {
        return { trip: already, audit: [], intent: null, sourceEventId: null };
      }

      const trip = createTrip(event);
      await this.trips.insert(trip, tx);
      await this.trips.insertEvent(tx, {
        eventId: event.eventId,
        tripId: event.tripId,
        type: event.type,
        payload: event.payload,
        occurredAt: event.occurredAt,
        versionBefore: 0,
        versionAfter: trip.version,
      });
      const context = ruleContext();
      const intent = nextAction(trip, context);
      return {
        trip,
        audit: [],
        intent,
        sourceEventId: event.eventId,
      };
    });
    return handleResult;
  }

  private async handleChange(event: TripEvent): Promise<HandleResult> {
    const handleResult = await prisma.$transaction(async (tx) => {
      const alreadyRecorded = await this.trips.findEvent(event.eventId, tx);
      if (alreadyRecorded) {
        const current = await this.trips.get(event.tripId, tx);
        if (!current) {
          throw new InvalidInputError(`no trip ${event.tripId}`);
        }
        const context = ruleContext();
        const intent = nextAction(current, context);
        return {
          trip: current,
          audit: [],
          intent,
          sourceEventId: event.eventId,
        };
      }

      const trip = await this.trips.get(event.tripId, tx);
      if (!trip) {
        throw new InvalidInputError(`no trip ${event.tripId}`);
      }

      const result = applyEvent(trip, event);

      const bumped: Trip = { ...result.trip, version: trip.version + 1 };
      const saved = await this.trips.saveIfVersion(bumped, trip.version, tx);
      if (!saved) {
        throw new Error(`trip ${trip.id} changed while we were working`);
      }

      await this.trips.insertEvent(tx, {
        eventId: event.eventId,
        tripId: event.tripId,
        type: event.type,
        payload: event.payload,
        occurredAt: event.occurredAt,
        versionBefore: trip.version,
        versionAfter: bumped.version,
      });
      await this.trips.insertAudit(tx, bumped.id, result.audit);

      const context = ruleContext();
      const intent = nextAction(bumped, context);
      return {
        trip: bumped,
        audit: result.audit,
        intent,
        sourceEventId: event.eventId,
      };
    });
    return handleResult;
  }

  async applyInternalEventInTransaction(
    tx: TransactionClient,
    tripId: string,
    type: TripEventType,
    payload: Record<string, unknown>,
    eventId: string,
  ): Promise<Trip | null> {
    const alreadyRecorded = await this.trips.findEvent(eventId, tx);
    if (alreadyRecorded) return null;

    const trip = await this.trips.get(tripId, tx);
    if (!trip) {
      throw new InvalidInputError(`no trip ${tripId}`);
    }

    const occurredAt = new Date().toISOString();
    const event: TripEvent = { eventId, tripId, type, payload, occurredAt };

    const result = applyEvent(trip, event);

    const bumped: Trip = { ...result.trip, version: trip.version + 1 };
    const saved = await this.trips.saveIfVersion(bumped, trip.version, tx);
    if (!saved) {
      throw new Error(`trip ${trip.id} changed while we were working`);
    }

    await this.trips.insertEvent(tx, {
      eventId: event.eventId,
      tripId,
      type,
      payload,
      occurredAt: event.occurredAt,
      versionBefore: trip.version,
      versionAfter: bumped.version,
    });
    await this.trips.insertAudit(tx, bumped.id, result.audit);

    return bumped;
  }

  async applyInternalEvent(
    tripId: string,
    type: TripEventType,
    payload: Record<string, unknown>,
    eventId: string,
  ): Promise<Trip> {
    const updatedTrip = await prisma.$transaction(async (tx) => {
      const applied = await this.applyInternalEventInTransaction(
        tx,
        tripId,
        type,
        payload,
        eventId,
      );
      if (applied) return applied;
      const current = await this.trips.get(tripId, tx);
      if (!current) {
        throw new InvalidInputError(`no trip ${tripId}`);
      }
      return current;
    });
    return updatedTrip;
  }
}
