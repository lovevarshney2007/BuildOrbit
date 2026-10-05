"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { LeaveApprovalEmail } from "@/components/emails/LeaveApprovalEmail"
import type { ReactElement } from "react"
import { reviewLeave } from "@/lib/services/leave-service"
import { Role, LeaveStatus } from "@prisma/client"
import { LeaveError } from "@/lib/domain/leave-policy"

export async function approveLeaveAction(
  requestId: string,
  _legacyApproverId: string, // kept for backward compatibility with existing calls but ignored
  action: "approve" | "reject",
  approverNote?: string,
) {
  const session = await requireAuth()
  
  let leaveRequest;
  try {
    leaveRequest = await reviewLeave(prisma, {
      actor: { userId: session.userId, role: session.role as Role },
      requestId,
      decision: action === "approve" ? "APPROVE" : "REJECT",
      note: approverNote,
    })
  } catch (err) {
    console.error("approveLeaveAction error:", err);
    if (err instanceof LeaveError) {
      throw new Error(err.message)
    }
    throw err
  }

  // Send email to employee (best-effort)
  try {
    const populatedRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        leaveType: true,
      }
    })

    const userEmail = populatedRequest?.requester?.email
    const userName = populatedRequest?.requester?.name
    const leaveTypeName = populatedRequest?.leaveType?.name

    if (userEmail && userName && leaveTypeName) {
      await sendEmail({
        to: userEmail,
        subject: `Leave Request ${leaveRequest.status === LeaveStatus.APPROVED ? "Approved" : "Rejected"}`,
        react: LeaveApprovalEmail({
          employeeName: userName,
          leaveType: leaveTypeName,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          status: leaveRequest.status as "APPROVED" | "REJECTED",
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
