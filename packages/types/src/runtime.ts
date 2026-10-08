export interface StartCall {
  callId: string;
  roomName: string;
}

export interface VoiceRuntime {
  startCall(call: StartCall): Promise<void>;
}
