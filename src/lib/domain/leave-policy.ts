import { LeaveStatus, Role } from "@prisma/client"
import { DateKey } from "./dates"

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

/** Valid leave state transitions. Anything not listed is rejected. */
export const LEAVE_TRANSITIONS: Record<LeaveStatus, LeaveStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
}

export function canTransition(from: LeaveStatus, to: LeaveStatus): boolean {
  return LEAVE_TRANSITIONS[from].includes(to)
}

export function assertTransition(from: LeaveStatus, to: LeaveStatus): void {
  if (!canTransition(from, to)) {
    throw new LeaveError(
      "INVALID_TRANSITION",
      `Cannot change a leave request from ${from.toLowerCase()} to ${to.toLowerCase()}.`,
    )
  }
}

export type LeaveErrorCode =
  | "INVALID_TRANSITION"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION"
  | "INSUFFICIENT_BALANCE"
  | "OVERLAP"
  | "DOCUMENT_REQUIRED"
  | "DOCUMENT_INVALID"
  | "NOT_ELIGIBLE"
  | "PAYROLL_LOCKED"

export class LeaveError extends Error {
  constructor(
    public readonly code: LeaveErrorCode,
    message: string,
    public readonly field?: string,
  ) {
    super(message)
    this.name = "LeaveError"
  }
}

// ---------------------------------------------------------------------------
// Leave type policy helpers (rules come from the database row, not from UI)
// ---------------------------------------------------------------------------

export interface LeaveTypePolicy {
  isActive: boolean
  requiresDocument: boolean
  documentRequiredAfterDays: number | null
  maxConsecutiveDays: number | null
  allowHalfDay: boolean
  minServiceDays: number
  applicableRoles: Role[]
}

/**
 * A supporting document is required only if the leave type says so, and — when
 * `documentRequiredAfterDays` is configured — only for requests longer than X days.
 */
export function isDocumentRequired(policy: LeaveTypePolicy, requestedDays: number): boolean {
  if (!policy.requiresDocument) return false
  if (policy.documentRequiredAfterDays == null) return true
  return requestedDays > policy.documentRequiredAfterDays
}

export interface EligibilityInput {
  role: Role
  joiningDate: Date
  employeeActive: boolean
  today: DateKey
}

/** Returns an error message when the employee cannot use this leave type, otherwise null. */
export function checkEligibility(policy: LeaveTypePolicy, input: EligibilityInput): string | null {
  if (!policy.isActive) return "This leave type is not available."
  if (!input.employeeActive) return "Only active employees can apply for leave."
  if (policy.applicableRoles.length > 0 && !policy.applicableRoles.includes(input.role)) {
    return "This leave type is not applicable to your role."
  }
  if (policy.minServiceDays > 0) {
    const joined = input.joiningDate.toISOString().slice(0, 10)
    const served = Math.floor(
      (Date.parse(input.today) - Date.parse(joined)) / (24 * 60 * 60 * 1000),
    )
    if (served < policy.minServiceDays) {
      return `You become eligible for this leave type after ${policy.minServiceDays} days of service.`
    }
  }
  return null
}

/** Longest run of consecutive CALENDAR days covered by a request (weekends bridging included). */
export function consecutiveSpanDays(start: DateKey, end: DateKey): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / (24 * 60 * 60 * 1000)) + 1
}

/** Minimal leave-type shape needed by classification. */
export interface LeaveClassificationInput {
  category: "GENERAL" | "MEDICAL" | "OTHER"
  isPaid: boolean
}

export type LeaveBucket = "PAID_LEAVE" | "UNPAID_LEAVE" | "MEDICAL_LEAVE" | "OTHER_LEAVE"

/** Reporting bucket for a leave. Medical and Other categories are reported on their own. */
export function classifyLeave(lt: LeaveClassificationInput): LeaveBucket {
  if (lt.category === "MEDICAL") return "MEDICAL_LEAVE"
  if (lt.category === "OTHER") return "OTHER_LEAVE"
  return lt.isPaid ? "PAID_LEAVE" : "UNPAID_LEAVE"
}
