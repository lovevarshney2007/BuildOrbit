/**
 * Leave workflow service: apply -> (document) -> review -> balance -> attendance -> payroll -> audit.
 * Framework-free (no Next.js imports) so it is callable from server actions,
 * route handlers, reports and automated tests alike.
 */
import type { HalfDayPeriod, LeaveDocumentType, LeaveRequest, PrismaClient, Prisma } from "@prisma/client"
import {
  DateKey, dateKeyToDate, dateToDateKey, isValidDateKey, todayKey, yearOf, addDays,
} from "@/lib/domain/dates"
import { calculateLeaveDays } from "@/lib/domain/leave-days"
import {
  LeaveError, assertTransition, checkEligibility, consecutiveSpanDays, isDocumentRequired,
} from "@/lib/domain/leave-policy"
import { Actor, can } from "@/lib/domain/permissions"
import { validateSupportingDocument } from "@/lib/domain/document-validation"
import { writeAudit } from "./audit"
import {
  consumeDays, getOrCreateBalance, releaseReservation, reserveDays, restoreDays,
} from "./leave-balance"
import { getOrganizationPolicy, loadWorkingCalendar } from "./org-policy"
import { syncPayrollForLeaveChange } from "./payroll-service"
import { deleteObject, generateStorageKey, putObject } from "./private-storage"

export const MAX_BACKDATE_DAYS = 30
export const MAX_ADVANCE_DAYS = 366
export const MIN_REASON_LENGTH = 5
export const MAX_REASON_LENGTH = 1000

export interface LeaveDocumentUpload {
  bytes: Uint8Array
  filename: string
  declaredMime?: string | null
  documentType: LeaveDocumentType
}

export interface ApplyLeaveInput {
  actor: Actor
  leaveTypeId: string
  startDate: string
  endDate: string
  isHalfDay?: boolean
  halfDayPeriod?: HalfDayPeriod | null
  reason: string
  document?: LeaveDocumentUpload | null
  now?: Date
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

export async function applyLeave(db: PrismaClient, input: ApplyLeaveInput): Promise<LeaveRequest> {
  const { actor } = input
  if (!can(actor.role, "leave:apply")) {
    throw new LeaveError("FORBIDDEN", "Admins and Super Admins do not need to apply for leave.")
  }

  const reason = input.reason?.trim() ?? ""
  if (reason.length < MIN_REASON_LENGTH) {
    throw new LeaveError("VALIDATION", `Reason must be at least ${MIN_REASON_LENGTH} characters`, "reason")
  }
  if (reason.length > MAX_REASON_LENGTH) throw new LeaveError("VALIDATION", "Reason is too long", "reason")
  if (!isValidDateKey(input.startDate)) throw new LeaveError("VALIDATION", "Invalid date provided.", "startDate")
  if (!isValidDateKey(input.endDate)) throw new LeaveError("VALIDATION", "Invalid date provided.", "endDate")
  const start: DateKey = input.startDate
  const end: DateKey = input.endDate
  if (end < start) throw new LeaveError("VALIDATION", "End date must be on or after start date.", "endDate")
  if (yearOf(start) !== yearOf(end)) {
    throw new LeaveError("VALIDATION", "A leave request cannot span two calendar years. Please split it into two requests.", "endDate")
  }

  const org = await getOrganizationPolicy(db)
  const today = todayKey(org.timezone, input.now)
  if (start < addDays(today, -MAX_BACKDATE_DAYS)) {
    throw new LeaveError("VALIDATION", `Leave cannot be applied for dates more than ${MAX_BACKDATE_DAYS} days in the past.`, "startDate")
  }
  if (end > addDays(today, MAX_ADVANCE_DAYS)) {
    throw new LeaveError("VALIDATION", "Year is too far in the future.", "endDate")
  }

  const employee = await db.employee.findUnique({ where: { userId: actor.userId } })
  if (!employee) throw new LeaveError("VALIDATION", "Employee profile not found. Please contact HR.")

  const leaveType = await db.leaveType.findUnique({ where: { id: input.leaveTypeId } })
  if (!leaveType || !leaveType.isActive) {
    throw new LeaveError("VALIDATION", "Leave type is not available.", "leaveTypeId")
  }

  const eligibility = checkEligibility(leaveType, {
    role: actor.role,
    joiningDate: employee.joiningDate,
    employeeActive: employee.status === "ACTIVE",
    today,
  })
  if (eligibility) throw new LeaveError("NOT_ELIGIBLE", eligibility, "leaveTypeId")

  // Leave days from the single calculation service + working-day/holiday policy.
  const isHalfDay = !!input.isHalfDay
  if (isHalfDay && !leaveType.allowHalfDay) {
    throw new LeaveError("VALIDATION", "Half-day is not allowed for this leave type.", "halfDay")
  }
  const calendar = await loadWorkingCalendar(db, start, end, org)
  let calc
  try {
    calc = calculateLeaveDays({ startDate: start, endDate: end, isHalfDay, calendar })
  } catch (e) {
    throw new LeaveError("VALIDATION", (e as Error).message, "endDate")
  }
  if (calc.days <= 0) {
    throw new LeaveError("VALIDATION", "The selected dates contain no working days (weekends/holidays are excluded).", "startDate")
  }
  const days = calc.days
  const halfDayPeriod: HalfDayPeriod | null = isHalfDay ? (input.halfDayPeriod ?? "FIRST_HALF") : null

  if (leaveType.maxConsecutiveDays != null && consecutiveSpanDays(start, end) > leaveType.maxConsecutiveDays) {
    throw new LeaveError(
      "VALIDATION",
      `${leaveType.name} allows at most ${leaveType.maxConsecutiveDays} consecutive day(s).`,
      "endDate",
    )
  }

  // Overlap (pending/approved). Two opposite half-days on the same date may coexist.
  const overlapping = await db.leaveRequest.findMany({
    where: {
      requesterId: actor.userId,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: dateKeyToDate(end) },
      endDate: { gte: dateKeyToDate(start) },
    },
  })
  const clash = overlapping.find((o) => {
    const bothHalfSameDay =
      isHalfDay && o.isHalfDay && o.halfDayPeriod && o.halfDayPeriod !== halfDayPeriod
    return !bothHalfSameDay
  })
  if (clash) {
    throw new LeaveError(
      "OVERLAP",
      `You already have a ${clash.status.toLowerCase()} leave request overlapping these dates (${dateToDateKey(clash.startDate)} – ${dateToDateKey(clash.endDate)}).`,
      "startDate",
    )
  }

