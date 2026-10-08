"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthResult } from "@repo/types";
import { api } from "../lib/api";
import { saveToken } from "../lib/session";
import { errorMessage } from "../lib/errors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@relay.local");
  const [password, setPassword] = useState("demopassword");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<AuthResult>("/api/auth/login", {
        email,
        password,
      });
      saveToken(res.data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        padding: 32,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 360,
      }}
    >
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </label>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        No account? <Link href="/signup">Create one</Link>
      </p>
    </main>
  );
}
