"use client";

import { useEffect, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import FluidOrb from "@repo/ui/components/fluid-orb";
import { CallColumn, CallTitle } from "./call-screen";

const ORB_COLOR = "#0077b6";
const ORB_SIZE = 220;

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutesText = String(minutes).padStart(2, "0");
  const secondsText = String(seconds).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

export function OnCallView() {
  const room = useRoomContext();
  const [secondsOnCall, setSecondsOnCall] = useState(0);
  const [hangingUp, setHangingUp] = useState(false);

  async function hangUp() {
    setHangingUp(true);
    await room.disconnect();
    window.close();
  }

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSecondsOnCall((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const durationText = formatDuration(secondsOnCall);

  return (
    <CallColumn>
      <div className="relative mb-2 grid size-[260px] place-items-center">
        <span
          className="pointer-events-none absolute inset-5 rounded-full border border-[rgb(58_160_220/0.45)] animate-ring-out motion-reduce:animate-none motion-reduce:opacity-40"
          aria-hidden
        />
        <FluidOrb
          size={ORB_SIZE}
          color={ORB_COLOR}
          className="animate-orb-rise motion-reduce:animate-orb-fade"
          aria-hidden
        />
      </div>

      <p className="pixel inline-flex items-center gap-2.5 text-sm">
        <span className="chip chip-live">On call</span>
        <span className="mono text-muted-foreground">{durationText}</span>
      </p>
      <CallTitle>You are on the call</CallTitle>
      <p className="text-pretty text-muted-foreground">
        Just talk naturally. The assistant will explain and offer you new times.
      </p>
      <button
        type="button"
        onClick={() => void hangUp()}
        disabled={hangingUp}
        className="button button-danger mt-2.5 h-[46px] min-w-[180px]"
      >
        {hangingUp ? "Hanging up…" : "Hang up"}
      </button>
    </CallColumn>
  );
}
