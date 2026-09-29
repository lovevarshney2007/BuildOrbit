// BuildOrbit — Prisma Client Singleton
//
// This file creates a single PrismaClient instance that is reused across
// the entire Next.js server runtime.
//
// WHY A SINGLETON?
// In Next.js development mode, hot reload re-executes module files on every
// code change. Without the singleton pattern, each hot reload would create
// a new PrismaClient instance, exhausting the PostgreSQL connection pool.
//
// HOW IT WORKS:
// - In production (NODE_ENV === 'production'): a single module-level instance
//   is created. Module caching ensures it is only created once.
// - In development: the instance is stored on the Node.js global object.
//   The global object persists across hot reloads, so the connection is reused.
//
// IMPORTANT:
// - This file MUST remain server-only. Never import it from:
//   - Client Components ('use client')
//   - Browser-side code
//   - UI components
//   - Next.js middleware (Edge Runtime does not support Prisma)
//
// See: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

import { PrismaClient } from "@prisma/client"

// Extend the global type to hold the Prisma instance in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
