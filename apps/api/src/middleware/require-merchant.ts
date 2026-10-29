import type { NextFunction, Request, Response } from "express";
import { readMerchantId } from "../auth/tokens.ts";

export function requireMerchant(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.header("authorization") ?? "";

  const [scheme, token] = header.split(" ");
  const isBearer = scheme === "Bearer";
  if (!isBearer || !token) {
    res.status(401).json({ error: "not signed in" });
    return;
  }

  const merchantId = readMerchantId(token);
  if (!merchantId) {
    res.status(401).json({ error: "invalid session" });
    return;
  }

  res.locals.merchantId = merchantId;
  next();
}
