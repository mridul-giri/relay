import { Router } from "express";
import { listTrips, getTrip, listTripCalls } from "../controllers/trips.ts";

export const tripsRouter = Router();

tripsRouter.get("/", listTrips);
tripsRouter.get("/:id", getTrip);
tripsRouter.get("/:id/call-attempts", listTripCalls);
