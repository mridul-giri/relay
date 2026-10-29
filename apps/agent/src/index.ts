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
import { config } from "./config.ts";
import { missingVoiceSettings } from "./settings.ts";
import { readCallForRoom } from "./call-context.ts";
import { buildInstructions } from "./instructions.ts";
import { saveTranscript } from "./transcripts.ts";
import {
  saveCallEnded,
  saveCallFailed,
  saveCallStarted,
  saveCancelRequest,
  saveHumanRequest,
  saveSlotChoice,
} from "./call-results.ts";

const missing = missingVoiceSettings();
if (missing.length > 0) {
  const missingList = missing.join(", ");
  console.warn(
    `[agent] not starting: missing voice env vars (${missingList}). ` +
      "The caller cannot start until these are set.",
  );
  process.exit(0);
}

export default defineAgent({
  prewarm: async () => {
    await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const roomName = ctx.room.name ?? "";
    const call = await readCallForRoom(roomName);
    if (!call) {
      console.error(`[agent] ignoring room with no Relay call: ${roomName}`);
      return;
    }
    const callId = call.id;

    try {
      const instructions = buildInstructions(call);
      console.log(`[agent] call.start call=${callId}`);

      const vad = await silero.VAD.load();
      const stt = new inference.STT({ model: "deepgram/nova-3" });
      const tts = new inference.TTS({
        model: "cartesia/sonic-3",
        voice: config.TTS_VOICE,
      });
      const llm = new inference.LLM({ model: "openai/gpt-4o-mini" });

      const selectSlot = tool({
        name: "select_slot",
        description:
          "Propose one of the offered reschedule times, using the id of the time the person chose.",
        parameters: z.object({
          slotId: z.string().describe("One of the offered slot ids"),
        }),
        execute: async (args: { slotId: string }) => {
          const reply = await saveSlotChoice(call, args.slotId);
          return reply;
        },
      });

      const cancel = tool({
        name: "cancel",
        description: "Record that the person wants to cancel the delivery.",
        parameters: z.object({
          reason: z.string().optional().describe("Why they want to cancel"),
        }),
        execute: async () => {
          const reply = await saveCancelRequest(call);
          return reply;
        },
      });

      const requestHuman = tool({
        name: "request_human",
        description:
          "Record that the person wants to speak to a person instead.",
        parameters: z.object({
          reason: z.string().optional().describe("Why they want a person"),
        }),
        execute: async () => {
          const reply = await saveHumanRequest(call);
          return reply;
        },
      });

      const agent = Agent.create({
        instructions,
        tools: [selectSlot, cancel, requestHuman],
      });

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
          callId,
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
          callId,
          speaker: "AGENT",
          text: item.textContent ?? "",
          spokenAt,
        });
      });

      session.on(AgentSessionEventTypes.Close, () => {
        void saveCallEnded(callId);
      });

      console.log(`[agent] waiting for the person to join call=${callId}`);
      await ctx.waitForParticipant();

      await session.start({ agent, room: ctx.room });
      console.log(`[agent] session.started call=${callId}`);

      await saveCallStarted(callId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[agent] call.failed call=${callId} ${message}`);
      await saveCallFailed(callId);
    }
  },
});

const agentPath = fileURLToPath(import.meta.url);
const serverOptions = new ServerOptions({ agent: agentPath });
cli.runApp(serverOptions);
