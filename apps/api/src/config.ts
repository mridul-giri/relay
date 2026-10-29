function readRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable ${name}`);
  }
  return value;
}

const jwtSecret = readRequiredEnv("JWT_SECRET");
const port = Number(process.env.PORT ?? "3001");

export const config = {
  JWT_SECRET: jwtSecret,
  PORT: port,
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  LIVEKIT_URL: process.env.LIVEKIT_URL ?? "",
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ?? "",
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ?? "",
};
