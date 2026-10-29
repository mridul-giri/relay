"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AuthResult } from "../lib/types";
import { api } from "../lib/api";
import { saveToken } from "../lib/session";
import { errorMessage } from "../lib/errors";
import { DemoNote } from "./auth-layout";
import { ArrowIcon } from "./icons";

export function SignupForm({ demoEmail }: { demoEmail: string }) {
  const router = useRouter();
  const [name, setName] = useState("Demo Merchant");
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState("demopassword");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<AuthResult>("/api/auth/signup", {
        name,
        email,
        password,
      });
      const token = res.data.token;
      saveToken(token);
      router.push("/dashboard");
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DemoNote>Demo details are filled in. Press Create account.</DemoNote>

      <label className="field">
        <span className="field-label">Name</span>
        <input
          className="input"
          type="text"
          autoComplete="organization"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Email</span>
        <input
          className="input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Password</span>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="button button-primary mt-1.5 h-11 w-full"
      >
        <span>{busy ? "Creating…" : "Create account"}</span>
        <ArrowIcon />
      </button>
    </form>
  );
}
