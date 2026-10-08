import axios from "axios";
import type { AuthResult } from "@repo/types";

const API = process.env.API_URL ?? "http://localhost:3001";

const EMAIL = "demo@relay.local";
const PASSWORD = "demopassword";
const NAME = "Demo Merchant";

async function getToken(): Promise<string> {
  try {
    const response = await axios.post<AuthResult>(`${API}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    return response.data.token;
  } catch {
    const response = await axios.post<AuthResult>(`${API}/auth/signup`, {
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
    });
    return response.data.token;
  }
}

function dayFromNow(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const day = date.toISOString().slice(0, 10);
  return day;
}

const body = {
  requestId: crypto.randomUUID(),
  orderRef: "SHOP-94021",
  customer: { name: "Mridul", phone: "+10000000002", language: "en" },
  driver: { name: "Marcus", phone: "+10000000001" },
  product: { name: "Fridge", sku: "F-900" },
  etaMinutes: 40,
  message: "Marcus is stuck in heavy traffic on the ring road.",
  policy: {
    mayCancel: true,
    mayReschedule: true,
    rescheduleWindow: {
      days: [dayFromNow(1), dayFromNow(2), dayFromNow(3)],
      from: "09:00",
      to: "18:00",
    },
  },
};

const token = await getToken();
const response = await axios.post(`${API}/calls`, body, {
  headers: { Authorization: `Bearer ${token}` },
});

console.log(`[start-call] http=${response.status}`, response.data);
console.log(`[start-call] answer it at /call/${response.data.callId}`);
