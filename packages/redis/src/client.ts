import { createClient } from "redis";
import { config } from "@repo/config";

export const publisher = createClient({ url: config.REDIS_URL });

export const connectRedis = async (): Promise<void> => {
  await publisher.connect();
};

export const createRedisConnection = async () => {
  const client = createClient({ url: config.REDIS_URL });
  await client.connect();
  return client;
};
