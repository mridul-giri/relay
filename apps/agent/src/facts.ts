import { randomUUID } from "node:crypto";
import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";
import { CommandKind, ToolName } from "@repo/types";
import type { FactMessage } from "@repo/types";

async function recordFact(
  callId: string,
  tool: ToolName,
  args: Record<string, unknown>,
): Promise<void> {
  const factId = randomUUID();
  const fact: FactMessage = {
    kind: CommandKind.FACT_EXTRACTED,
    factId,
    callId,
    tool,
    args,
  };
  await publishToStream(config.COMMANDS_STREAM, fact);
}

export async function recordSlotChoice(
  callId: string,
  slotId: string,
): Promise<void> {
  await recordFact(callId, ToolName.SELECT_SLOT, { slotId });
}

export async function recordCancel(
  callId: string,
  reason?: string,
): Promise<void> {
  await recordFact(callId, ToolName.CANCEL, { reason });
}

export async function recordHumanRequest(
  callId: string,
  reason?: string,
): Promise<void> {
  await recordFact(callId, ToolName.REQUEST_HUMAN, { reason });
}
