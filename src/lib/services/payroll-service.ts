/**
 * Centralised payroll service. The ONLY place leave-related salary impact is
 * calculated; leave pages, payroll pages, employee pages and dashboards read
 * the persisted result (or call these functions) instead of re-deriving it.
 *
 * Payroll state rules
 *   DRAFT      -> recalculated automatically whenever approved leave changes
 *   PROCESSED  -> never changed silently. A PENDING PayrollAdjustment is created;
 *                 HR applies it via explicit `recalculatePayroll`.
 *   PAID       -> immutable. A PENDING PayrollAdjustment is created and carried
 *                 into the employee's next DRAFT payroll as `carriedAdjustments`.
 */
import { PayrollStatus, Prisma } from "@prisma/client"
import type { Payroll } from "@prisma/client"
import {
  DateKey, dateKeyToDate, dateToDateKey, monthOf, monthRange, yearOf,
} from "@/lib/domain/dates"
import { listWorkingDays } from "@/lib/domain/leave-days"
import { classifyLeave, LeaveError } from "@/lib/domain/leave-policy"
import { LeaveDayEntry, calculatePayrollImpact, LeavePayrollImpact } from "@/lib/domain/payroll-calc"
import { Actor, assertCan } from "@/lib/domain/permissions"
import { Db, writeAudit } from "./audit"
import { getOrganizationPolicy, loadWorkingCalendar, toPayrollPolicy } from "./org-policy"

const r2 = (n: number) => Math.round(n * 100) / 100
const num = (d: Prisma.Decimal | number | null | undefined) => (d == null ? 0 : Number(d))

/** Approved leave expressed as per-day entries for one payroll period. */
export async function loadLeaveEntries(
  db: Db,
  userId: string,
  year: number,
  month: number,
): Promise<LeaveDayEntry[]> {
  const { start, end } = monthRange(year, month)
  const calendar = await loadWorkingCalendar(db, start, end)
  const requests = await db.leaveRequest.findMany({
    where: {
      requesterId: userId,
      status: "APPROVED",
      startDate: { lte: dateKeyToDate(end) },
      endDate: { gte: dateKeyToDate(start) },
    },
    include: { leaveType: true },
  })
  const entries: LeaveDayEntry[] = []
  for (const req of requests) {
    const from = dateToDateKey(req.startDate) > start ? dateToDateKey(req.startDate) : start
    const to = dateToDateKey(req.endDate) < end ? dateToDateKey(req.endDate) : end
    const bucket = classifyLeave(req.leaveType)
    const percent =
      req.deductionPercentSnapshot ??
      (req.leaveType.payrollImpact === "DEDUCTION" ? req.leaveType.payrollDeductionPercent : 0)
    for (const date of listWorkingDays(from, to, calendar)) {
      entries.push({ date, fraction: req.isHalfDay ? 0.5 : 1, bucket, deductionPercent: percent })
    }
  }
  return entries
}

/** calculatePayrollImpact for a real employee + period (loads policy, calendar, leave). */
export async function calculatePayrollImpactFor(
  db: Db,
  args: { userId: string; monthlySalary: number; year: number; month: number },
): Promise<LeavePayrollImpact> {
  const org = await getOrganizationPolicy(db)
  const { start, end } = monthRange(args.year, args.month)
  const calendar = await loadWorkingCalendar(db, start, end, org)
  const entries = await loadLeaveEntries(db, args.userId, args.year, args.month)
  return calculatePayrollImpact({
    monthlySalary: args.monthlySalary,
    year: args.year,
    month: args.month,
    entries,
    policy: toPayrollPolicy(org),
    calendar,
  })
}

/** Pending adjustments from PAID payrolls that will be deducted in the next draft payroll. */
async function carryableAdjustments(db: Db, employeeId: string): Promise<number> {
  const rows = await db.payrollAdjustment.findMany({
    where: { status: "PENDING", payroll: { employeeId, status: "PAID" } },
    select: { amount: true },
  })
  return r2(rows.reduce((a, r) => a + num(r.amount), 0))
}

