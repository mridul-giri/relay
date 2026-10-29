"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CallView, Merchant } from "../lib/types";
import { api } from "../lib/api";
import { clearToken } from "../lib/session";
import { ArrowIcon } from "../components/icons";
import { CallForm } from "./call-form";
import { CallCard } from "./call-card";
import { CallLinkNotice } from "./call-link-notice";

async function readMerchant() {
  const res = await api.get<{ merchant: Merchant }>("/api/auth/me");
  return res.data.merchant;
}

async function readCalls() {
  const res = await api.get<{ calls: CallView[] }>("/api/calls");
  return res.data.calls;
}

export default function DashboardPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [calls, setCalls] = useState<CallView[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [placedCallUrl, setPlacedCallUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const signedInMerchant = await readMerchant();
        setMerchant(signedInMerchant);
      } catch {
        router.replace("/login");
        return;
      } finally {
        setReady(true);
      }

      const savedCalls = await readCalls();
      setCalls(savedCalls);
    }

    void loadDashboard();
  }, [router]);

  async function refresh() {
    setRefreshing(true);
    try {
      const savedCalls = await readCalls();
      setCalls(savedCalls);
    } finally {
      setRefreshing(false);
    }
  }

  async function logout() {
    clearToken();
    router.replace("/login");
  }

  function closeForm() {
    setShowForm(false);
  }

  function handleCallPlaced(callId: string) {
    setShowForm(false);
    const siteOrigin = window.location.origin;
    const callUrl = `${siteOrigin}/call/${callId}`;
    setPlacedCallUrl(callUrl);
    void refresh();
  }

  function closeNotice() {
    setPlacedCallUrl(null);
  }

  if (!ready) {
    return (
      <main className="pixel grid min-h-svh place-items-center text-[15px] text-muted-foreground">
        Loading…
      </main>
    );
  }

  const callCountText = calls.length === 1 ? "1 call" : `${calls.length} calls`;
  const hasCalls = calls.length > 0;

  return (
    <main className="min-h-svh px-4 pb-16 min-[720px]:px-8 min-[720px]:pb-20">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
          <span className="pixel inline-flex items-baseline gap-1 text-[22px] text-foreground">
            Relay
            <span className="size-1.5 bg-primary" aria-hidden />
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1.5 text-sm text-muted-foreground">
              {merchant?.name}
            </span>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              className="button button-quiet button-small"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="button button-quiet button-small"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mt-12 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-baseline gap-3.5">
            <h1 className="pixel text-[clamp(36px,5vw,52px)] leading-none text-foreground">
              Calls
            </h1>
            <span className="pixel text-[15px] text-muted-foreground">
              {callCountText}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="button button-primary"
          >
            <span>Call customer</span>
            <ArrowIcon />
          </button>
        </div>

        {hasCalls ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
            {calls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        ) : (
          <section className="panel grid max-w-[520px] justify-items-start gap-3.5 px-7 pt-8 pb-9">
            <h2 className="pixel text-[22px] text-foreground">No calls yet</h2>
            <p className="text-muted-foreground">
              Place a call and the agent will phone the customer about their
              delivery. Each call shows up here with its live transcript.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="button button-primary"
            >
              <span>Call customer</span>
              <ArrowIcon />
            </button>
          </section>
        )}
      </div>

      {showForm ? (
        <CallForm onClose={closeForm} onPlaced={handleCallPlaced} />
      ) : null}

      {placedCallUrl ? (
        <CallLinkNotice
          key={placedCallUrl}
          callUrl={placedCallUrl}
          onClose={closeNotice}
        />
      ) : null}
    </main>
  );
}
