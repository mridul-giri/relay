import { Router } from "express";
import { getTrip, listTrips } from "../controllers/trips.ts";

export const tripsRouter = Router();

tripsRouter.get("/trips", listTrips);
tripsRouter.get("/trips/:id", getTrip);
