import jwt from "jsonwebtoken";
import { config } from "@repo/config";

export function signMerchantToken(merchantId: string): string {
  const token = jwt.sign({ merchantId }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

export function readMerchantId(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const isObject = typeof payload === "object" && payload !== null;
    if (!isObject) return null;

    const merchantId = (payload as { merchantId?: unknown }).merchantId;
    if (typeof merchantId !== "string") return null;
    return merchantId;
  } catch {
    return null;
  }
}
