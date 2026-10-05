import { PayrollDivisorMode, PayrollRounding } from "@prisma/client"
import { DateKey } from "./dates"
import { LeaveBucket } from "./leave-policy"
import { WorkingCalendar, listWorkingDays } from "./leave-days"
import { monthRange, daysInMonth } from "./dates"

/** One approved leave day (or half day) inside a payroll period. */
export interface LeaveDayEntry {
  date: DateKey
  /** 1 for a full day, 0.5 for a half day */
  fraction: number
  bucket: LeaveBucket
  /** Percentage of the daily rate to deduct for this day (0 for paid leave). */
  deductionPercent: number
}

export interface PayrollPolicy {
  divisorMode: PayrollDivisorMode
  fixedDivisor: number
  rounding: PayrollRounding
}

export function roundAmount(value: number, mode: PayrollRounding): number {
  switch (mode) {
    case "ROUND":
      return Math.round(value)
    case "FLOOR":
      return Math.floor(value)
    case "CEIL":
      return Math.ceil(value)
    default:
      return Math.round(value * 100) / 100
  }
}

/** Number of days a monthly salary is divided by, per the configured payroll policy. */
export function calculateDivisor(
  policy: PayrollPolicy,
  year: number,
  month: number,
  calendar: WorkingCalendar,
): number {
  switch (policy.divisorMode) {
    case "FIXED":
      return Math.max(1, policy.fixedDivisor)
    case "WORKING_DAYS": {
      const { start, end } = monthRange(year, month)
      return Math.max(1, listWorkingDays(start, end, calendar).length)
    }
    default:
      return daysInMonth(year, month)
  }
}

export function calculateDailyRate(monthlySalary: number, divisor: number): number {
  return monthlySalary / Math.max(1, divisor)
}

/** calculateSalaryDeduction — deduction for a (weighted) number of deductible days. */
export function calculateSalaryDeduction(
  monthlySalary: number,
  divisor: number,
  deductibleDays: number,
  rounding: PayrollRounding,
): number {
  if (deductibleDays <= 0) return 0
  return roundAmount(calculateDailyRate(monthlySalary, divisor) * deductibleDays, rounding)
}

export interface LeavePayrollImpact {
  paidLeaveDays: number
  unpaidLeaveDays: number
  medicalLeaveDays: number
  otherLeaveDays: number
  /** Sum of fraction * deductionPercent/100 over all entries. */
  deductibleDays: number
  divisor: number
  dailyRate: number
  leaveDeduction: number
}

/**
 * calculatePayrollImpact — pure function: approved leave entries of ONE payroll
 * period + salary + policy => day buckets and salary deduction.
 * No leave type is special-cased; everything is driven by `bucket` and `deductionPercent`.
 */
export function calculatePayrollImpact(args: {
  monthlySalary: number
  year: number
  month: number
  entries: LeaveDayEntry[]
  policy: PayrollPolicy
  calendar: WorkingCalendar
}): LeavePayrollImpact {
  const { monthlySalary, year, month, entries, policy, calendar } = args
  const { start, end } = monthRange(year, month)
  const inPeriod = entries.filter((e) => e.date >= start && e.date <= end)

  const sum = (pred: (e: LeaveDayEntry) => boolean) =>
    inPeriod.filter(pred).reduce((acc, e) => acc + e.fraction, 0)

  const deductibleDays = inPeriod.reduce(
    (acc, e) => acc + e.fraction * (e.deductionPercent / 100),
    0,
  )
  const divisor = calculateDivisor(policy, year, month, calendar)
  return {
    paidLeaveDays: sum((e) => e.bucket === "PAID_LEAVE"),
    unpaidLeaveDays: sum((e) => e.bucket === "UNPAID_LEAVE"),
    medicalLeaveDays: sum((e) => e.bucket === "MEDICAL_LEAVE"),
    otherLeaveDays: sum((e) => e.bucket === "OTHER_LEAVE"),
    deductibleDays,
    divisor,
    dailyRate: Math.round(calculateDailyRate(monthlySalary, divisor) * 100) / 100,
    leaveDeduction: calculateSalaryDeduction(monthlySalary, divisor, deductibleDays, policy.rounding),
  }
}
