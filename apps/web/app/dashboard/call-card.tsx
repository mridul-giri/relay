"use client";

import Link from "next/link";
import type { CallView } from "../lib/types";
import { ArrowIcon } from "../components/icons";

const STATUS_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  CALLING: "Live",
  ENDED: "Ended",
};

const STATUS_CHIP: Record<string, string> = {
  QUEUED: "",
  CALLING: "chip-live",
  ENDED: "chip-ended",
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
  const statusChip = STATUS_CHIP[call.status] ?? "";
  const outcomeText = call.outcome
    ? (OUTCOME_LABEL[call.outcome] ?? call.outcome)
    : null;
  const hasTranscript = call.transcripts.length > 0;
  const hasCallEnded = call.status === "ENDED";
  const callPagePath = `/call/${call.id}`;

  return (
    <article className="panel grid min-h-[280px] grid-rows-[auto_1fr_auto] gap-[18px] px-5 pt-5 pb-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-2">
          <h3 className="pixel text-xl leading-[1.1] wrap-anywhere text-foreground">
            {call.customerName}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <span className={`chip ${statusChip}`}>{statusText}</span>
            {outcomeText ? (
              <span className="font-pixel text-foreground">
                · {outcomeText}
              </span>
            ) : null}
          </div>
        </div>
        <span className="mono shrink-0 text-xs text-faint">
          {call.orderRef}
        </span>
      </div>

      <div className="grid max-h-[220px] content-start gap-2.5 overflow-auto rounded-lg border border-border bg-well p-3">
        {hasTranscript ? (
          call.transcripts.map((turn, index) => {
            const isAgent = turn.speaker === "AGENT";
            const speakerClass = isAgent
              ? "text-xs text-brand-text"
              : "text-xs text-faint";
            return (
              <div key={index} className="grid gap-0.5">
                <span className={`pixel ${speakerClass}`}>
                  {isAgent ? "Agent" : "Customer"}
                </span>
                <span className="text-sm leading-[1.45] text-foreground">
                  {turn.text}
                </span>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-faint">No transcript yet.</span>
        )}
      </div>

      <div className="flex">
        {hasCallEnded ? (
          <button
            type="button"
            disabled
            className="button button-quiet button-small"
          >
            Call ended
          </button>
        ) : (
          <Link
            href={callPagePath}
            target="_blank"
            className="button button-quiet button-small"
          >
            <span>Answer this call</span>
            <ArrowIcon />
          </Link>
        )}
      </div>
    </article>
  );
}
