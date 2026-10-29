import jwt from "jsonwebtoken";
import { config } from "../config.ts";

export function signMerchantToken(merchantId: string) {
  const token = jwt.sign({ merchantId }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

export function readMerchantId(token: string) {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const isObject = typeof payload === "object" && payload !== null;
    if (!isObject) return null;

    const merchantId = payload.merchantId;
    if (typeof merchantId !== "string") return null;
    return merchantId;
  } catch {
    return null;
  }
}
