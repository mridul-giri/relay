import axios from "axios";

const API = process.env.API_URL ?? "http://localhost:3001";

const PAUSE_MILLISECONDS = 3000;

const tripId = crypto.randomUUID();

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function post(type: string, payload: Record<string, unknown>) {
  const eventId = crypto.randomUUID();
  const occurredAt = new Date().toISOString();
  const { status } = await axios.post(`${API}/events`, {
    eventId,
    tripId,
    type,
    payload,
    occurredAt,
  });
  console.log(`[simulate] ${type} http=${status}`);
}

console.log(`[simulate] tripId=${tripId}`);

await post("TRIP_CREATED", {
  driver: { name: "Marcus", phone: "+10000000001" },
  customer: { name: "Priya", phone: "+10000000002" },
  etaMinutes: 60,
});

await wait(PAUSE_MILLISECONDS);

await post("DRIVER_EN_ROUTE", {});

await wait(PAUSE_MILLISECONDS);

await post("ETA_CHANGED", {
  etaMinutes: 100,
  reason: "heavy traffic on the ring road",
});

console.log("[simulate] done: the delay event should have placed a call");
