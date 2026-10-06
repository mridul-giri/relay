import { config } from "@repo/config";
import {
  connectRedis,
  createRedisConnection,
  ensureConsumerGroup,
} from "@repo/redis";
import { CommandKind } from "@repo/types";
import type { StreamNote, VoiceRuntime } from "@repo/types";
import { TripStore } from "./trips/trip-store.ts";
import { TripEngine } from "./trips/trip-engine.ts";
import { CallStore } from "./calls/call-store.ts";
import { LiveKitVoiceRuntime } from "./calls/voice/livekit-runtime.ts";
import { CallManager } from "./calls/call-manager.ts";
import { CallDispatcher } from "./calls/dispatcher.ts";
import { CallFacts } from "./calls/call-facts.ts";
import { ENGINE_GROUP, readCommands, recoverPending } from "./utils/read-commands.ts";
import { failUnansweredCalls } from "./utils/fail-unanswered-calls.ts";
import { handleTripEventNote } from "./utils/handle-trip-event-note.ts";
import { handleFactNote } from "./utils/handle-fact-note.ts";
import { handleCallStartedNote } from "./utils/handle-call-started-note.ts";
import { handleCallFailedNote } from "./utils/handle-call-failed-note.ts";

const RING_SWEEP_MILLISECONDS = 30 * 1000;

await connectRedis();
const commandsReader = await createRedisConnection();
await ensureConsumerGroup(config.COMMANDS_STREAM, ENGINE_GROUP);

const trips = new TripStore();
const calls = new CallStore();
const engine = new TripEngine(trips);
const runtime: VoiceRuntime = new LiveKitVoiceRuntime();
const callManager = new CallManager(runtime, trips, calls);
const dispatcher = new CallDispatcher(callManager, engine, trips, calls);
const callFacts = new CallFacts(engine, trips, calls);

async function handleNote(note: StreamNote): Promise<void> {
  const kind = note.body.kind;
  if (kind === CommandKind.FACT_EXTRACTED) {
    await handleFactNote(note, callFacts);
    return;
  }
  if (kind === CommandKind.CALL_STARTED) {
    await handleCallStartedNote(note, calls);
    return;
  }
  if (kind === CommandKind.CALL_FAILED) {
    await handleCallFailedNote(note, calls);
    return;
  }
  await handleTripEventNote(note, engine, dispatcher);
}

await recoverPending(commandsReader, handleNote);

setInterval(() => {
  void failUnansweredCalls(calls);
}, RING_SWEEP_MILLISECONDS);

console.log(
  `engine is listening on ${config.COMMANDS_STREAM} (phone system: LiveKit)`,
);
void readCommands(commandsReader, handleNote);
