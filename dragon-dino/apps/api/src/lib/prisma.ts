import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prismaClientSingleton = (): PrismaClient => {
  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

  client.$on("query", (e) => {
    logger.debug("Prisma query", {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });

  return client;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
