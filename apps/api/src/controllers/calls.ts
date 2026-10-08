import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { callRoomName, cleanCallRequest } from "@repo/core";
import { config } from "@repo/config";
import { publishToStream } from "@repo/redis";
import { CommandKind } from "@repo/types";
import type { CallRequestMessage, IncomingCallRequest } from "@repo/types";
import { readCall, readCallsForMerchant } from "../reads/call-reader.ts";
import { createSession } from "../services/livekit-token.ts";

export async function createCall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let request;
  try {
    request = cleanCallRequest(req.body as IncomingCallRequest);
  } catch (err) {
    next(err);
    return;
  }

  const merchantId = res.locals.merchantId as string;
  const callId = randomUUID();
  const message: CallRequestMessage = {
    kind: CommandKind.CALL_REQUEST,
    callId,
    merchantId,
    request,
  };

  try {
    await publishToStream(config.COMMANDS_STREAM, message);
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    console.error(`[api:calls] could not accept call: ${text}`);
    res.status(503).json({ error: "the command stream is unavailable" });
    return;
  }

  console.log(`[api:calls] accepted callId=${callId} merchantId=${merchantId}`);
  res.status(202).json({ callId });
}

export async function listCalls(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const merchantId = res.locals.merchantId as string;
    const calls = await readCallsForMerchant(merchantId);
    res.json({ calls });
  } catch (err) {
    next(err);
  }
}

export async function startCallSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const callId = req.params.id as string;

    const call = await readCall(callId);
    if (!call) {
      res.status(404).json({ error: "call not found" });
      return;
    }

    const roomName = callRoomName(callId);
    const identity = `customer-${callId}`;
    const session = await createSession({
      roomName,
      identity,
      participantName: "Customer",
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}
