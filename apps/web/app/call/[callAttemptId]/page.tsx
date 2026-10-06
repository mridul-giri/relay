"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import type { CallSession } from "@repo/types";
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function CallPage({
  params,
}: {
  params: Promise<{ callAttemptId: string }>;
}) {
  const { callAttemptId } = use(params);
  const [session, setSession] = useState<CallSession | null>(null);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .post<CallSession>(`${API_URL}/call-attempts/${callAttemptId}/session`)
      .then((res) => setSession(res.data))
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      });
  }, [callAttemptId]);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Call unavailable</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Getting your call ready…</h1>
      </main>
    );
  }

  if (!answered) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Incoming call</h1>
        <p>
          A Relay assistant is calling about your delivery. Answer when you are
          ready.
        </p>
        <button onClick={() => setAnswered(true)}>Answer</button>
      </main>
    );
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
      onDisconnected={() => setAnswered(false)}
      onError={(err: Error) => setError(err.message)}
      style={{ padding: 24 }}
    >
      <RoomAudioRenderer />
      <h1>You are on the call</h1>
      <p>
        Just talk naturally. The assistant will explain and offer you new times.
      </p>
    </LiveKitRoom>
  );
}
