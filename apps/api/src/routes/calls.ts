import { Router } from "express";
import { startCallSession } from "../controllers/calls.ts";

export const callsRouter = Router();

callsRouter.post("/:id/session", startCallSession);
