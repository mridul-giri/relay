"use client";

import Link from "next/link";
import type { CallView } from "@repo/types";

const STATUS_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  CALLING: "Live",
  ENDED: "Ended",
};

const OUTCOME_LABEL: Record<string, string> = {
  RESCHEDULED: "Rescheduled",
  CANCELLATION_REQUESTED: "Cancellation requested",
  HUMAN_REQUESTED: "Human requested",
  NO_DECISION: "No decision",
  NO_ANSWER: "No answer",
  FAILED: "Failed",
};

export function CallCard({ call }: { call: CallView }) {
  const statusText = STATUS_LABEL[call.status] ?? call.status;
  const outcomeText = call.outcome
    ? (OUTCOME_LABEL[call.outcome] ?? call.outcome)
    : null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <strong>{call.customerName}</strong>
        <span style={{ color: "#666" }}>{call.orderRef}</span>
      </div>

      <div style={{ marginTop: 4, color: "#666" }}>
        {statusText}
        {outcomeText ? ` — ${outcomeText}` : ""}
      </div>

      <p style={{ marginTop: 8 }}>
        <Link href={`/call/${call.id}`} target="_blank">
          Answer this call
        </Link>
      </p>

      <div
        style={{ maxHeight: 220, overflow: "auto", display: "grid", gap: 6 }}
      >
        {call.transcripts.length === 0 ? (
          <span style={{ color: "#999" }}>No transcript yet.</span>
        ) : (
          call.transcripts.map((turn, index) => (
            <div key={index}>
              <strong>
                {turn.speaker === "AGENT" ? "Agent" : "Customer"}:
              </strong>{" "}
              {turn.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
