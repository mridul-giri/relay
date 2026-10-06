import { randomUUID } from "node:crypto";
import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";
import { CommandKind, ToolName } from "@repo/types";
import type { FactMessage } from "@repo/types";

export async function recordSlotChoice(
  callAttemptId: string,
  slotId: string,
): Promise<void> {
  const factId = randomUUID();
  const fact: FactMessage = {
    kind: CommandKind.FACT_EXTRACTED,
    factId,
    callAttemptId,
    tool: ToolName.SELECT_SLOT,
    args: { slotId },
  };
  await publishToStream(config.COMMANDS_STREAM, fact);
}
