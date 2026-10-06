import type { NextFunction, Request, Response } from "express";
import { callRoomName } from "@repo/core";
import { readCallAttempt } from "../reads/call-reader.ts";
import { createSession } from "../services/livekit-token.ts";

export async function startCallSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const callAttemptId = req.params.id as string;
    const attempt = await readCallAttempt(callAttemptId);
    if (!attempt) {
      res.status(404).json({ error: "call not found" });
      return;
    }
    const roomName = callRoomName(callAttemptId);
    const persona = attempt.persona.toLowerCase();
    const identity = `${persona}-${callAttemptId}`;
    const participantName =
      attempt.persona === "DRIVER" ? "Driver" : "Customer";
    const session = await createSession({
      roomName,
      identity,
      participantName,
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}
