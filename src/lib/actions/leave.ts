"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { redirect } from "next/navigation"
import { LeaveStatus } from "@prisma/client"
import { requireAuth } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { LeaveRequestEmail } from "@/components/emails/LeaveRequestEmail"
import type { ReactElement } from "react"

const ApplyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(1000, "Reason is too long"),
})

export type ApplyLeaveState = {
  errors?: Record<string, string[]>
  message?: string
  fields?: Record<string, string>
} | null

export async function applyLeaveAction(
  _prev: ApplyLeaveState,
  formData: FormData,
): Promise<ApplyLeaveState> {
  // 1. Authenticate - derive userId from server-side session (not from form data)
  const session = await requireAuth()
  const userId = session.userId

  const fields = {
    leaveTypeId: formData.get("leaveTypeId") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    reason: formData.get("reason") as string,
  }

  // 2. Validate input
  const validated = ApplyLeaveSchema.safeParse(fields)

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, fields }
  }

  const { leaveTypeId, startDate, endDate, reason } = validated.data

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { errors: { startDate: ["Invalid date provided."] }, fields }
  }

  if (start.getFullYear() > 2100 || end.getFullYear() > 2100) {
    return { errors: { endDate: ["Year is too far in the future."] }, fields }
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (end < start) {
    return { errors: { endDate: ["End date must be on or after start date."] }, fields }
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1

  // 3. Verify leave type exists and is active
  const leaveTypeRecord = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } })
  if (!leaveTypeRecord || !leaveTypeRecord.isActive) {
    return { errors: { leaveTypeId: ["Leave type is not available."] }, fields }
  }

  // 4. Get employee record
  const employee = await prisma.employee.findUnique({
    where: { userId },
    include: { user: true },
  })
  if (!employee) {
    return { message: "Employee profile not found. Please contact HR." }
  }

  // 5. Check leave balance (if balance records exist for this employee/type/year)
  const year = start.getFullYear()
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: employee.id,
        leaveTypeId,
        year,
      },
    },
  })

  if (balance !== null) {
    const remaining = balance.totalDays - balance.usedDays
    if (days > remaining) {
      return {
        errors: {
          endDate: [
            `Insufficient leave balance. You have ${remaining} day(s) remaining but requested ${days} day(s).`,
          ],
        },
        fields,
      }
    }
  }

  // 6. Check for overlapping pending/approved leave requests
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      requesterId: userId,
      status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      // Check if date ranges overlap: existing.start <= new.end AND existing.end >= new.start
      startDate: { lte: end },
      endDate: { gte: start },
    },
  })

  if (overlapping) {
    return {
      errors: {
        startDate: [
          `You already have a ${overlapping.status.toLowerCase()} leave request overlapping these dates (${overlapping.startDate.toLocaleDateString()} – ${overlapping.endDate.toLocaleDateString()}).`,
        ],
      },
      fields,
    }
  }

  // 7. Create leave request
  await prisma.leaveRequest.create({
    data: {
      requesterId: userId,
      leaveTypeId,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: LeaveStatus.PENDING,
    },
  })

  // 8. Send email to HR (best-effort)
  try {
    const hrUsers = await prisma.user.findMany({ where: { role: "HR", isActive: true } })
    const hrEmails = hrUsers.map((u) => u.email)

    if (hrEmails.length > 0 && employee.user.name) {
      await sendEmail({
        to: hrEmails,
        subject: `New Leave Request: ${employee.user.name}`,
        react: LeaveRequestEmail({
          employeeName: employee.user.name,
          leaveType: leaveTypeRecord.name,
          startDate: start,
          endDate: end,
          reason,
          days,
        }) as ReactElement,
      })
    }
  } catch (error) {
    console.error("Failed to send leave request email", error)
  }

  redirect("/workforce/leave")
}
