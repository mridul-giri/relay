import { randomUUID } from "node:crypto";
import { isTransitionAllowed } from "@repo/core";
import { TripEventType, TripStatus, type CallIntent } from "@repo/types";
import type { TripStore } from "../trips/trip-store.ts";
import type { TripEngine } from "../trips/trip-engine.ts";
import type { CallStore } from "./call-store.ts";
import type { CallManager } from "./call-manager.ts";

const MAX_ATTEMPTS_PER_RULE = 3;

export class CallDispatcher {
  constructor(
    private readonly manager: CallManager,
    private readonly engine: TripEngine,
    private readonly trips: TripStore,
    private readonly calls: CallStore,
  ) {}

  async placeCall(intent: CallIntent, sourceEventId: string): Promise<void> {
    const attemptsMade = await this.calls.countAttempts(
      intent.tripId,
      intent.ruleId,
    );

    if (attemptsMade >= MAX_ATTEMPTS_PER_RULE) {
      const reason = `gave up after ${attemptsMade} call attempts`;
      await this.escalate(intent, reason);
      return;
    }

    await this.manager.startCall(intent, sourceEventId);
  }

  private async escalate(intent: CallIntent, reason: string): Promise<void> {
    const trip = await this.trips.get(intent.tripId);
    if (!trip) return;

    if (trip.status === TripStatus.ESCALATED) return;
    const canEscalate = isTransitionAllowed(trip.status, TripStatus.ESCALATED);
    if (!canEscalate) return;

    const escalationId = randomUUID();
    const createdAt = new Date().toISOString();
    await this.calls.insertEscalation({
      id: escalationId,
      tripId: intent.tripId,
      ruleId: intent.ruleId,
      reason,
      createdAt,
    });

    const escalationEventId = randomUUID();
    await this.engine.applyInternalEvent(
      intent.tripId,
      TripEventType.TRIP_ESCALATED,
      { reason },
      escalationEventId,
    );
  }
}
