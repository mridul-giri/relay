import { checkToolCall, cleanToolCall, InvalidInputError } from "@repo/core";
import { CallAttemptStatus, TripEventType } from "@repo/types";
import type { FactMessage } from "@repo/types";
import { prisma } from "@repo/db";
import type { TripEngine } from "../trips/trip-engine.ts";
import type { TripStore } from "../trips/trip-store.ts";
import type { CallStore } from "./call-store.ts";

export class CallFacts {
  constructor(
    private readonly engine: TripEngine,
    private readonly trips: TripStore,
    private readonly calls: CallStore,
  ) {}

  async handleFact(fact: FactMessage): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const alreadyHandled = await this.calls.findToolCall(fact.factId, tx);
      if (alreadyHandled) return;

      const attempt = await this.calls.getAttempt(fact.callAttemptId, tx);
      if (!attempt) {
        throw new InvalidInputError(`no call attempt ${fact.callAttemptId}`);
      }

      const trip = await this.trips.get(attempt.tripId, tx);
      if (!trip) {
        throw new InvalidInputError(`no trip ${attempt.tripId}`);
      }

      const call = cleanToolCall({ tool: fact.tool, args: fact.args });
      const decision = checkToolCall(call, {
        trip,
        allowedSlots: attempt.slots,
      });
      const createdAt = new Date().toISOString();

      if (!decision.accepted || !decision.slot) {
        await this.calls.insertToolCall(
          {
            id: fact.factId,
            callAttemptId: attempt.id,
            tool: call.tool,
            args: call.args,
            accepted: false,
            reason: decision.reason,
            createdAt,
          },
          tx,
        );
        return;
      }

      const slot = decision.slot;

      await this.engine.applyInternalEventInTransaction(
        tx,
        attempt.tripId,
        TripEventType.SLOT_SELECTED,
        {
          slotId: slot.id,
          slotLabel: slot.label,
        },
        fact.factId,
      );

      await this.calls.setAttemptStatus(
        attempt.id,
        CallAttemptStatus.COMPLETED,
        createdAt,
        tx,
      );
      await this.calls.insertToolCall(
        {
          id: fact.factId,
          callAttemptId: attempt.id,
          tool: call.tool,
          args: call.args,
          accepted: true,
          reason: decision.reason,
          createdAt,
        },
        tx,
      );
    });
  }
}
