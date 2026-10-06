import type { createClient } from "redis";
import type { StreamNote } from "@repo/types";
import { publisher } from "./client.ts";

type RedisConnection = ReturnType<typeof createClient>;

function parseReply(reply: unknown): StreamNote[] {
  if (!reply) return [];
  const notes: StreamNote[] = [];
  for (const stream of reply as {
    messages: { id: string; message: { [key: string]: string | undefined } }[];
  }[]) {
    for (const entry of stream.messages) {
      const raw = entry.message.data;
      const body = raw ? JSON.parse(raw) : {};
      notes.push({ id: entry.id, body });
    }
  }
  return notes;
}

const STREAM_MAX_LENGTH = 1000;

export const publishToStream = async (
  streamKey: string,
  body: unknown,
): Promise<void> => {
  const data = JSON.stringify(body);
  await publisher.xAdd(
    streamKey,
    "*",
    { data },
    {
      TRIM: {
        strategy: "MAXLEN",
        strategyModifier: "~",
        threshold: STREAM_MAX_LENGTH,
      },
    },
  );
};

export const ensureConsumerGroup = async (
  streamKey: string,
  group: string,
): Promise<void> => {
  try {
    await publisher.xGroupCreate(streamKey, group, "0", { MKSTREAM: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isBusyGroup = message.includes("BUSYGROUP");
    if (!isBusyGroup) throw err;
  }
};

export const readGroupNotes = async (
  reader: RedisConnection,
  streamKey: string,
  group: string,
  consumer: string,
  count: number,
  blockMilliseconds: number,
): Promise<StreamNote[]> => {
  const reply = await reader.xReadGroup(
    group,
    consumer,
    [{ key: streamKey, id: ">" }],
    { COUNT: count, BLOCK: blockMilliseconds },
  );
  const notes = parseReply(reply);
  return notes;
};

export const readPendingNotes = async (
  reader: RedisConnection,
  streamKey: string,
  group: string,
  consumer: string,
  count: number,
): Promise<StreamNote[]> => {
  const reply = await reader.xReadGroup(
    group,
    consumer,
    [{ key: streamKey, id: "0" }],
    { COUNT: count },
  );
  const notes = parseReply(reply);
  return notes;
};

export const ackNote = async (
  streamKey: string,
  group: string,
  id: string,
): Promise<void> => {
  await publisher.xAck(streamKey, group, id);
};
