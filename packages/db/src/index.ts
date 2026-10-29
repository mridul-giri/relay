import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export { Prisma };
export {
  CallStatus,
  CallOutcome,
  TranscriptSpeaker,
} from "./generated/prisma/client";
export type { Call, Merchant, TranscriptTurn } from "./generated/prisma/client";
