"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { CallSession } from "../../lib/types";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { CallScreen, CallTitle } from "./call-screen";
import { IncomingCallView } from "./incoming-call-view";
import { OnCallView } from "./on-call-view";
import { CallEndedView } from "./call-ended-view";

export function CallFlow({ callId }: { callId: string }) {
  const [session, setSession] = useState<CallSession | null>(null);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    axios
      .post<CallSession>(`/api/calls/${callId}/session`)
      .then((res) => setSession(res.data))
      .catch((err) => {
        const isCallEnded =
          axios.isAxiosError(err) && err.response?.status === 410;
        if (isCallEnded) {
          setEnded(true);
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      });
  }, [callId]);

  if (ended) {
    return <CallEndedView />;
  }

  if (error) {
    return (
      <CallScreen>
        <CallTitle>Call unavailable</CallTitle>
        <p className="form-error" role="alert">
          {error}
        </p>
      </CallScreen>
    );
  }

  if (!session) {
    return (
      <CallScreen>
        <CallTitle>Getting your call ready…</CallTitle>
      </CallScreen>
    );
  }

  if (!answered) {
    return <IncomingCallView onAnswer={() => setAnswered(true)} />;
  }

  return (
    <LiveKitRoom
      serverUrl={session.url}
      token={session.token}
      connect
      audio={{
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }}
      onDisconnected={() => setEnded(true)}
      onError={(err) => setError(err.message)}
      className="grid min-h-svh place-items-center bg-background! bg-dot-grid px-4 py-12 text-center [font-family:inherit]! text-inherit!"
    >
      <RoomAudioRenderer />
      <OnCallView />
    </LiveKitRoom>
  );
}
