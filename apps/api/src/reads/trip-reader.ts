import { prisma } from "@repo/db";
import type { Trip, TripPage, TripRow } from "@repo/types";

const TRIPS_PER_PAGE = 20;

const MOST_TRIPS_PER_PAGE = 100;

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

function allowedPageSize(requestedPageSize: number): number {
  if (!Number.isFinite(requestedPageSize)) return TRIPS_PER_PAGE;

  const wholeTrips = Math.floor(requestedPageSize);
  if (wholeTrips < 1) return 1;

  const cappedPageSize = Math.min(wholeTrips, MOST_TRIPS_PER_PAGE);
  return cappedPageSize;
}

export async function readTripPage(
  requestedPageSize: number,
  afterTripId: string | null,
): Promise<TripPage> {
  const pageSize = allowedPageSize(requestedPageSize);
  const rowsToFetch = pageSize + 1;
  const startAfter = afterTripId === null ? undefined : { id: afterTripId };

  const tripRows = await prisma.trip.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: rowsToFetch,
    cursor: startAfter,
    skip: startAfter ? 1 : 0,
  });

  const thereIsANextPage = tripRows.length > pageSize;
  const thisPage = thereIsANextPage ? tripRows.slice(0, pageSize) : tripRows;
  const lastTripOnPage = thisPage.at(-1);

  const trips = thisPage.map(toTrip);
  const nextCursor = thereIsANextPage && lastTripOnPage ? lastTripOnPage.id : null;

  return { trips, nextCursor };
}

export async function readTrip(id: string): Promise<Trip | undefined> {
  const row = await prisma.trip.findUnique({ where: { id } });
  const trip = row ? toTrip(row) : undefined;
  return trip;
}