  // Supporting document policy (config-driven).
  const documentRequired = isDocumentRequired(leaveType, days)
  let validatedDoc: ReturnType<typeof validateSupportingDocument> | null = null
  if (input.document && input.document.bytes.length > 0) {
    validatedDoc = validateSupportingDocument({
      bytes: input.document.bytes,
      filename: input.document.filename,
      declaredMime: input.document.declaredMime,
      maxBytes: org.maxDocumentSizeMb * 1024 * 1024,
    })
    if (!validatedDoc.ok) throw new LeaveError("DOCUMENT_INVALID", validatedDoc.error, "document")
  } else if (documentRequired) {
    throw new LeaveError(
      "DOCUMENT_REQUIRED",
      `${leaveType.name} requires a supporting document (prescription / medical certificate / report).`,
      "document",
    )
  }

  const year = yearOf(start)
  let storedKey: string | null = null
  try {
    return await db.$transaction(async (tx) => {
      if (leaveType.tracksBalance) {
        const balance = await getOrCreateBalance(tx, employee.id, leaveType, year)
        await reserveDays(tx, balance.id, days)
      }

      const request = await tx.leaveRequest.create({
        data: {
          requesterId: actor.userId,
          leaveTypeId: leaveType.id,
          startDate: dateKeyToDate(start),
          endDate: dateKeyToDate(end),
          days,
          isHalfDay,
          halfDayPeriod,
          reason,
          status: "PENDING",
        },
      })

      if (validatedDoc && validatedDoc.ok && input.document) {
        storedKey = generateStorageKey("leave-documents", employee.id, validatedDoc.extension)
        await putObject(storedKey, input.document.bytes)
        await tx.leaveDocument.create({
          data: {
            leaveRequestId: request.id,
            employeeId: employee.id,
            documentType: input.document.documentType,
            originalFilename: validatedDoc.filename,
            storageKey: storedKey,
            mimeType: validatedDoc.mime,
            sizeBytes: input.document.bytes.length,
            uploadedById: actor.userId,
          },
        })
      }

      await writeAudit(tx, {
        actorId: actor.userId, action: "LEAVE_APPLIED", entityType: "LeaveRequest", entityId: request.id,
        metadata: { leaveTypeId: leaveType.id, days, hasDocument: !!storedKey },
      })

      if (!leaveType.requiresApproval) {
        return approveInTransaction(tx, {
          requestId: request.id, actorId: null, note: "Auto-approved (leave type does not require approval)", auto: true,
        })
      }
      return request
    })
  } catch (err) {
    if (storedKey) await deleteObject(storedKey).catch(() => undefined)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Review (approve / reject)
// ---------------------------------------------------------------------------

export interface ReviewLeaveInput {
  actor: Actor
  requestId: string
  decision: "APPROVE" | "REJECT"
  note?: string | null
}

export async function reviewLeave(db: PrismaClient, input: ReviewLeaveInput): Promise<LeaveRequest> {
  const { actor } = input
  if (!can(actor.role, "leave:review")) throw new LeaveError("FORBIDDEN", "Unauthorized")
  return db.$transaction(async (tx) => {
    if (input.decision === "APPROVE") {
      return approveInTransaction(tx, { requestId: input.requestId, actorId: actor.userId, note: input.note ?? null })
    }
    return rejectInTransaction(tx, { requestId: input.requestId, actorId: actor.userId, note: input.note ?? null })
  })
}

async function lockRequest(tx: Prisma.TransactionClient, requestId: string) {
  await tx.$queryRaw`SELECT id FROM leave_requests WHERE id = ${requestId} FOR UPDATE`
  const req = await tx.leaveRequest.findUnique({
    where: { id: requestId },
    include: { leaveType: true, requester: { include: { employee: true } } },
  })
  if (!req) throw new LeaveError("NOT_FOUND", "Leave request not found")
  return req
}

async function rejectInTransaction(
  tx: Prisma.TransactionClient,
  args: { requestId: string; actorId: string; note: string | null },
): Promise<LeaveRequest> {
  const req = await lockRequest(tx, args.requestId)
  if (req.requesterId === args.actorId) throw new LeaveError("FORBIDDEN", "You cannot review your own leave request.")
  assertTransition(req.status, "REJECTED")

  if (req.leaveType.tracksBalance && req.requester.employee) {
    const balance = await getOrCreateBalance(tx, req.requester.employee.id, req.leaveType, yearOf(dateToDateKey(req.startDate)))
    await releaseReservation(tx, balance.id, req.days)
  }
  const updated = await tx.leaveRequest.update({
    where: { id: req.id },
    data: { status: "REJECTED", approverId: args.actorId, approverNote: args.note, approvedAt: new Date() },
  })
  await writeAudit(tx, {
    actorId: args.actorId, action: "LEAVE_REJECTED", entityType: "LeaveRequest", entityId: req.id,
    metadata: { days: req.days, leaveTypeId: req.leaveTypeId },
  })
  return updated
}

async function approveInTransaction(
  tx: Prisma.TransactionClient,
  args: { requestId: string; actorId: string | null; note: string | null; auto?: boolean },
): Promise<LeaveRequest> {
  const req = await lockRequest(tx, args.requestId)                                 // 1-3 authn/z done by caller; status loaded
  if (args.actorId && req.requesterId === args.actorId) {
    throw new LeaveError("FORBIDDEN", "You cannot review your own leave request.")
  }
  assertTransition(req.status, "APPROVED")                                          // 3. valid transition
  const employee = req.requester.employee
  if (!employee) throw new LeaveError("VALIDATION", "Employee profile not found for this request.")

  const startKey = dateToDateKey(req.startDate)
  const endKey = dateToDateKey(req.endDate)
  const org = await getOrganizationPolicy(tx)
  const calendar = await loadWorkingCalendar(tx, startKey, endKey, org)
  const { workingDates } = calculateLeaveDays({ startDate: startKey, endDate: endKey, isHalfDay: req.isHalfDay, calendar })

  // 4-5. balance + policy: reservation becomes permanent usage
  if (req.leaveType.tracksBalance) {
    const balance = await getOrCreateBalance(tx, employee.id, req.leaveType, yearOf(startKey))
    await consumeDays(tx, balance.id, req.days)
  }

  // 6. request
  const deductionPercent = req.leaveType.payrollImpact === "DEDUCTION" ? req.leaveType.payrollDeductionPercent : 0
  const updated = await tx.leaveRequest.update({
    where: { id: req.id },
    data: {
      status: "APPROVED",
      approverId: args.actorId,
      approverNote: args.note,
      approvedAt: new Date(),
      paidSnapshot: req.leaveType.isPaid,
      deductionPercentSnapshot: deductionPercent,
    },
  })

  // 7. attendance — never leave a contradictory record behind
  const records = await tx.attendance.findMany({
    where: { employeeId: employee.id, date: { in: workingDates.map(dateKeyToDate) } },
  })
  const byDate = new Map(records.map((r) => [dateToDateKey(r.date), r]))
  for (const date of workingDates) {
    const existing = byDate.get(date)
    if (existing && existing.checkIn && !req.isHalfDay) {
      throw new LeaveError(
        "VALIDATION",
        `Cannot approve: the employee already has attendance checked in on ${date}. Resolve the attendance record first.`,
      )
    }
    const data = {
      status: req.isHalfDay ? ("HALF_DAY" as const) : ("ON_LEAVE" as const),
      source: "LEAVE_SYSTEM" as const,
      leaveRequestId: req.id,
      leaveTypeId: req.leaveTypeId,
    }
    if (existing) {
      await tx.attendance.update({ where: { id: existing.id }, data })
    } else {
      await tx.attendance.create({ data: { employeeId: employee.id, date: dateKeyToDate(date), ...data } })
    }
  }

  // 8-9. payroll impact (DRAFT recalculated, PROCESSED/PAID get an explicit adjustment)
  const payroll = await syncPayrollForLeaveChange(tx, {
    employeeId: employee.id,
    userId: req.requesterId,
    dates: workingDates,
    leaveRequestId: req.id,
    actorId: args.actorId,
    reason: "Leave approved",
  })

  // 10. audit
  await writeAudit(tx, {
    actorId: args.actorId,
    action: args.auto ? "LEAVE_AUTO_APPROVED" : "LEAVE_APPROVED",
    entityType: "LeaveRequest",
    entityId: req.id,
    metadata: { days: req.days, leaveTypeId: req.leaveTypeId, attendanceDays: workingDates.length, ...payroll },
  })
  return updated
}

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export interface CancelLeaveInput {
  actor: Actor
  requestId: string
  reason?: string | null
  now?: Date
}

export async function cancelLeave(db: PrismaClient, input: CancelLeaveInput): Promise<LeaveRequest> {
  const { actor } = input
  return db.$transaction(async (tx) => {
    const req = await lockRequest(tx, input.requestId)
    const isOwner = req.requesterId === actor.userId
    const isReviewer = can(actor.role, "leave:review")
    if (!isOwner && !isReviewer) throw new LeaveError("FORBIDDEN", "You cannot cancel this leave request.")
    assertTransition(req.status, "CANCELLED")

    const startKey = dateToDateKey(req.startDate)
    const endKey = dateToDateKey(req.endDate)
    const employee = req.requester.employee

    if (req.status === "APPROVED" && isOwner && !isReviewer) {
      const org = await getOrganizationPolicy(tx)
      if (startKey <= todayKey(org.timezone, input.now)) {
        throw new LeaveError("VALIDATION", "Leave that has already started can only be cancelled by HR.")
      }
    }

    if (employee && req.leaveType.tracksBalance) {
      const balance = await getOrCreateBalance(tx, employee.id, req.leaveType, yearOf(startKey))
      if (req.status === "PENDING") await releaseReservation(tx, balance.id, req.days)
      else await restoreDays(tx, balance.id, req.days)
    }

    let affectedDates: DateKey[] = []
    if (req.status === "APPROVED" && employee) {
      const rows = await tx.attendance.findMany({ where: { leaveRequestId: req.id } })
      affectedDates = rows.map((r) => dateToDateKey(r.date))
      for (const row of rows) {
        if (row.checkIn) {
          // worked part of a half-day: keep the presence, drop the leave link
          await tx.attendance.update({
            where: { id: row.id },
            data: { status: "PRESENT", leaveRequestId: null, leaveTypeId: null },
          })
        } else {
          await tx.attendance.delete({ where: { id: row.id } })
        }
      }
    }

    const wasApproved = req.status === "APPROVED"
    const updated = await tx.leaveRequest.update({
      where: { id: req.id },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: input.reason ?? null },
    })

    if (wasApproved && employee && affectedDates.length > 0) {
      await syncPayrollForLeaveChange(tx, {
        employeeId: employee.id,
        userId: req.requesterId,
        dates: affectedDates,
        leaveRequestId: req.id,
        actorId: actor.userId,
        reason: "Approved leave cancelled",
      })
    }
    await writeAudit(tx, {
      actorId: actor.userId, action: "LEAVE_CANCELLED", entityType: "LeaveRequest", entityId: req.id,
      metadata: { wasApproved, days: req.days },
    })
    return updated
  })
}
