function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable ${name}`);
  }
  return value;
}

const databaseUrl = readRequiredEnv("DATABASE_URL");
const redisUrl = readRequiredEnv("REDIS_URL");
const port = Number(process.env.PORT ?? "3001");

export const config = {
  DATABASE_URL: databaseUrl,
  REDIS_URL: redisUrl,
  PORT: port,
  COMMANDS_STREAM: process.env.COMMANDS_STREAM ?? "relay:commands",

  LIVEKIT_URL: process.env.LIVEKIT_URL ?? "",
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ?? "",
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ?? "",
  TTS_VOICE: process.env.TTS_VOICE ?? "",
};
