"use client";

import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { errorMessage } from "../lib/errors";
import { ArrowIcon } from "../components/icons";

function localTimeFromNow(offsetDays: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const time = `${String(hour).padStart(2, "0")}:00`;
  return `${day}T${time}`;
}

interface CallFormProps {
  onClose: () => void;
  onPlaced: (callId: string) => void;
}

export function CallForm({ onClose, onPlaced }: CallFormProps) {
  const [requestId] = useState(() => crypto.randomUUID());
  const [orderRef] = useState(
    () => `SHOP-${Math.floor(Math.random() * 90000) + 10000}`,
  );
  const [customerName, setCustomerName] = useState("Harvey");
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
  const [slotTimes, setSlotTimes] = useState(() => [
    localTimeFromNow(1, 12),
    localTimeFromNow(1, 14),
    localTimeFromNow(1, 16),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const filledTimes = slotTimes.filter((time) => time !== "");
    const slots = filledTimes.map((time) => new Date(time).toISOString());

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
        slots: mayReschedule ? slots : [],
      },
    };

    try {
      const res = await api.post<{ callId: string }>("/api/calls", body);
      const callId = res.data.callId;
      onPlaced(callId);
    } catch (err) {
      const text = errorMessage(err);
      setError(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto bg-[rgb(5_5_6/0.78)] px-4 py-8 backdrop-blur-[3px]">
      <form
        onSubmit={submit}
        className="panel grid w-[640px] max-w-full gap-[26px] px-6 pt-7 pb-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-form-title"
      >
        <div className="grid gap-1.5">
          <h2
            id="call-form-title"
            className="pixel text-[28px] leading-[1.1] text-foreground"
          >
            Call customer
          </h2>
          <p className="mono text-[13px] text-muted-foreground">
            Order {orderRef}
          </p>
        </div>

        <fieldset className="grid gap-3.5 border-0">
          <legend className="pixel mb-0.5 border-b border-border pb-2 text-sm text-foreground">
            Customer
          </legend>
          <div className="grid gap-3.5 min-[560px]:grid-cols-2">
            <label className="field">
              <span className="field-label">Name</span>
              <input
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Phone</span>
              <input
                className="input mono"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Language</span>
            <input
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3.5 border-0">
          <legend className="pixel mb-0.5 border-b border-border pb-2 text-sm text-foreground">
            Delivery
          </legend>
          <div className="grid gap-3.5 min-[560px]:grid-cols-2">
            <label className="field">
              <span className="field-label">Driver name</span>
              <input
                className="input"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Driver phone</span>
              <input
                className="input mono"
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3.5 min-[560px]:grid-cols-2">
            <label className="field">
              <span className="field-label">Product</span>
              <input
                className="input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Product SKU</span>
              <input
                className="input mono"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">ETA (minutes)</span>
            <input
              className="input mono"
              type="number"
              min={0}
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field-label">Message</span>
            <textarea
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3.5 border-0">
          <legend className="pixel mb-0.5 border-b border-border pb-2 text-sm text-foreground">
            What the agent may do
          </legend>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <label className="check">
              <input
                type="checkbox"
                checked={mayCancel}
                onChange={(e) => setMayCancel(e.target.checked)}
              />
              May cancel
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={mayReschedule}
                onChange={(e) => setMayReschedule(e.target.checked)}
              />
              May reschedule
            </label>
          </div>

          {mayReschedule ? (
            <div className="grid gap-3.5">
              {slotTimes.map((time, index) => (
                <label key={index} className="field">
                  <span className="field-label">New time {index + 1}</span>
                  <input
                    className="input mono"
                    type="datetime-local"
                    value={time}
                    onChange={(e) => {
                      const nextTimes = [...slotTimes];
                      nextTimes[index] = e.target.value;
                      setSlotTimes(nextTimes);
                    }}
                  />
                </label>
              ))}
            </div>
          ) : null}
        </fieldset>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="button button-quiet"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="button button-primary"
          >
            <span>{busy ? "Placing…" : "Place call"}</span>
            <ArrowIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
