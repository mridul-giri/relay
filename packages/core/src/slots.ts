import type { Slot, Trip } from "@repo/types";

const SLOT_COUNT = 3;

const SLOT_STEP_MINUTES = 15;

function formatLabel(date: Date): string {
  const label = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return label;
}

export function generateSlots(trip: Trip, now: number): Slot[] {
  const base = new Date(now);
  base.setSeconds(0, 0);

  const minutesNow = base.getMinutes();
  const minutesPastQuarter = minutesNow % SLOT_STEP_MINUTES;
  const untilNextQuarter =
    (SLOT_STEP_MINUTES - minutesPastQuarter) % SLOT_STEP_MINUTES;
  const minutesToNextQuarter = minutesNow + untilNextQuarter;
  base.setMinutes(minutesToNextQuarter);

  const versionOffset = trip.version % SLOT_STEP_MINUTES;

  const slots: Slot[] = [];
  for (let index = 0; index < SLOT_COUNT; index += 1) {
    const baseTime = base.getTime();
    const offsetMilliseconds =
      (versionOffset + index * SLOT_STEP_MINUTES) * 60 * 1000;
    const start = new Date(baseTime + offsetMilliseconds);
    const label = formatLabel(start);
    const startsAt = start.toISOString();
    slots.push({
      id: `slot-${index + 1}`,
      label,
      startsAt,
    });
  }
  return slots;
}
