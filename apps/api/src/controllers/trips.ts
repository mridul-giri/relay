import type { Request, Response } from "express";
import { readTripPage, readTrip } from "../reads/trip-reader.ts";
import { readCallHistory } from "../reads/call-reader.ts";

export async function listTrips(req: Request, res: Response) {
  const requestedPageSize = Number(req.query.limit);
  const afterTripId =
    typeof req.query.cursor === "string" && req.query.cursor !== ""
      ? req.query.cursor
      : null;
  const tripPage = await readTripPage(requestedPageSize, afterTripId);
  res.json(tripPage);
}

export async function getTrip(req: Request, res: Response) {
  const id = req.params.id as string;
  if (!id) {
    res.status(404).json({ error: "trip not found" });
    return;
  }
  const trip = await readTrip(id);
  if (!trip) {
    res.status(404).json({ error: "trip not found" });
    return;
  }
  res.json({ trip });
}

export async function listTripCalls(req: Request, res: Response) {
  const tripId = req.params.id as string;
  const callHistory = await readCallHistory(tripId);
  res.json(callHistory);
}
