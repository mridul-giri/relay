import type { Trip } from "@repo/core";

// TODO(build): It will be replace by the Postgres/Prisma

const trips = new Map<string, Trip>();

export function getTrip(id: string) {
  return trips.get(id);
}

export function allTrips() {
  return [...trips.values()];
}

export function insertTrip(trip: Trip): void {
  if (trips.has(trip.id)) {
    throw new Error(`trip ${trip.id} already exists`);
  }
  trips.set(trip.id, trip);
}

export function saveIfVersion(trip: Trip, expectedVersion: number): boolean {
  const current = trips.get(trip.id);
  if (!current) return false;
  if (current.version !== expectedVersion) return false;
  trips.set(trip.id, trip);
  return true;
}
