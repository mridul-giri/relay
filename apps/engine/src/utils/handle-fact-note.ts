import type { FactMessage, StreamNote } from "@repo/types";
import type { CallFacts } from "../calls/call-facts.ts";

export async function handleFactNote(
  note: StreamNote,
  callFacts: CallFacts,
): Promise<void> {
  const fact = note.body as unknown as FactMessage;
  await callFacts.handleFact(fact);
  console.log(`[engine] fact call=${fact.callId} tool=${fact.tool}`);
}
