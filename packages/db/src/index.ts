import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/prisma/client";
import { config } from "@repo/config";

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export type TransactionClient = Prisma.TransactionClient;

export { Prisma };
