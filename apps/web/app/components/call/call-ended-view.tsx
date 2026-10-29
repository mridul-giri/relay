"use client";

import { useEffect, useState } from "react";
import { CallScreen, CallTitle } from "./call-screen";

const CLOSE_AFTER_SECONDS = 5;

export function CallEndedView() {
  const [secondsLeft, setSecondsLeft] = useState(CLOSE_AFTER_SECONDS);
  const [closeBlocked, setCloseBlocked] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timerId = window.setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft > 0) return;
    window.close();
    const fallbackId = window.setTimeout(() => setCloseBlocked(true), 300);
    return () => window.clearTimeout(fallbackId);
  }, [secondsLeft]);

  const closingText = closeBlocked
    ? "You can close this tab now."
    : `This page will close in ${secondsLeft}s.`;

  return (
    <CallScreen>
      <p className="pixel chip inline-flex items-center gap-2.5 text-sm">
        Call ended
      </p>
      <CallTitle>This call has ended</CallTitle>
      <p className="text-pretty text-muted-foreground">
        Thanks for your time. There is nothing more to do here.
      </p>
      <p className="pixel text-muted-foreground" aria-live="polite">
        {closingText}
      </p>
    </CallScreen>
  );
}
