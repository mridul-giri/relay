import { prisma } from "@repo/db";
import type { TranscriptTurn } from "@repo/types";

export function saveTranscript(turn: TranscriptTurn): void {
  const spokenAt = new Date(turn.spokenAt);
  void prisma.transcriptTurn
    .create({
      data: {
        callAttemptId: turn.callAttemptId,
        speaker: turn.speaker,
        text: turn.text,
        spokenAt,
      },
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[agent] could not save transcript: ${message}`);
    });
}
