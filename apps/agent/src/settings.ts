import { config } from "@repo/config";

export function missingVoiceSettings(): string[] {
  const missing: string[] = [];
  if (!config.LIVEKIT_URL) missing.push("LIVEKIT_URL");
  if (!config.LIVEKIT_API_KEY) missing.push("LIVEKIT_API_KEY");
  if (!config.LIVEKIT_API_SECRET) missing.push("LIVEKIT_API_SECRET");
  return missing;
}
