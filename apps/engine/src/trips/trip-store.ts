import { prisma, Prisma, type TransactionClient } from "@repo/db";
import type { AuditEntry, Trip, TripEventRecord, TripRow } from "@repo/types";

function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    status: row.status,
    driver: { name: row.driverName, phone: row.driverPhone },
    customer: { name: row.customerName, phone: row.customerPhone },
    plannedEtaMinutes: row.plannedEtaMinutes,
    etaMinutes: row.etaMinutes,
    slot: row.slot,
    note: row.note,
    delayReason: row.delayReason,
    version: row.version,
  };
}

function toRow(trip: Trip) {
  return {
    id: trip.id,
    status: trip.status,
    driverName: trip.driver.name,
    driverPhone: trip.driver.phone,
    customerName: trip.customer.name,
    customerPhone: trip.customer.phone,
    plannedEtaMinutes: trip.plannedEtaMinutes,
    etaMinutes: trip.etaMinutes,
    slot: trip.slot,
    note: trip.note,
    delayReason: trip.delayReason,
    version: trip.version,
  };
}

export class TripStore {
  async get(
    id: string,
    db: TransactionClient = prisma,
  ): Promise<Trip | undefined> {
    const row = await db.trip.findUnique({ where: { id } });
    const trip = row ? toTrip(row) : undefined;
    return trip;
  }

  async all(): Promise<Trip[]> {
    const rows = await prisma.trip.findMany({ orderBy: { createdAt: "asc" } });
    const trips = rows.map(toTrip);
    return trips;
  }

  async insert(trip: Trip, db: TransactionClient = prisma): Promise<void> {
    const row = toRow(trip);
    await db.trip.create({ data: row });
  }

  async saveIfVersion(
    trip: Trip,
    expectedVersion: number,
    db: TransactionClient = prisma,
  ): Promise<boolean> {
    const result = await db.trip.updateMany({
      where: { id: trip.id, version: expectedVersion },
      data: {
        status: trip.status,
        driverName: trip.driver.name,
        driverPhone: trip.driver.phone,
        customerName: trip.customer.name,
        customerPhone: trip.customer.phone,
        plannedEtaMinutes: trip.plannedEtaMinutes,
        etaMinutes: trip.etaMinutes,
        slot: trip.slot,
        note: trip.note,
        delayReason: trip.delayReason,
        version: trip.version,
      },
    });
    return result.count === 1;
  }

  async findEvent(eventId: string, db: TransactionClient = prisma) {
    const event = await db.tripEvent.findUnique({ where: { eventId } });
    return event;
  }

  async insertEvent(
    db: TransactionClient,
    event: TripEventRecord,
  ): Promise<void> {
    const occurredAt = new Date(event.occurredAt);
    await db.tripEvent.create({
      data: {
        eventId: event.eventId,
        tripId: event.tripId,
        type: event.type,
        payload: event.payload as Prisma.InputJsonValue,
        occurredAt,
        versionBefore: event.versionBefore,
        versionAfter: event.versionAfter,
      },
    });
  }

  async insertAudit(
    db: TransactionClient,
    tripId: string,
    entries: AuditEntry[],
  ): Promise<void> {
    if (entries.length === 0) return;
    const auditRows = entries.map((entry) => ({
      tripId,
      type: entry.type,
      message: entry.message,
      data:
        entry.data === undefined
          ? undefined
          : (entry.data as Prisma.InputJsonValue),
    }));
    await db.auditLog.createMany({ data: auditRows });
  }
}
