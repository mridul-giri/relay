import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";
import { CommandKind } from "@repo/types";
import type { CallStatusMessage } from "@repo/types";

export async function publishCallStarted(callId: string): Promise<void> {
  const message: CallStatusMessage = {
    kind: CommandKind.CALL_STARTED,
    callId,
  };
  await publishToStream(config.COMMANDS_STREAM, message);
}

export async function publishCallEnded(callId: string): Promise<void> {
  const message: CallStatusMessage = {
    kind: CommandKind.CALL_ENDED,
    callId,
  };
  await publishToStream(config.COMMANDS_STREAM, message);
}

export async function publishCallFailed(
  callId: string,
  reason: string,
): Promise<void> {
  const message: CallStatusMessage = {
    kind: CommandKind.CALL_FAILED,
    callId,
    reason,
  };
  await publishToStream(config.COMMANDS_STREAM, message);
}
