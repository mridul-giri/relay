"use client";

import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { errorMessage } from "../lib/errors";

function dayFromNow(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const DEFAULT_DAYS = [dayFromNow(1), dayFromNow(2), dayFromNow(3)];

interface CallFormProps {
  onClose: () => void;
}

export function CallForm({ onClose }: CallFormProps) {
  const [requestId] = useState(() => crypto.randomUUID());
  const [orderRef] = useState(
    () => `SHOP-${Math.floor(Math.random() * 90000) + 10000}`,
  );
  const [customerName, setCustomerName] = useState("Priya");
  const [customerPhone, setCustomerPhone] = useState("+10000000002");
  const [language, setLanguage] = useState("en");
  const [driverName, setDriverName] = useState("Marcus");
  const [driverPhone, setDriverPhone] = useState("+10000000001");
  const [productName, setProductName] = useState("Fridge");
  const [productSku, setProductSku] = useState("F-900");
  const [etaMinutes, setEtaMinutes] = useState(40);
  const [message, setMessage] = useState(
    "Marcus is stuck in heavy traffic on the ring road.",
  );
  const [mayCancel, setMayCancel] = useState(true);
  const [mayReschedule, setMayReschedule] = useState(true);
  const [daysText, setDaysText] = useState(DEFAULT_DAYS.join(", "));
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("18:00");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const days = daysText
      .split(",")
      .map((day) => day.trim())
      .filter((day) => day !== "");

    const body = {
      requestId,
      orderRef,
      customer: { name: customerName, phone: customerPhone, language },
      driver: driverName ? { name: driverName, phone: driverPhone } : undefined,
      product: productName
        ? { name: productName, sku: productSku || undefined }
        : undefined,
      etaMinutes,
      message: message || undefined,
      policy: {
        mayCancel,
        mayReschedule,
        rescheduleWindow: mayReschedule ? { days, from, to } : undefined,
      },
    };

    try {
      await api.post("/api/calls", body);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const field = { display: "block", width: "100%", padding: 8 } as const;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        overflow: "auto",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          width: 520,
          maxWidth: "100%",
          display: "grid",
          gap: 10,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{ margin: 0 }}>Call customer</h2>
        <p style={{ margin: 0, color: "#666" }}>Order {orderRef}</p>

        <label>
          Customer name
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Customer phone
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Language
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Driver name
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Driver phone
          <input
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Product
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={field}
          />
        </label>
        <label>
          Product SKU
          <input
            value={productSku}
            onChange={(e) => setProductSku(e.target.value)}
            style={field}
          />
        </label>
        <label>
          ETA (minutes)
          <input
            type="number"
            value={etaMinutes}
            onChange={(e) => setEtaMinutes(Number(e.target.value))}
            style={field}
          />
        </label>
        <label>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={field}
          />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={mayCancel}
            onChange={(e) => setMayCancel(e.target.checked)}
          />
          May cancel
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={mayReschedule}
            onChange={(e) => setMayReschedule(e.target.checked)}
          />
          May reschedule
        </label>

        {mayReschedule ? (
          <>
            <label>
              Reschedule days (comma separated)
              <input
                value={daysText}
                onChange={(e) => setDaysText(e.target.value)}
                style={field}
              />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ flex: 1 }}>
                From
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={field}
                />
              </label>
              <label style={{ flex: 1 }}>
                To
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={field}
                />
              </label>
            </div>
          </>
        ) : null}

        {error ? <p style={{ color: "crimson", margin: 0 }}>{error}</p> : null}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ padding: 10 }}
          >
            Cancel
          </button>
          <button type="submit" disabled={busy} style={{ padding: 10 }}>
            {busy ? "Placing…" : "Place call"}
          </button>
        </div>
      </form>
    </div>
  );
}
