import type { NextFunction, Request, Response } from "express";

export function allowBrowserCalls(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
