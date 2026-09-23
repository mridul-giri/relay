import axios from "axios";

const API = process.env.API_URL ?? "http://localhost:3001";

const tripId = crypto.randomUUID();

async function post(type: string, payload: Record<string, unknown>) {
  const { status } = await axios.post(`${API}/events`, {
    eventId: crypto.randomUUID(),
    tripId,
    type,
    payload,
    occurredAt: new Date().toISOString(),
  });
  console.log(`[seed] ${type} http=${status}`);
}

await post("TRIP_CREATED", {
  driver: { name: "Marcus", phone: "+10000000001" },
  customer: { name: "Priya", phone: "+10000000002" },
  etaMinutes: 60,
});

await post("DRIVER_EN_ROUTE", {});

await post("ETA_CHANGED", { etaMinutes: 100 });
