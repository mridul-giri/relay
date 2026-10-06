import { config } from "@repo/config";
import {
  ackNote,
  createRedisConnection,
  readGroupNotes,
  readPendingNotes,
} from "@repo/redis";
import type { StreamNote } from "@repo/types";

type ReaderConnection = Awaited<ReturnType<typeof createRedisConnection>>;

type HandleNote = (note: StreamNote) => Promise<void>;

export const ENGINE_GROUP = "engine";
const ENGINE_NAME = "engine-1";

const READ_COUNT = 10;
const BLOCK_MILLISECONDS = 5000;

const RECOVER_COUNT = 100;

export async function readCommands(
  reader: ReaderConnection,
  handleNote: HandleNote,
): Promise<void> {
  while (true) {
    const notes = await readGroupNotes(
      reader,
      config.COMMANDS_STREAM,
      ENGINE_GROUP,
      ENGINE_NAME,
      READ_COUNT,
      BLOCK_MILLISECONDS,
    );

    for (const note of notes) {
      try {
        await handleAndAck(handleNote, note);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[engine] could not handle note: ${message}`);
      }
    }
  }
}

export async function recoverPending(
  reader: ReaderConnection,
  handleNote: HandleNote,
): Promise<void> {
  const notes = await readPendingNotes(
    reader,
    config.COMMANDS_STREAM,
    ENGINE_GROUP,
    ENGINE_NAME,
    RECOVER_COUNT,
  );
  for (const note of notes) {
    try {
      await handleAndAck(handleNote, note);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[engine] could not recover note: ${message}`);
    }
  }
  if (notes.length > 0) {
    console.log(`[engine] replayed ${notes.length} pending notes`);
  }
}

async function handleAndAck(
  handleNote: HandleNote,
  note: StreamNote,
): Promise<void> {
  await handleNote(note);
  await ackNote(config.COMMANDS_STREAM, ENGINE_GROUP, note.id);
}
