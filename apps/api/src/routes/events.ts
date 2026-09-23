import { Router } from "express";
import { eventsController } from "../controllers/events.ts";

export const eventsRouter = Router();

eventsRouter.post("/events", eventsController);