interface Figures {
  impact: LeavePayrollImpact
  otherDeductions: number
  carried: number
  deductions: number
  netSalary: number
}

function assemble(
  basic: number,
  allowances: number,
  otherDeductions: number,
  carried: number,
  impact: LeavePayrollImpact,
): Figures {
  const gross = basic + allowances
  const raw = otherDeductions + impact.leaveDeduction + carried
  const deductions = r2(Math.min(Math.max(raw, 0), gross))
  return { impact, otherDeductions, carried, deductions, netSalary: r2(gross - deductions) }
}

function payrollFields(f: Figures) {
  return {
    otherDeductions: f.otherDeductions,
    leaveDeduction: f.impact.leaveDeduction,
    carriedAdjustments: f.carried,
    paidLeaveDays: f.impact.paidLeaveDays,
    unpaidLeaveDays: f.impact.unpaidLeaveDays,
    medicalLeaveDays: f.impact.medicalLeaveDays,
    otherLeaveDays: f.impact.otherLeaveDays,
    dailyRate: f.impact.dailyRate,
    deductions: f.deductions,
    netSalary: f.netSalary,
    calculatedAt: new Date(),
  }
}

/** Non-leave deductions of an existing payroll (legacy rows treat all deductions as manual). */
function manualDeductionsOf(p: Payroll): number {
  if (p.otherDeductions != null) return num(p.otherDeductions)
  return p.calculatedAt ? 0 : num(p.deductions)
}

async function employeeUserId(db: Db, employeeId: string): Promise<string> {
  const e = await db.employee.findUniqueOrThrow({ where: { id: employeeId }, select: { userId: true } })
  return e.userId
}

async function recalcDraft(db: Db, payroll: Payroll): Promise<Payroll> {
  const userId = await employeeUserId(db, payroll.employeeId)
  const impact = await calculatePayrollImpactFor(db, {
    userId, monthlySalary: num(payroll.basicSalary), year: payroll.year, month: payroll.month,
  })
  const carried = await carryableAdjustments(db, payroll.employeeId)
  const f = assemble(num(payroll.basicSalary), num(payroll.allowances), manualDeductionsOf(payroll), carried, impact)
  return db.payroll.update({ where: { id: payroll.id }, data: payrollFields(f) })
}

// ---------------------------------------------------------------------------
// Create / generate
// ---------------------------------------------------------------------------

export async function createPayrollRecord(
  db: Prisma.TransactionClient | import("@prisma/client").PrismaClient,
  input: {
    employeeId: string; month: number; year: number
    basicSalary: number; allowances: number; deductions: number; notes?: string | null
    actorId?: string | null
  },
): Promise<Payroll> {
  const userId = await employeeUserId(db, input.employeeId)
  const impact = await calculatePayrollImpactFor(db, {
    userId, monthlySalary: input.basicSalary, year: input.year, month: input.month,
  })
  const carried = await carryableAdjustments(db, input.employeeId)
  const f = assemble(input.basicSalary, input.allowances, input.deductions, carried, impact)
  const created = await db.payroll.create({
    data: {
      employeeId: input.employeeId,
      month: input.month,
      year: input.year,
      basicSalary: input.basicSalary,
      allowances: input.allowances,
      notes: input.notes ?? null,
      status: PayrollStatus.DRAFT,
      ...payrollFields(f),
    },
  })
  await writeAudit(db, {
    actorId: input.actorId, action: "PAYROLL_CREATED", entityType: "Payroll", entityId: created.id,
    metadata: { month: input.month, year: input.year, leaveDeduction: f.impact.leaveDeduction },
  })
  return created
}

// ---------------------------------------------------------------------------
// Leave -> payroll synchronisation (called inside the leave transaction)
// ---------------------------------------------------------------------------

export interface PayrollSyncResult {
  recalculatedDrafts: number
  adjustmentsCreated: number
}

