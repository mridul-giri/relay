export const CommandKind = {
  FACT_EXTRACTED: "fact.extracted",
  CALL_STARTED: "call.started",
  CALL_FAILED: "call.failed",
} as const;

export type CommandKind = (typeof CommandKind)[keyof typeof CommandKind];

export interface FactMessage {
  kind: typeof CommandKind.FACT_EXTRACTED;
  factId: string;
  callAttemptId: string;
  tool: string;
  args: Record<string, unknown>;
}

export interface CallStatusMessage {
  kind: typeof CommandKind.CALL_STARTED | typeof CommandKind.CALL_FAILED;
  callAttemptId: string;
  reason?: string;
}

export interface StreamNote {
  id: string;
  body: Record<string, unknown>;
}
