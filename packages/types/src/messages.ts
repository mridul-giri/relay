import type { CleanCallRequest } from "./call.ts";

export const CommandKind = {
  CALL_REQUEST: "call.request",
  FACT_EXTRACTED: "fact.extracted",
  CALL_STARTED: "call.started",
  CALL_ENDED: "call.ended",
  CALL_FAILED: "call.failed",
} as const;

export type CommandKind = (typeof CommandKind)[keyof typeof CommandKind];

export interface CallRequestMessage {
  kind: typeof CommandKind.CALL_REQUEST;
  callId: string;
  merchantId: string;
  request: CleanCallRequest;
}

export interface FactMessage {
  kind: typeof CommandKind.FACT_EXTRACTED;
  factId: string;
  callId: string;
  tool: string;
  args: Record<string, unknown>;
}

export interface CallStatusMessage {
  kind:
    | typeof CommandKind.CALL_STARTED
    | typeof CommandKind.CALL_ENDED
    | typeof CommandKind.CALL_FAILED;
  callId: string;
  reason?: string;
}

export interface StreamNote {
  id: string;
  body: Record<string, unknown>;
}
