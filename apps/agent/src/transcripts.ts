import { prisma } from "@repo/db";

export function saveTranscript(turn: {
  callId: string;
  speaker: "AGENT" | "CALLER";
  text: string;
  spokenAt: string;
}): void {
  const spokenAt = new Date(turn.spokenAt);

  void prisma.transcriptTurn
    .create({
      data: {
        callId: turn.callId,
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
