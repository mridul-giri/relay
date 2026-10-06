import { prisma } from "@repo/db";
import type {
  CallAttemptHistory,
  CallAttemptRow,
  CallAttemptView,
  ToolCallView,
  TranscriptTurn,
} from "@repo/types";

function toAttemptView(row: CallAttemptRow): CallAttemptView {
  const createdAt = row.createdAt.toISOString();
  const endedAt = row.endedAt ? row.endedAt.toISOString() : null;
  return {
    id: row.id,
    tripId: row.tripId,
    persona: row.persona,
    reason: row.reason,
    ruleId: row.ruleId,
    status: row.status,
    slots: row.slots,
    createdAt,
    endedAt,
  };
}

export async function readCallAttempt(
  callAttemptId: string,
): Promise<CallAttemptView | undefined> {
  const row = await prisma.callAttempt.findUnique({
    where: { id: callAttemptId },
  });
  const callAttemptView = row ? toAttemptView(row) : undefined;
  return callAttemptView;
}

export async function readCallHistory(tripId: string) {
  const attempts = await prisma.callAttempt.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
  });
  const escalations = await prisma.escalation.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
  });

  const attemptIds = attempts.map((attempt) => attempt.id);
  const transcriptRows =
    attemptIds.length === 0
      ? []
      : await prisma.transcriptTurn.findMany({
          where: { callAttemptId: { in: attemptIds } },
          orderBy: { spokenAt: "asc" },
        });
  const toolCallRows =
    attemptIds.length === 0
      ? []
      : await prisma.toolCall.findMany({
          where: { callAttemptId: { in: attemptIds } },
          orderBy: { createdAt: "asc" },
        });

  const transcriptsByAttempt = new Map<string, TranscriptTurn[]>();
  for (const row of transcriptRows) {
    const turn: TranscriptTurn = {
      callAttemptId: row.callAttemptId,
      speaker: row.speaker,
      text: row.text,
      spokenAt: row.spokenAt.toISOString(),
    };
    const turns = transcriptsByAttempt.get(row.callAttemptId) ?? [];
    turns.push(turn);
    transcriptsByAttempt.set(row.callAttemptId, turns);
  }

  const toolCallsByAttempt = new Map<string, ToolCallView[]>();
  for (const row of toolCallRows) {
    const view: ToolCallView = {
      id: row.id,
      tool: row.tool,
      args: row.args as Record<string, unknown>,
      accepted: row.accepted,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    };
    const calls = toolCallsByAttempt.get(row.callAttemptId) ?? [];
    calls.push(view);
    toolCallsByAttempt.set(row.callAttemptId, calls);
  }

  const attemptViews: CallAttemptHistory[] = attempts.map((attempt) => {
    const view = toAttemptView(attempt);
    return {
      ...view,
      transcripts: transcriptsByAttempt.get(attempt.id) ?? [],
      toolCalls: toolCallsByAttempt.get(attempt.id) ?? [],
    };
  });

  const escalationViews = escalations.map((escalation) => {
    const createdAt = escalation.createdAt.toISOString();
    return {
      id: escalation.id,
      tripId: escalation.tripId,
      ruleId: escalation.ruleId,
      reason: escalation.reason,
      createdAt,
    };
  });

  return { attempts: attemptViews, escalations: escalationViews };
}
