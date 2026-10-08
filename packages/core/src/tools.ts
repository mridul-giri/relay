import { z } from "zod";
import {
  CallOutcome,
  ToolName,
  type CallToolContext,
  type IncomingToolCall,
  type ToolCall,
  type ToolDecision,
} from "@repo/types";
import { InvalidInputError } from "./errors.ts";

const toolCallSchema = z.object({
  tool: z.enum([ToolName.SELECT_SLOT, ToolName.CANCEL, ToolName.REQUEST_HUMAN]),
  args: z.record(z.string(), z.unknown()).default({}),
});

export function cleanToolCall(raw: IncomingToolCall): ToolCall {
  const result = toolCallSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue === undefined) {
      throw new InvalidInputError("tool call is invalid");
    }
    const path = issue.path.join(".");
    const message =
      path === "" ? issue.message : `tool call ${path} ${issue.message}`;
    throw new InvalidInputError(message);
  }

  const call: ToolCall = {
    tool: result.data.tool,
    args: result.data.args,
  };
  return call;
}

export function checkToolCall(
  call: ToolCall,
  ctx: CallToolContext,
): ToolDecision {
  if (call.tool === ToolName.SELECT_SLOT) {
    return checkSlot(call, ctx);
  }
  if (call.tool === ToolName.CANCEL) {
    return checkCancel(ctx);
  }
  return checkHuman();
}

function checkSlot(call: ToolCall, ctx: CallToolContext): ToolDecision {
  if (!ctx.policy.mayReschedule) {
    return {
      accepted: false,
      reason: "rescheduling is not allowed on this call",
    };
  }

  const slotId = call.args.slotId;
  if (typeof slotId !== "string") {
    return { accepted: false, reason: "slotId must be a string" };
  }

  const slot = ctx.offeredSlots.find((candidate) => candidate.id === slotId);
  if (!slot) {
    return { accepted: false, reason: `slot ${slotId} was not offered` };
  }

  const decision = {
    accepted: true,
    reason: `slot ${slot.label} accepted`,
    slot,
    outcome: CallOutcome.RESCHEDULED,
  };
  return decision;
}

function checkCancel(ctx: CallToolContext): ToolDecision {
  if (!ctx.policy.mayCancel) {
    return {
      accepted: false,
      reason: "cancelling is not allowed on this call",
    };
  }
  const decision = {
    accepted: true,
    reason: "cancellation recorded",
    outcome: CallOutcome.CANCELLATION_REQUESTED,
  };
  return decision;
}

function checkHuman(): ToolDecision {
  const decision = {
    accepted: true,
    reason: "human handoff recorded",
    outcome: CallOutcome.HUMAN_REQUESTED,
  };
  return decision;
}
