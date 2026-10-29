import { AccessToken } from "livekit-server-sdk";
import { config } from "../config.ts";

export async function createSession(params: {
  roomName: string;
  identity: string;
  participantName: string;
}) {
  if (
    !config.LIVEKIT_URL ||
    !config.LIVEKIT_API_KEY ||
    !config.LIVEKIT_API_SECRET
  ) {
    throw new Error("LiveKit is not configured (missing LIVEKIT_* env vars)");
  }

  const access = new AccessToken(
    config.LIVEKIT_API_KEY,
    config.LIVEKIT_API_SECRET,
    {
      identity: params.identity,
      name: params.participantName,
      ttl: "30m",
    },
  );
  access.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await access.toJwt();
  return {
    url: config.LIVEKIT_URL,
    token,
    roomName: params.roomName,
  };
}
