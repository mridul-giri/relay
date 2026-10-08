import { Router } from "express";
import {
  createCall,
  listCalls,
  startCallSession,
} from "../controllers/calls.ts";
import { requireMerchant } from "../middleware/require-merchant.ts";

export const callsRouter = Router();

callsRouter.post("/", requireMerchant, createCall);
callsRouter.get("/", requireMerchant, listCalls);

callsRouter.post("/:id/session", startCallSession);
