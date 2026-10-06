import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  Agent,
  AgentSession,
  AgentSessionEventTypes,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  tool,
  type JobContext,
} from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";
import { ToolName } from "@repo/types";
import { callAttemptIdFromRoomName } from "@repo/core";
import { config } from "@repo/config";
import { connectRedis } from "@repo/redis";
import { missingVoiceSettings } from "./settings.ts";
import { readBrief } from "./brief.ts";
import { buildInstructions } from "./persona.ts";
import { recordSlotChoice } from "./facts.ts";
import { saveTranscript } from "./transcripts.ts";
import { publishCallFailed, publishCallStarted } from "./call-status.ts";

const missing = missingVoiceSettings();
if (missing.length > 0) {
  const missingList = missing.join(", ");
  console.warn(
    `[agent] not starting: missing voice env vars (${missingList}). ` +
      "The caller cannot start until these are set.",
  );
  process.exit(0);
}

let redisReady: Promise<void> | null = null;
function ensureRedis(): Promise<void> {
  redisReady ??= connectRedis();
  return redisReady;
}

export default defineAgent({
  prewarm: async () => {
    await silero.VAD.load();
    await ensureRedis();
  },

  entry: async (ctx: JobContext) => {
    await ctx.connect();
    await ensureRedis();

    const roomName = ctx.room.name ?? "";
    const callAttemptId = callAttemptIdFromRoomName(roomName);
    if (!callAttemptId) {
      console.error(`[agent] ignoring non-relay room: ${roomName}`);
      return;
    }

    let decisionRecorded = false;

    try {
      const brief = await readBrief(callAttemptId);
      const instructions = buildInstructions(brief);
      console.log(
        `[agent] call.start call=${callAttemptId} persona=${brief.attempt.persona}`,
      );

      const vad = await silero.VAD.load();
      const stt = new inference.STT({ model: "deepgram/nova-3" });
      const tts = new inference.TTS({
        model: "cartesia/sonic-3",
        voice: config.TTS_VOICE,
      });
      const llm = new inference.LLM({ model: "openai/gpt-4o-mini" });

      const selectSlot = tool({
        name: ToolName.SELECT_SLOT,
        description:
          "Propose one of the offered reschedule times, using the id of the time the person chose.",
        parameters: z.object({
          slotId: z.string().describe("One of the offered slot ids"),
        }),
        execute: async (args: { slotId: string }) => {
          await recordSlotChoice(callAttemptId, args.slotId);
          decisionRecorded = true;
          return "The choice is recorded. Tell the person they will get a confirmation.";
        },
      });

      const agent = Agent.create({ instructions, tools: [selectSlot] });

      const session = new AgentSession({
        vad,
        stt,
        tts,
        llm,
        turnHandling: { interruption: { minWords: 2 } },
      });

      session.on(AgentSessionEventTypes.UserInputTranscribed, (ev) => {
        if (!ev.isFinal) return;
        const spokenAt = new Date().toISOString();
        saveTranscript({
          callAttemptId,
          speaker: "CALLER",
          text: ev.transcript,
          spokenAt,
        });
      });
      session.on(AgentSessionEventTypes.ConversationItemAdded, (ev) => {
        const item = ev.item;
        if (item.type !== "message") return;
        if (item.role !== "assistant") return;
        const spokenAt = new Date().toISOString();
        saveTranscript({
          callAttemptId,
          speaker: "AGENT",
          text: item.textContent ?? "",
          spokenAt,
        });
      });

      session.on(AgentSessionEventTypes.Close, () => {
        if (decisionRecorded) return;
        void publishCallFailed(callAttemptId, "call ended without a decision");
      });

      console.log(
        `[agent] waiting for the person to join call=${callAttemptId}`,
      );
      await ctx.waitForParticipant();

      await session.start({ agent, room: ctx.room });
      console.log(`[agent] session.started call=${callAttemptId}`);

      await publishCallStarted(callAttemptId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[agent] call.failed call=${callAttemptId} ${message}`);
      await publishCallFailed(callAttemptId, message);
    }
  },
});

const agentPath = fileURLToPath(import.meta.url);
const serverOptions = new ServerOptions({ agent: agentPath });
cli.runApp(serverOptions);
