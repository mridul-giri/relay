"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CallView, Merchant } from "@repo/types";
import { api } from "../lib/api";
import { clearToken } from "../lib/session";
import { CallForm } from "./call-form";
import { CallCard } from "./call-card";

export default function DashboardPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [calls, setCalls] = useState<CallView[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api
      .get<{ merchant: Merchant }>("/api/auth/me")
      .then((res) => setMerchant(res.data.merchant))
      .catch(() => router.replace("/login"))
      .finally(() => setReady(true));
  }, [router]);

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      const res = await api.get<{ calls: CallView[] }>("/api/calls");
      setCalls(res.data.calls);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (ready && merchant) void refresh();
  }, [ready, merchant, refresh]);

  async function logout(): Promise<void> {
    clearToken();
    router.replace("/login");
  }

  if (!ready) {
    return <main style={{ padding: 32 }}>Loading…</main>;
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Calls</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#666" }}>{merchant?.name}</span>
          <button
            onClick={() => void refresh()}
            disabled={refreshing}
            style={{ padding: "8px 14px" }}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "8px 14px" }}
          >
            Call customer
          </button>
          <button onClick={logout} style={{ padding: "8px 14px" }}>
            Sign out
          </button>
        </div>
      </header>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        }}
      >
        {calls.map((call) => (
          <CallCard key={call.id} call={call} />
        ))}
      </div>

      {showForm ? (
        <CallForm
          onClose={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      ) : null}
    </main>
  );
}
