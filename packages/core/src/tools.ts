import {
  ToolName,
  TripStatus,
  type IncomingToolCall,
  type ToolCall,
  type ToolContext,
  type ToolDecision,
} from "@repo/types";
import { InvalidInputError } from "./errors.ts";
import { isTransitionAllowed } from "./trip.ts";

export function cleanToolCall(raw: IncomingToolCall): ToolCall {
  if (typeof raw.tool !== "string") {
    throw new InvalidInputError("tool call must have a tool name");
  }
  const knownTools = Object.values(ToolName);
  const isKnownTool = knownTools.includes(raw.tool as ToolName);
  if (!isKnownTool) {
    const knownList = knownTools.join(", ");
    throw new InvalidInputError(`tool must be one of ${knownList}`);
  }

  const args = raw.args === undefined ? {} : raw.args;
  const isArgsAList = Array.isArray(args);
  if (typeof args !== "object" || args === null || isArgsAList) {
    throw new InvalidInputError("tool call args must be an object");
  }

  return { tool: raw.tool as ToolName, args: args as Record<string, unknown> };
}

export function checkToolCall(call: ToolCall, ctx: ToolContext): ToolDecision {
  if (call.tool !== ToolName.SELECT_SLOT) {
    return { accepted: false, reason: `tool ${call.tool} does nothing yet` };
  }

  const slotId = call.args.slotId;
  if (typeof slotId !== "string") {
    return { accepted: false, reason: "slotId must be a string" };
  }

  const slot = ctx.allowedSlots.find((candidate) => candidate.id === slotId);
  if (!slot) {
    return { accepted: false, reason: `slot ${slotId} was not offered` };
  }

  const canReschedule = isTransitionAllowed(
    ctx.trip.status,
    TripStatus.RESCHEDULED,
  );
  if (!canReschedule) {
    return {
      accepted: false,
      reason: `cannot reschedule a ${ctx.trip.status} trip`,
    };
  }

  return { accepted: true, reason: `slot ${slot.label} accepted`, slot };
}
