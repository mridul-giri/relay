"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthResult } from "@repo/types";
import { api } from "../lib/api";
import { saveToken } from "../lib/session";
import { errorMessage } from "../lib/errors";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("Demo Merchant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<AuthResult>("/api/auth/signup", {
        name,
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
      <h1>Create account</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </label>
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
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p>
        Already have one? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}
