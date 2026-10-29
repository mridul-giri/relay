"use client";

import { useState } from "react";
import { ArrowIcon, CheckIcon, CloseIcon } from "../components/icons";

interface CallLinkNoticeProps {
  callUrl: string;
  onClose: () => void;
}

export function CallLinkNotice({ callUrl, onClose }: CallLinkNoticeProps) {
  const [clickState, setClickState] = useState("idle");

  async function openAndCopyLink() {
    window.open(callUrl, "_blank");
    try {
      await navigator.clipboard.writeText(callUrl);
      setClickState("opened-and-copied");
    } catch {
      setClickState("opened");
    }
  }

  const hintText =
    clickState === "opened-and-copied"
      ? "Opened · link copied"
      : clickState === "opened"
        ? "Opened"
        : "Click to open";
  const hasOpened = clickState !== "idle";

  return (
    <div className="notice-wrap" aria-live="polite">
      <div className="notice">
        <button
          type="button"
          className="notice-copy"
          onClick={() => void openAndCopyLink()}
          aria-label={`Open call page and copy link ${callUrl}`}
        >
          <span className="notice-head">
            <span className="pixel notice-title chip chip-live">
              Call placed
            </span>
            <span
              className="pixel notice-hint"
              data-copied={hasOpened ? "true" : "false"}
            >
              {hasOpened ? <CheckIcon /> : <ArrowIcon />}
              {hintText}
            </span>
          </span>
          <span className="mono notice-url">{callUrl}</span>
        </button>

        <button
          type="button"
          className="notice-close"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
