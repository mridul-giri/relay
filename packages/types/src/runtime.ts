import type { CallPersona, CallReason } from "./call.ts";
import type { Slot } from "./slot.ts";
import type { Trip } from "./trip.ts";

export interface StartCall {
  callAttemptId: string;
  trip: Trip;
  persona: CallPersona;
  reason: CallReason;
  slots: Slot[];
}

export interface VoiceRuntime {
  startCall(call: StartCall): Promise<void>;
}
