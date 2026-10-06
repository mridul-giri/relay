import type { Slot } from "./slot.ts";
import type { Trip } from "./trip.ts";

export const CallPersona = {
  DRIVER: "DRIVER",
  CUSTOMER: "CUSTOMER",
} as const;

export type CallPersona = (typeof CallPersona)[keyof typeof CallPersona];

export const CallReason = {
  DELAY: "DELAY",
} as const;

export type CallReason = (typeof CallReason)[keyof typeof CallReason];

export interface CallIntent {
  tripId: string;
  persona: CallPersona;
  reason: CallReason;
  ruleId: string;
  triggerVersion: number;
}

export interface RuleContext {
  now: number;
  delayThresholdMinutes: number;
}

export const CallAttemptStatus = {
  RINGING: "RINGING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type CallAttemptStatus =
  (typeof CallAttemptStatus)[keyof typeof CallAttemptStatus];

export interface CallAttempt {
  id: string;
  tripId: string;
  persona: CallPersona;
  reason: CallReason;
  ruleId: string;
  sourceEventId: string;
  status: CallAttemptStatus;
  slots: Slot[];
  createdAt: string;
  endedAt: string | null;
}

export interface CallAttemptRow {
  id: string;
  tripId: string;
  persona: CallPersona;
  reason: CallReason;
  ruleId: string;
  sourceEventId: string;
  status: CallAttemptStatus;
  slots: unknown;
  createdAt: Date;
  endedAt: Date | null;
}

export interface Escalation {
  id: string;
  tripId: string;
  ruleId: string;
  reason: string;
  createdAt: string;
}

export interface ToolCallRecord {
  id: string;
  callAttemptId: string;
  tool: string;
  args: Record<string, unknown>;
  accepted: boolean;
  reason: string;
  createdAt: string;
}

export interface TranscriptTurn {
  callAttemptId: string;
  speaker: "AGENT" | "CALLER";
  text: string;
  spokenAt: string;
}

export interface CallAttemptView {
  id: string;
  tripId: string;
  persona: string;
  reason: string;
  ruleId: string;
  status: string;
  slots: unknown;
  createdAt: string;
  endedAt: string | null;
}

export interface ToolCallView {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  accepted: boolean;
  reason: string;
  createdAt: string;
}

export interface CallAttemptHistory extends CallAttemptView {
  transcripts: TranscriptTurn[];
  toolCalls: ToolCallView[];
}

export interface CallBrief {
  attempt: {
    id: string;
    tripId: string;
    persona: CallPersona;
    reason: CallReason;
    status: string;
    slots: Slot[];
  };
  trip: Trip;
}

export interface CallSession {
  url: string;
  token: string;
  roomName: string;
}
