import type { NextFunction, Request, Response } from "express";
import { cleanEvent } from "@repo/core";
import type { IncomingEvent } from "@repo/types";
import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";

export async function acceptEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let event;
  try {
    event = cleanEvent(req.body as IncomingEvent);
  } catch (err) {
    next(err);
    return;
  }

  try {
    await publishToStream(config.COMMANDS_STREAM, event);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[api:events] could not accept event: ${message}`);
    res.status(503).json({ error: "the command stream is unavailable" });
    return;
  }

  console.log(
    `[api:events] accepted eventId=${event.eventId} tripId=${event.tripId}`,
  );
  res.status(202).json({ eventId: event.eventId });
}
