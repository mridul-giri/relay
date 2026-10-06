import { config } from "@repo/config";
import type { StartCall, VoiceRuntime } from "@repo/types";
import { callRoomName } from "@repo/core";
import { RoomServiceClient } from "livekit-server-sdk";

const EMPTY_ROOM_TIMEOUT_SECONDS = 300;

export class LiveKitVoiceRuntime implements VoiceRuntime {
  private readonly rooms = new RoomServiceClient(
    config.LIVEKIT_URL,
    config.LIVEKIT_API_KEY,
    config.LIVEKIT_API_SECRET,
  );

  async startCall(call: StartCall): Promise<void> {
    const roomName = callRoomName(call.callAttemptId);
    await this.rooms.createRoom({
      name: roomName,
      emptyTimeout: EMPTY_ROOM_TIMEOUT_SECONDS,
    });
  }
}
