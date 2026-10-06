"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { LeaveRequestEmail } from "@/components/emails/LeaveRequestEmail"
import type { ReactElement } from "react"
import { applyLeave } from "@/lib/services/leave-service"
import { LeaveError } from "@/lib/domain/leave-policy"
import { Role } from "@prisma/client"

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
  const session = await requireAuth()

  const fields = {
    leaveTypeId: formData.get("leaveTypeId") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    reason: formData.get("reason") as string,
  }

  const validated = ApplyLeaveSchema.safeParse(fields)

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, fields }
  }

  const { leaveTypeId, startDate, endDate, reason } = validated.data

  let documentInput = null;
  const medicalCert = formData.get("medicalCertificate") as File | null;
  
  if (medicalCert && medicalCert.size > 0) {
    const arrayBuffer = await medicalCert.arrayBuffer();
    documentInput = {
      bytes: new Uint8Array(arrayBuffer),
      filename: medicalCert.name,
      declaredMime: medicalCert.type,
      documentType: "MEDICAL_CERTIFICATE" as const
    };
  }

  let leaveRequest;
  try {
    leaveRequest = await applyLeave(prisma, {
      actor: { userId: session.userId, role: session.role as Role },
      leaveTypeId,
      startDate,
      endDate,
      reason,
      document: documentInput
    })
  } catch (err) {
    if (err instanceof LeaveError) {
      if (err.field) {
        return { errors: { [err.field]: [err.message] }, fields }
      }
      return { message: err.message, fields }
    }
    console.error(err)
    let errorMessage = "Unknown error"
    if (err instanceof Error) {
      errorMessage = err.message
    } else if (typeof err === "object" && err !== null) {
      errorMessage = JSON.stringify(err)
    } else {
      errorMessage = String(err)
    }
    return { message: `An unexpected error occurred: ${errorMessage}`, fields }
  }

  // Send email to HR (best-effort)
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: session.userId },
      include: { user: true },
    })
    const leaveTypeRecord = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } })
    if (employee && leaveTypeRecord) {
      const hrUsers = await prisma.user.findMany({ where: { role: "HR", isActive: true } })
      if (hrUsers.length > 0 && employee.user.name) {
        // Send email to HR
        const hrEmails = hrUsers.map((u) => u.email)
        await sendEmail({
          to: hrEmails,
          subject: `New Leave Request: ${employee.user.name}`,
          react: LeaveRequestEmail({
            employeeName: employee.user.name,
            leaveType: leaveTypeRecord.name,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            reason,
            days: leaveRequest.days,
          }) as ReactElement,
        })
        
        // In-app notification to all HRs
        const { createNotification } = await import("@/lib/actions/notifications")
        await Promise.all(hrUsers.map(hr => 
          createNotification({
            userId: hr.id,
            type: "LEAVE_APPLIED",
            title: "New Leave Request",
            message: `${employee.user.name} applied for ${leaveTypeRecord.name}.`,
            link: "/hr/leave-approval",
          })
        ))
      }
    }
  } catch (error) {
    console.error("Failed to send leave request email", error)
  }

  redirect("/workforce/leave")
}