export async function syncPayrollForLeaveChange(
  tx: Prisma.TransactionClient,
  args: { employeeId: string; userId: string; dates: DateKey[]; leaveRequestId: string; actorId?: string | null; reason: string },
): Promise<PayrollSyncResult> {
  const periods = new Map<string, { year: number; month: number }>()
  for (const d of args.dates) periods.set(`${yearOf(d)}-${monthOf(d)}`, { year: yearOf(d), month: monthOf(d) })

  const result: PayrollSyncResult = { recalculatedDrafts: 0, adjustmentsCreated: 0 }
  for (const { year, month } of periods.values()) {
    const payroll = await tx.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: args.employeeId, month, year } },
      include: { adjustments: true },
    })
    if (!payroll) continue // nothing generated yet; generation will pick the leave up

    if (payroll.status === "DRAFT") {
      await recalcDraft(tx, payroll)
      result.recalculatedDrafts++
      continue
    }

    const impact = await calculatePayrollImpactFor(tx, {
      userId: args.userId, monthlySalary: num(payroll.basicSalary), year, month,
    })
    const alreadyAccounted =
      num(payroll.leaveDeduction) +
      payroll.adjustments.filter((a) => a.status !== "DISMISSED").reduce((s, a) => s + num(a.amount), 0)
    const delta = r2(impact.leaveDeduction - alreadyAccounted)
    if (Math.abs(delta) >= 0.01) {
      const adj = await tx.payrollAdjustment.create({
        data: {
          payrollId: payroll.id,
          leaveRequestId: args.leaveRequestId,
          amount: delta,
          reason: args.reason,
          createdById: args.actorId ?? null,
        },
      })
      await writeAudit(tx, {
        actorId: args.actorId, action: "PAYROLL_ADJUSTMENT_CREATED", entityType: "PayrollAdjustment", entityId: adj.id,
        metadata: { payrollId: payroll.id, payrollStatus: payroll.status, amount: delta },
      })
      result.adjustmentsCreated++
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Explicit workflows
// ---------------------------------------------------------------------------

type RootDb = import("@prisma/client").PrismaClient

/** DRAFT: recalculates. PROCESSED: explicit recalculation that applies pending adjustments. PAID: refused. */
export async function recalculatePayroll(db: RootDb, args: { actor: Actor; payrollId: string }): Promise<Payroll> {
  assertCan(args.actor.role, "payroll:manage")
  return db.$transaction(async (tx) => {
    const payroll = await tx.payroll.findUnique({ where: { id: args.payrollId } })
    if (!payroll) throw new LeaveError("NOT_FOUND", "Payroll record not found")
    if (payroll.status === "PAID") {
      throw new LeaveError(
        "PAYROLL_LOCKED",
        "Paid payroll cannot be modified. Pending adjustments are carried into the next payroll.",
      )
    }
    const updated = await recalcDraft(tx, payroll)
    if (payroll.status === "PROCESSED") {
      // the recalculation now contains the leave effect these adjustments described
      await tx.payrollAdjustment.updateMany({
        where: { payrollId: payroll.id, status: "PENDING" },
        data: { status: "APPLIED", appliedPayrollId: payroll.id, appliedAt: new Date() },
      })
    }
    await writeAudit(tx, {
      actorId: args.actor.userId, action: "PAYROLL_RECALCULATED", entityType: "Payroll", entityId: payroll.id,
      metadata: { status: payroll.status, netSalary: num(updated.netSalary) },
    })
    return updated
  })
}

export async function processPayroll(db: RootDb, args: { actor: Actor; payrollId: string }): Promise<Payroll> {
  assertCan(args.actor.role, "payroll:manage")
  return db.$transaction(async (tx) => {
    const payroll = await tx.payroll.findUnique({ where: { id: args.payrollId } })
    if (!payroll) throw new LeaveError("NOT_FOUND", "Payroll record not found")
    if (payroll.status !== "DRAFT") {
      throw new LeaveError("INVALID_TRANSITION", `Cannot transition payroll from ${payroll.status} to PROCESSED.`)
    }
    const fresh = await recalcDraft(tx, payroll) // lock-in the latest leave effect
    const carried = await tx.payrollAdjustment.findMany({
      where: { status: "PENDING", payroll: { employeeId: payroll.employeeId, status: "PAID" } },
      select: { id: true },
    })
    await tx.payrollAdjustment.updateMany({
      where: { id: { in: carried.map((c) => c.id) } },
      data: { status: "APPLIED", appliedPayrollId: payroll.id, appliedAt: new Date() },
    })
    const updated = await tx.payroll.update({ where: { id: fresh.id }, data: { status: "PROCESSED" } })
    await writeAudit(tx, {
      actorId: args.actor.userId, action: "PAYROLL_PROCESSED", entityType: "Payroll", entityId: payroll.id,
      metadata: { carriedAdjustments: carried.length },
    })
    return updated
  })
}

export async function markPayrollPaid(db: RootDb, args: { actor: Actor; payrollId: string }): Promise<Payroll> {
  assertCan(args.actor.role, "payroll:manage")
  return db.$transaction(async (tx) => {
    const payroll = await tx.payroll.findUnique({ where: { id: args.payrollId } })
    if (!payroll) throw new LeaveError("NOT_FOUND", "Payroll record not found")
    if (payroll.status !== "PROCESSED") {
      throw new LeaveError("INVALID_TRANSITION", `Cannot transition payroll from ${payroll.status} to PAID.`)
    }
    const updated = await tx.payroll.update({
      where: { id: payroll.id },
      data: { status: "PAID", paidAt: new Date() },
    })
    await writeAudit(tx, {
      actorId: args.actor.userId, action: "PAYROLL_PAID", entityType: "Payroll", entityId: payroll.id,
    })
    return updated
  })
}

export async function dismissPayrollAdjustment(db: RootDb, args: { actor: Actor; adjustmentId: string }) {
  assertCan(args.actor.role, "payroll:manage")
  return db.$transaction(async (tx) => {
    const adj = await tx.payrollAdjustment.findUnique({ where: { id: args.adjustmentId } })
    if (!adj || adj.status !== "PENDING") throw new LeaveError("VALIDATION", "Only pending adjustments can be dismissed.")
    await tx.payrollAdjustment.update({ where: { id: adj.id }, data: { status: "DISMISSED" } })
    await writeAudit(tx, {
      actorId: args.actor.userId, action: "PAYROLL_ADJUSTMENT_DISMISSED", entityType: "PayrollAdjustment", entityId: adj.id,
    })
  })
}

/** Generates DRAFT payroll for every active employee that has none for the period. */
export async function generatePayrollForPeriod(
  db: RootDb,
  args: { actor: Actor; month: number; year: number },
): Promise<{ created: number; skipped: number }> {
  assertCan(args.actor.role, "payroll:manage")
  if (args.month < 1 || args.month > 12 || args.year < 2000 || args.year > 2100) {
    throw new LeaveError("VALIDATION", "Invalid month or year")
  }
  const employees = await db.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, basicSalary: true },
  })
  let created = 0
  let skipped = 0
  for (const emp of employees) {
    const existing = await db.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month: args.month, year: args.year } },
    })
    if (existing) { skipped++; continue }
    const basic = Math.round(num(emp.basicSalary))
    // Existing company defaults: allowances 40% of basic, standard deductions 10% of basic.
    const allowances = Math.round(basic * 0.4)
    const standardDeductions = Math.round(basic * 0.1)
    await db.$transaction((tx) =>
      createPayrollRecord(tx, {
        employeeId: emp.id, month: args.month, year: args.year,
        basicSalary: basic, allowances, deductions: standardDeductions,
        notes: `Auto-generated for ${args.month}/${args.year}`, actorId: args.actor.userId,
      }),
    )
    created++
  }
  return { created, skipped }
}
