"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { redirect } from "next/navigation"
import { LeaveStatus } from "@prisma/client"

const ApplyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  userId: z.string().min(1),
})

export type ApplyLeaveState = {
  errors?: Record<string, string[]>
  message?: string
} | null

export async function applyLeaveAction(
  _prev: ApplyLeaveState,
  formData: FormData,
): Promise<ApplyLeaveState> {
  const validated = ApplyLeaveSchema.safeParse({
    leaveTypeId: formData.get("leaveTypeId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
    userId: formData.get("userId"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { leaveTypeId, startDate, endDate, reason, userId } = validated.data

  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (end < start) {
    return { errors: { endDate: ["End date must be on or after start date."] } }
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1

  // Get employee
  const employee = await prisma.employee.findFirst({ where: { userId } })
  if (!employee) {
    return { message: "Employee profile not found." }
  }

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

  redirect("/workforce/leave")
}
