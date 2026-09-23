import type { NextFunction, Request, Response } from "express";
import { handleEvent } from "../services/engine.ts";

export async function eventsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = handleEvent(req.body);
    console.log(
      `[api:events] event.handled tripId=${result.trip.id} status=${result.trip.status} version=${result.trip.version} intent=${result.intent?.reason ?? "none"}`,
    );
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}
