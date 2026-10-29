import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof z.ZodError) {
    const issue = err.issues[0];
    const path = issue ? issue.path.join(".") : "";
    const reason = issue ? issue.message : "is invalid";
    const message = path === "" ? reason : `${path} ${reason}`;
    console.error(`[api:error] request.invalid status=400 ${message}`);
    res.status(400).json({ error: message });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error(`[api:error] request.failed status=500 ${message}`);
  res.status(500).json({ error: message || "Internal server error" });
}
