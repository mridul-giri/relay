import type { NextFunction, Request, Response } from "express";
import { InvalidInputError } from "@repo/core";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const message = err instanceof Error ? err.message : String(err);
  const status = err instanceof InvalidInputError ? 400 : 500;
  console.error(`[api:error] request.failed status=${status} ${message}`);
  res.status(status).json({ error: message || "Internal server error" });
}
