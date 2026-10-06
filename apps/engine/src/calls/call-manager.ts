import { randomUUID } from "node:crypto";
import { generateSlots } from "@repo/core";
import { CallAttemptStatus } from "@repo/types";
import type { CallAttempt, CallIntent, VoiceRuntime } from "@repo/types";
import type { TripStore } from "../trips/trip-store.ts";
import type { CallStore } from "./call-store.ts";

export class CallManager {
  constructor(
    private readonly runtime: VoiceRuntime,
    private readonly trips: TripStore,
    private readonly calls: CallStore,
  ) {}

  async startCall(
    intent: CallIntent,
    sourceEventId: string,
  ): Promise<CallAttempt | null> {
    const trip = await this.trips.get(intent.tripId);
    if (!trip) {
      throw new Error(`no trip ${intent.tripId}`);
    }

    const now = Date.now();
    const slots = generateSlots(trip, now);

    const callAttemptId = randomUUID();
    const createdAt = new Date().toISOString();
    const attempt: CallAttempt = {
      id: callAttemptId,
      tripId: trip.id,
      persona: intent.persona,
      reason: intent.reason,
      ruleId: intent.ruleId,
      sourceEventId,
      status: CallAttemptStatus.RINGING,
      slots,
      createdAt,
      endedAt: null,
    };
    const wasInserted = await this.calls.insertAttemptOnce(attempt);
    if (!wasInserted) return null;

    await this.runtime.startCall({
      callAttemptId: attempt.id,
      trip,
      persona: intent.persona,
      reason: intent.reason,
      slots,
    });

    return attempt;
  }
}
