import { prisma } from "@repo/db";
import type {
  CallBrief,
  CallPersona,
  CallReason,
  Person,
  Slot,
  Trip,
  TripRow,
} from "@repo/types";

function toTrip(row: TripRow): Trip {
  const driver: Person = { name: row.driverName, phone: row.driverPhone };
  const customer: Person = {
    name: row.customerName,
    phone: row.customerPhone,
  };
  return {
    id: row.id,
    status: row.status,
    driver,
    customer,
    plannedEtaMinutes: row.plannedEtaMinutes,
    etaMinutes: row.etaMinutes,
    slot: row.slot,
    note: row.note,
    delayReason: row.delayReason,
    version: row.version,
  };
}

export async function readBrief(callAttemptId: string): Promise<CallBrief> {
  const attemptRow = await prisma.callAttempt.findUnique({
    where: { id: callAttemptId },
  });
  if (!attemptRow) {
    throw new Error(`no call attempt ${callAttemptId}`);
  }

  const tripRow = await prisma.trip.findUnique({
    where: { id: attemptRow.tripId },
  });
  if (!tripRow) {
    throw new Error(`no trip ${attemptRow.tripId}`);
  }

  const trip = toTrip(tripRow);
  const slots = attemptRow.slots as unknown as Slot[];
  const persona = attemptRow.persona as CallPersona;
  const reason = attemptRow.reason as CallReason;

  return {
    attempt: {
      id: attemptRow.id,
      tripId: attemptRow.tripId,
      persona,
      reason,
      status: attemptRow.status,
      slots,
    },
    trip,
  };
}
