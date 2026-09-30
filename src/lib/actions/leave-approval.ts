"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LeaveStatus } from "@prisma/client"
import { requireAuth } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { LeaveApprovalEmail } from "@/components/emails/LeaveApprovalEmail"
import type { ReactElement } from "react"

export async function approveLeaveAction(requestId: string, approverId: string, action: "approve" | "reject") {
  const session = await requireAuth()
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(session.role)) {
    throw new Error("Unauthorized")
  }

  const status = action === "approve" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED

  const updatedRequest = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      approverId,
      approvedAt: new Date(),
    },
    include: {
      requester: true,
      leaveType: true,
    }
  })

  // Send email to employee
  try {
    const userEmail = updatedRequest.requester?.email
    const userName = updatedRequest.requester?.name
    const leaveTypeName = updatedRequest.leaveType?.name
    
    if (userEmail && userName && leaveTypeName) {
      await sendEmail({
        to: userEmail,
        subject: `Leave Request ${status === LeaveStatus.APPROVED ? "Approved" : "Rejected"}`,
        react: LeaveApprovalEmail({
          employeeName: userName,
          leaveType: leaveTypeName,
          startDate: updatedRequest.startDate,
          endDate: updatedRequest.endDate,
          status,
        }) as ReactElement,
      })
    }
  } catch (error) {
    console.error("Failed to send leave approval email", error)
  }

  revalidatePath("/hr/leave-approval")
  revalidatePath("/workforce/leave")
  revalidatePath("/dashboard")
}
