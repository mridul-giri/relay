import type { CallOutcome, CallPolicy } from "./call.ts";
import type { Slot } from "./slot.ts";

export interface IncomingToolCall {
  tool?: unknown;
  args?: unknown;
}

export const ToolName = {
  SELECT_SLOT: "select_slot",
  CANCEL: "cancel",
  REQUEST_HUMAN: "request_human",
} as const;

export type ToolName = (typeof ToolName)[keyof typeof ToolName];

export interface ToolCall {
  tool: ToolName;
  args: Record<string, unknown>;
}

export interface CallToolContext {
  policy: CallPolicy;
  offeredSlots: Slot[];
}

export interface ToolDecision {
  accepted: boolean;
  reason: string;
  slot?: Slot;
  outcome?: CallOutcome;
}
