import type { Request, Response } from "express";
import { allTrips, getTrip as readTrip } from "../services/store.ts";

export function listTrips(req: Request, res: Response) {
  const trips = allTrips();
  res.json({ trips });
}

export function getTrip(req: Request, res: Response) {
  const id = req.params.id as string;
  if (!id) {
    res.status(404).json({ error: "trip not found" });
    return;
  }
  const trip = readTrip(id);
  if (!trip) {
    res.status(404).json({ error: "trip not found" });
    return;
  }
  res.json({ trip });
}
