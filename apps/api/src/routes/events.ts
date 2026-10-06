import { Router } from "express";
import { acceptEvent } from "../controllers/events.ts";

export const eventsRouter = Router();

eventsRouter.post("/", acceptEvent);
