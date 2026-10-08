import type { RescheduleWindow, Slot } from "@repo/types";

const SLOT_COUNT = 3;

const SLOT_STEP_MINUTES = 30;

function formatLabel(date: Date): string {
  const label = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return label;
}

function timeToMinutes(time: string): number {
  const [hoursText, minutesText] = time.split(":");
  const minutesPastMidnight = Number(hoursText) * 60 + Number(minutesText);
  return minutesPastMidnight;
}

function candidateTimes(window: RescheduleWindow): Date[] {
  const fromMinutes = timeToMinutes(window.from);
  const toMinutes = timeToMinutes(window.to);

  const times: Date[] = [];
  for (const day of window.days) {
    for (
      let minute = fromMinutes;
      minute <= toMinutes;
      minute += SLOT_STEP_MINUTES
    ) {
      const hours = Math.floor(minute / 60);
      const minutes = minute % 60;
      const hoursText = String(hours).padStart(2, "0");
      const minutesText = String(minutes).padStart(2, "0");
      const date = new Date(`${day}T${hoursText}:${minutesText}:00`);
      times.push(date);
    }
  }
  return times;
}

export function generateSlots(window: RescheduleWindow, now: number): Slot[] {
  const allowed = candidateTimes(window);
  const future = allowed.filter((date) => date.getTime() > now);
  if (future.length === 0) return [];

  const wanted = Math.min(SLOT_COUNT, future.length);
  const chosen: Date[] = [];
  for (let index = 0; index < wanted; index += 1) {
    const position = Math.floor((index * future.length) / wanted);
    const time = future[position];
    if (time === undefined) continue;
    chosen.push(time);
  }

  const slots = chosen.map((date, index) => {
    const slot = {
      id: `slot-${index + 1}`,
      label: formatLabel(date),
      startsAt: date.toISOString(),
    };
    return slot;
  });
  return slots;
}
