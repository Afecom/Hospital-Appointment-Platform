import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Use globalThis for broader environment compatibility
// Provide a PrismaClient subclass that injects the adapter by default
export class PrismaClient extends GeneratedPrismaClient {
  constructor(
    options?: ConstructorParameters<typeof GeneratedPrismaClient>[0]
  ) {
    const opts = (options ? { ...options } : {}) as any;
    if (!opts.adapter) opts.adapter = adapter;
    super(opts);
  }
}

// Use globalThis for broader environment compatibility and memoize instance
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/prisma/client";
