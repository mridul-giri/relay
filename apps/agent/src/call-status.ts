import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";
import { CommandKind } from "@repo/types";
import type { CallStatusMessage } from "@repo/types";

export async function publishCallStarted(callAttemptId: string): Promise<void> {
  const message: CallStatusMessage = {
    kind: CommandKind.CALL_STARTED,
    callAttemptId,
  };
  await publishToStream(config.COMMANDS_STREAM, message);
}

export async function publishCallFailed(
  callAttemptId: string,
  reason: string,
): Promise<void> {
  const message: CallStatusMessage = {
    kind: CommandKind.CALL_FAILED,
    callAttemptId,
    reason,
  };
  await publishToStream(config.COMMANDS_STREAM, message);
}
