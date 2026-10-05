import type { Prisma, PrismaClient } from "@prisma/client"

/** Either the root client or an interactive-transaction client. */
export type Db = PrismaClient | Prisma.TransactionClient

export interface AuditEntry {
  actorId?: string | null
  action: string
  entityType: string
  entityId: string
  /** Ids, counts and statuses only. NEVER medical content, document names or coordinates. */
  metadata?: Prisma.InputJsonValue
}

export async function writeAudit(db: Db, entry: AuditEntry): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata ?? undefined,
    },
  })
}
