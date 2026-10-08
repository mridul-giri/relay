import { config } from "@repo/config";
import {
  connectRedis,
  createRedisConnection,
  ensureConsumerGroup,
} from "@repo/redis";
import { CommandKind } from "@repo/types";
import type { StreamNote, VoiceRuntime } from "@repo/types";
import { CallStore } from "./calls/call-store.ts";
import { CallManager } from "./calls/call-manager.ts";
import { CallFacts } from "./calls/call-facts.ts";
import { LiveKitVoiceRuntime } from "./calls/voice/livekit-runtime.ts";
import {
  ENGINE_GROUP,
  readCommands,
  recoverPending,
} from "./utils/read-commands.ts";
import { failUnansweredCalls } from "./utils/fail-unanswered-calls.ts";
import { handleCallRequestNote } from "./utils/handle-call-request-note.ts";
import { handleFactNote } from "./utils/handle-fact-note.ts";
import { handleCallStartedNote } from "./utils/handle-call-started-note.ts";
import { handleCallEndedNote } from "./utils/handle-call-ended-note.ts";

const RING_SWEEP_MILLISECONDS = 30 * 1000;

await connectRedis();
const commandsReader = await createRedisConnection();
await ensureConsumerGroup(config.COMMANDS_STREAM, ENGINE_GROUP);

const calls = new CallStore();
const runtime: VoiceRuntime = new LiveKitVoiceRuntime();
const manager = new CallManager(runtime, calls);
const callFacts = new CallFacts(calls);

async function handleNote(note: StreamNote): Promise<void> {
  const kind = note.body.kind;

  if (kind === CommandKind.CALL_REQUEST) {
    await handleCallRequestNote(note, calls, manager);
    return;
  }
  if (kind === CommandKind.FACT_EXTRACTED) {
    await handleFactNote(note, callFacts);
    return;
  }
  if (kind === CommandKind.CALL_STARTED) {
    await handleCallStartedNote(note, calls);
    return;
  }
  if (kind === CommandKind.CALL_ENDED || kind === CommandKind.CALL_FAILED) {
    await handleCallEndedNote(note, calls);
    return;
  }

  console.error(`[engine] unknown note kind ${String(kind)}`);
}

await recoverPending(commandsReader, handleNote);

setInterval(() => {
  void failUnansweredCalls(calls);
}, RING_SWEEP_MILLISECONDS);

console.log(
  `engine is listening on ${config.COMMANDS_STREAM} (phone system: LiveKit)`,
);
void readCommands(commandsReader, handleNote);
