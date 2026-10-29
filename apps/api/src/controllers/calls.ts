import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { prisma, Prisma, CallStatus } from "@repo/db";
import { callRequestSchema } from "../schemas/calls.ts";
import { readCallsForMerchant } from "../reads/call-reader.ts";
import { createSession } from "../services/livekit-token.ts";

const ROOM_PREFIX = "relay-call-";

function toOfferedSlots(times: string[]) {
  const slots = times.map((startsAt, index) => {
    const label = new Date(startsAt).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return { id: `slot-${index + 1}`, label, startsAt };
  });
  return slots;
}

export async function createCall(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const request = callRequestSchema.parse(req.body);
    const merchantId = res.locals.merchantId;

    const { slots, ...policy } = request.policy;
    const offeredSlots = policy.mayReschedule ? toOfferedSlots(slots) : [];

    const callId = randomUUID();
    const roomName = `${ROOM_PREFIX}${callId}`;

    await prisma.call.create({
      data: {
        id: callId,
        requestId: request.requestId,
        roomName,
        merchantId,
        orderRef: request.orderRef,
        status: CallStatus.QUEUED,
        customerName: request.customer.name,
        customerPhone: request.customer.phone,
        customerLanguage: request.customer.language,
        driverName: request.driver?.name ?? null,
        driverPhone: request.driver?.phone ?? null,
        productName: request.product?.name ?? null,
        productSku: request.product?.sku ?? null,
        etaMinutes: request.etaMinutes,
        message: request.message,
        policy,
        offeredSlots,
      },
    });

    res.status(201).json({ callId });
  } catch (err) {
    const isRepeatRequest =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002";
    if (isRepeatRequest) {
      const existing = await prisma.call.findUnique({
        where: { requestId: req.body.requestId },
      });
      if (existing) {
        res.status(200).json({ callId: existing.id });
        return;
      }
    }
    next(err);
  }
}

export async function listCalls(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const merchantId = res.locals.merchantId;
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
) {
  try {
    const callId = req.params.id as string;

    const call = await prisma.call.findUnique({ where: { id: callId } });
    if (!call) {
      res.status(404).json({ error: "call not found" });
      return;
    }

    const hasCallEnded = call.status === CallStatus.ENDED;
    if (hasCallEnded) {
      res.status(410).json({ error: "this call has ended" });
      return;
    }

    const session = await createSession({
      roomName: call.roomName,
      identity: `customer-${callId}`,
      participantName: "Customer",
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}
