import {
  applyEvent,
  cleanEvent,
  createTrip,
  InvalidInputError,
  nextAction,
  TripEventType,
  type AuditEntry,
  type CallIntent,
  type IncomingEvent,
  type RuleContext,
  type Trip,
} from "@repo/core";
import { getTrip, insertTrip, saveIfVersion } from "./store.ts";

export interface HandleResult {
  trip: Trip;
  audit: AuditEntry[];
  intent: CallIntent | null;
}

function ruleContext(): RuleContext {
  return {
    now: Date.now(),
    delayThresholdMinutes: 15,
  };
}

export function handleEvent(raw: IncomingEvent): HandleResult {
  const event = cleanEvent(raw);

  if (event.type === TripEventType.TRIP_CREATED) {
    const already = getTrip(event.tripId);
    if (already) {
      return { trip: already, audit: [], intent: null };
    }
    const trip = createTrip(event);
    insertTrip(trip);
    return { trip, audit: [], intent: nextAction(trip, ruleContext()) };
  }

  const trip = getTrip(event.tripId);
  if (!trip) {
    throw new InvalidInputError(`no trip ${event.tripId}`);
  }

  const result = applyEvent(trip, event);

  const bumped: Trip = { ...result.trip, version: trip.version + 1 };
  const saved = saveIfVersion(bumped, trip.version);
  if (!saved) {
    throw new Error(`trip ${trip.id} changed while we were working`);
  }

  const intent = nextAction(bumped, ruleContext());

  return { trip: bumped, audit: result.audit, intent };
}
