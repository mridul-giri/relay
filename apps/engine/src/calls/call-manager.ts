import { callRoomName } from "@repo/core";
import type { VoiceRuntime } from "@repo/types";
import type { CallStore } from "./call-store.ts";

export class CallManager {
  constructor(
    private readonly runtime: VoiceRuntime,
    private readonly calls: CallStore,
  ) {}

  async placeCall(callId: string): Promise<void> {
    const call = await this.calls.getCall(callId);
    if (!call) {
      throw new Error(`no call ${callId}`);
    }

    await this.calls.setCallCalling(callId);

    const roomName = callRoomName(callId);
    await this.runtime.startCall({ callId, roomName });
  }
}
