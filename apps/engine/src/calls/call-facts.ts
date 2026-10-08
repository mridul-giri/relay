import { checkToolCall, cleanToolCall, InvalidInputError } from "@repo/core";
import type { FactMessage } from "@repo/types";
import { prisma } from "@repo/db";
import type { CallStore } from "./call-store.ts";

export class CallFacts {
  constructor(private readonly calls: CallStore) {}

  async handleFact(fact: FactMessage): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const alreadyHandled = await this.calls.findToolCall(fact.factId, tx);
      if (alreadyHandled) return;

      const call = await this.calls.getCall(fact.callId, tx);
      if (!call) {
        throw new InvalidInputError(`no call ${fact.callId}`);
      }

      const proposal = cleanToolCall({ tool: fact.tool, args: fact.args });
      const decision = checkToolCall(proposal, {
        policy: call.context.policy,
        offeredSlots: call.offeredSlots,
      });
      const createdAt = new Date().toISOString();

      await this.calls.insertToolCall(
        {
          id: fact.factId,
          callId: call.id,
          tool: proposal.tool,
          args: proposal.args,
          accepted: decision.accepted,
          reason: decision.reason,
          createdAt,
        },
        tx,
      );

      const isFinalChoice = decision.accepted && decision.outcome !== undefined;
      if (
        isFinalChoice &&
        decision.outcome !== undefined &&
        call.outcome === null
      ) {
        await this.calls.endCall(call.id, decision.outcome, createdAt, tx);
      }
    });
  }
}
