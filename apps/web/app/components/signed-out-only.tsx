"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { clearToken } from "../lib/session";

export function SignedOutOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then(() => router.replace("/dashboard"))
      .catch(() => {
        clearToken();
        setShowPage(true);
      });
  }, [router]);

  return showPage ? children : null;
}
