import type { IncomingEvent, StreamNote } from "@repo/types";
import type { TripEngine } from "../trips/trip-engine.ts";
import type { CallDispatcher } from "../calls/dispatcher.ts";

export async function handleTripEventNote(
  note: StreamNote,
  engine: TripEngine,
  dispatcher: CallDispatcher,
): Promise<void> {
  const event = note.body as IncomingEvent;
  const result = await engine.handleEvent(event);

  if (result.intent && result.sourceEventId) {
    await dispatcher.placeCall(result.intent, result.sourceEventId);
  }

  console.log(
    `[engine] tripId=${result.trip.id} status=${result.trip.status} version=${result.trip.version}`,
  );
}
