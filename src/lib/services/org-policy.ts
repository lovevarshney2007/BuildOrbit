import type { OrganizationPolicy } from "@prisma/client"
import { DateKey, dateKeyToDate, dateToDateKey } from "@/lib/domain/dates"
import { WorkingCalendar } from "@/lib/domain/leave-days"
import { PayrollPolicy } from "@/lib/domain/payroll-calc"
import type { Db } from "./audit"

/** Organisation configuration row (created with defaults on first use). */
export async function getOrganizationPolicy(db: Db): Promise<OrganizationPolicy> {
  return db.organizationPolicy.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  })
}

/** Weekly-off days + holidays covering [start, end] — the working-day policy. */
export async function loadWorkingCalendar(
  db: Db,
  start: DateKey,
  end: DateKey,
  policy?: OrganizationPolicy,
): Promise<WorkingCalendar> {
  const org = policy ?? (await getOrganizationPolicy(db))
  const holidays = await db.holiday.findMany({
    where: { date: { gte: dateKeyToDate(start), lte: dateKeyToDate(end) } },
    select: { date: true },
  })
  return {
    weeklyOffDays: org.weeklyOffDays,
    holidays: new Set(holidays.map((h) => dateToDateKey(h.date))),
  }
}

export function toPayrollPolicy(org: OrganizationPolicy): PayrollPolicy {
  return {
    divisorMode: org.payrollDivisorMode,
    fixedDivisor: org.payrollFixedDivisor,
    rounding: org.payrollRounding,
  }
}

/** Default allowance/deduction percentages from organisation policy. */
export function toPayrollDefaults(org: OrganizationPolicy) {
  return {
    allowancePercent: org.allowancePercent,
    deductionPercent: org.deductionPercent,
  }
}
