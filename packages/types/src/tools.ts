import type { Slot } from "./slot.ts";
import type { Trip } from "./trip.ts";

export interface IncomingToolCall {
  tool?: unknown;
  args?: unknown;
}

export const ToolName = {
  SELECT_SLOT: "select_slot",
} as const;

export type ToolName = (typeof ToolName)[keyof typeof ToolName];

export interface ToolCall {
  tool: ToolName;
  args: Record<string, unknown>;
}

export interface ToolContext {
  trip: Trip;
  allowedSlots: Slot[];
}

export interface ToolDecision {
  accepted: boolean;
  reason: string;
  slot?: Slot;
}
