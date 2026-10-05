import type { LeaveBalance, LeaveType, Prisma } from "@prisma/client"
import { LeaveError } from "@/lib/domain/leave-policy"
import type { Db } from "./audit"

/**
 * Centralised leave-balance model (used by every page, report and action):
 *
 *   remaining = totalDays - usedDays - pendingDays
 *
 *   PENDING   -> reserve   : pendingDays += days
 *   APPROVED  -> consume   : pendingDays -= days ; usedDays += days
 *   REJECTED  -> release   : pendingDays -= days
 *   CANCELLED (was pending)  -> release : pendingDays -= days
 *   CANCELLED (was approved) -> restore : usedDays    -= days
 */
export interface BalanceSummary {
  allocated: number
  used: number
  pending: number
  available: number
}

const EPS = 1e-9

export function summarizeBalance(b: Pick<LeaveBalance, "totalDays" | "usedDays" | "pendingDays">): BalanceSummary {
  const available = Math.max(0, b.totalDays - b.usedDays - b.pendingDays)
  return { allocated: b.totalDays, used: b.usedDays, pending: b.pendingDays, available }
}

/** calculateLeaveBalance — available days for a request check. */
export function calculateLeaveBalance(b: Pick<LeaveBalance, "totalDays" | "usedDays" | "pendingDays">): number {
  return summarizeBalance(b).available
}

type TypeForBalance = Pick<
  LeaveType,
  "id" | "daysAllowed" | "carryForwardAllowed" | "carryForwardMaxDays" | "tracksBalance"
>

export async function getOrCreateBalance(
  db: Db,
  employeeId: string,
  leaveType: TypeForBalance,
  year: number,
): Promise<LeaveBalance> {
  const where = { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: leaveType.id, year } }
  const existing = await db.leaveBalance.findUnique({ where })
  if (existing) return existing

  let carried = 0
  if (leaveType.carryForwardAllowed) {
    const prev = await db.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: leaveType.id, year: year - 1 } },
    })
    if (prev) {
      carried = Math.min(summarizeBalance(prev).available, Math.max(0, leaveType.carryForwardMaxDays))
    }
  }
  return db.leaveBalance.upsert({
    where,
    update: {},
    create: {
      employeeId,
      leaveTypeId: leaveType.id,
      year,
      totalDays: leaveType.daysAllowed + carried,
      carriedForwardDays: carried,
    },
  })
}

/** Row-level lock so two concurrent approvals / applications cannot overspend a balance. */
export async function lockBalance(tx: Prisma.TransactionClient, balanceId: string): Promise<LeaveBalance> {
  await tx.$queryRaw`SELECT id FROM leave_balances WHERE id = ${balanceId} FOR UPDATE`
  return tx.leaveBalance.findUniqueOrThrow({ where: { id: balanceId } })
}

export async function reserveDays(tx: Prisma.TransactionClient, balanceId: string, days: number): Promise<void> {
  const b = await lockBalance(tx, balanceId)
  if (calculateLeaveBalance(b) + EPS < days) {
    throw new LeaveError(
      "INSUFFICIENT_BALANCE",
      `Insufficient leave balance. You have ${calculateLeaveBalance(b)} day(s) available but requested ${days} day(s).`,
      "endDate",
    )
  }
  await tx.leaveBalance.update({ where: { id: balanceId }, data: { pendingDays: b.pendingDays + days } })
}

export async function releaseReservation(tx: Prisma.TransactionClient, balanceId: string, days: number): Promise<void> {
  const b = await lockBalance(tx, balanceId)
  await tx.leaveBalance.update({
    where: { id: balanceId },
    data: { pendingDays: Math.max(0, b.pendingDays - days) },
  })
}

/** Approve: convert the reservation (if any) into permanent usage. */
export async function consumeDays(tx: Prisma.TransactionClient, balanceId: string, days: number): Promise<void> {
  const b = await lockBalance(tx, balanceId)
  const reserved = Math.min(b.pendingDays, days)
  const pendingAfter = b.pendingDays - reserved
  const usedAfter = b.usedDays + days
  if (usedAfter + pendingAfter > b.totalDays + EPS) {
    throw new LeaveError(
      "INSUFFICIENT_BALANCE",
      `Cannot approve: only ${calculateLeaveBalance({ ...b, pendingDays: pendingAfter })} day(s) remain in the employee's balance.`,
    )
  }
  await tx.leaveBalance.update({
    where: { id: balanceId },
    data: { pendingDays: pendingAfter, usedDays: usedAfter },
  })
}

/** Cancel an approved leave: give the days back. */
export async function restoreDays(tx: Prisma.TransactionClient, balanceId: string, days: number): Promise<void> {
  const b = await lockBalance(tx, balanceId)
  await tx.leaveBalance.update({
    where: { id: balanceId },
    data: { usedDays: Math.max(0, b.usedDays - days) },
  })
}
